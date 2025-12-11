#!/bin/bash
#
# Guardian Network Monitor
# ========================
# Monitors network connections, detects C2 communication, blocks suspicious IPs
# Runs every 30 seconds via systemd timer
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="network"
START_TIME=$(get_epoch)

# Allowed outbound ports
ALLOWED_OUTBOUND_PORTS=(
    "22"    # SSH
    "25"    # SMTP
    "53"    # DNS
    "80"    # HTTP
    "443"   # HTTPS
    "1337"  # Strapi
    "5432"  # PostgreSQL
    "587"   # SMTP submission
    "465"   # SMTPS
)

# =============================================================================
# NETWORK CHECKS
# =============================================================================

# Check for connections to known C2 IPs
check_c2_connections() {
    local found=false
    
    for c2_ip in "${C2_IPS[@]}"; do
        # Check with ss
        local connections=$(ss -tn 2>/dev/null | grep "$c2_ip")
        
        if [[ -n "$connections" ]]; then
            alert_critical "ACTIVE CONNECTION TO C2 IP: $c2_ip" "$SCRIPT_NAME" \
                "Known malicious IP detected!
Connections:
$connections" \
                "[AUTO] Blocking IP with iptables"
            
            # Auto-block
            if [[ "$AUTO_BLOCK_IPS" == "true" ]]; then
                iptables -A OUTPUT -d "$c2_ip" -j DROP 2>/dev/null
                iptables -A INPUT -s "$c2_ip" -j DROP 2>/dev/null
                alert_critical "IP BLOCKED: $c2_ip" "$SCRIPT_NAME" \
                    "Added iptables rules to block $c2_ip" \
                    "iptables -A OUTPUT -d $c2_ip -j DROP"
            fi
            
            found=true
        fi
        
        # Check with netstat as backup
        connections=$(netstat -tn 2>/dev/null | grep "$c2_ip")
        if [[ -n "$connections" ]]; then
            alert_critical "C2 CONNECTION (netstat): $c2_ip" "$SCRIPT_NAME" \
                "$connections"
            found=true
        fi
    done
    
    echo "$found"
}

# Check for connections to malicious domains
check_malicious_domains() {
    for domain in "${MALICIOUS_DOMAINS[@]}"; do
        # Check recent DNS queries in syslog
        if grep -q "$domain" /var/log/syslog 2>/dev/null; then
            alert_warning "DNS query for malicious domain: $domain" "$SCRIPT_NAME" \
                "Domain '$domain' was queried recently
Check /var/log/syslog for details"
        fi
        
        # Try to resolve and check if any active connection
        local resolved_ip=$(dig +short "$domain" A 2>/dev/null | head -1)
        if [[ -n "$resolved_ip" ]]; then
            local conn=$(ss -tn 2>/dev/null | grep "$resolved_ip")
            if [[ -n "$conn" ]]; then
                alert_critical "CONNECTION TO MALICIOUS DOMAIN: $domain" "$SCRIPT_NAME" \
                    "Domain: $domain
Resolved IP: $resolved_ip
Active connections:
$conn" \
                    "[AUTO] Blocking resolved IP"
                
                if [[ "$AUTO_BLOCK_IPS" == "true" ]]; then
                    iptables -A OUTPUT -d "$resolved_ip" -j DROP 2>/dev/null
                fi
            fi
        fi
    done
}

# Check for unusual outbound ports
check_unusual_ports() {
    # Get all established outbound connections
    local connections=$(ss -tn state established 2>/dev/null | tail -n +2)
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        
        # Extract destination port
        local dest=$(echo "$line" | awk '{print $4}')
        local port=$(echo "$dest" | rev | cut -d: -f1 | rev)
        local ip=$(echo "$dest" | rev | cut -d: -f2- | rev)
        
        # Skip local connections
        [[ "$ip" == "127.0.0.1" ]] && continue
        [[ "$ip" == "::1" ]] && continue
        [[ "$ip" == "$SERVER_IP" ]] && continue
        
        # Check if port is allowed
        local allowed=false
        for allowed_port in "${ALLOWED_OUTBOUND_PORTS[@]}"; do
            if [[ "$port" == "$allowed_port" ]]; then
                allowed=true
                break
            fi
        done
        
        if [[ "$allowed" == "false" ]]; then
            # Get process info
            local pid_info=$(ss -tnp 2>/dev/null | grep "$dest" | grep -oP 'pid=\K[0-9]+' | head -1)
            local process=""
            if [[ -n "$pid_info" ]]; then
                process=$(ps -p "$pid_info" -o comm= 2>/dev/null)
            fi
            
            alert_warning "Unusual outbound connection" "$SCRIPT_NAME" \
                "Destination: $dest
Port: $port
Process: ${process:-unknown}
PID: ${pid_info:-unknown}
This port is not in the allowed list"
        fi
    done <<< "$connections"
}

# Detect potential reverse shells
check_reverse_shells() {
    # Look for common reverse shell patterns
    local shell_patterns=(
        "bash -i"
        "bash -c"
        "/dev/tcp/"
        "nc -e"
        "nc -c"
        "ncat -e"
        "python -c.*socket"
        "perl -e.*socket"
        "ruby -rsocket"
        "php -r.*fsockopen"
    )
    
    for pattern in "${shell_patterns[@]}"; do
        local found=$(ps aux | grep -E "$pattern" | grep -v grep)
        if [[ -n "$found" ]]; then
            local pid=$(echo "$found" | awk '{print $2}')
            alert_critical "POSSIBLE REVERSE SHELL DETECTED" "$SCRIPT_NAME" \
                "Pattern: $pattern
Process:
$found" \
                "[AUTO] Killing potential reverse shell"
            
            if [[ "$AUTO_KILL_SUSPICIOUS" == "true" ]]; then
                kill -9 "$pid" 2>/dev/null
            fi
        fi
    done
    
    # Check for unusual bash network connections
    local bash_network=$(lsof -i -a -c bash 2>/dev/null | grep -v "localhost")
    if [[ -n "$bash_network" ]]; then
        alert_critical "BASH HAS NETWORK CONNECTION - POSSIBLE SHELL" "$SCRIPT_NAME" \
            "Bash process has network connections:
$bash_network"
    fi
}

# Check connection count anomaly (DDoS detection)
check_connection_flood() {
    local total_connections=$(ss -tn 2>/dev/null | wc -l)
    local threshold=500
    
    if [[ $total_connections -gt $threshold ]]; then
        alert_critical "HIGH CONNECTION COUNT: $total_connections" "$SCRIPT_NAME" \
            "Total TCP connections: $total_connections
Threshold: $threshold
This could indicate:
- DDoS attack
- SYN flood
- Connection exhaustion attack"
    fi
    
    # Check connections per IP
    local top_ips=$(ss -tn 2>/dev/null | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -10)
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        
        local count=$(echo "$line" | awk '{print $1}')
        local ip=$(echo "$line" | awk '{print $2}')
        
        [[ "$ip" == "127.0.0.1" ]] && continue
        [[ "$ip" == "Local" ]] && continue
        
        if [[ $count -gt 100 ]]; then
            alert_warning "High connection count from single IP" "$SCRIPT_NAME" \
                "IP: $ip
Connections: $count
This could indicate scanning or attack"
            
            if [[ "$AUTO_BLOCK_IPS" == "true" ]] && [[ $count -gt 200 ]]; then
                iptables -A INPUT -s "$ip" -j DROP 2>/dev/null
                alert_critical "IP BLOCKED (flood): $ip" "$SCRIPT_NAME" \
                    "Blocked due to $count connections" \
                    "iptables -A INPUT -s $ip -j DROP"
            fi
        fi
    done <<< "$top_ips"
}

# Check for new listening ports
check_listening_ports() {
    local current_ports=$(ss -tlnp 2>/dev/null | awk 'NR>1 {print $4}' | sort -u)
    local baseline_file="${BASELINE_DIR}/listening_ports"
    
    # Save baseline if doesn't exist
    if [[ ! -f "$baseline_file" ]]; then
        echo "$current_ports" > "$baseline_file"
        log "INFO" "Saved baseline listening ports" "$SCRIPT_NAME"
        return 0
    fi
    
    local baseline=$(cat "$baseline_file")
    
    # Find new ports
    local new_ports=$(comm -23 <(echo "$current_ports" | sort) <(echo "$baseline" | sort))
    
    if [[ -n "$new_ports" ]]; then
        for port_entry in $new_ports; do
            local port=$(echo "$port_entry" | rev | cut -d: -f1 | rev)
            local process=$(ss -tlnp 2>/dev/null | grep "$port_entry" | grep -oP 'users:\(\("\K[^"]+')
            
            alert_critical "NEW LISTENING PORT DETECTED: $port" "$SCRIPT_NAME" \
                "Port entry: $port_entry
Process: ${process:-unknown}
This port was not listening at baseline!
Could indicate:
- Backdoor
- Unauthorized service
- Malware listener" \
                "Investigate immediately"
        done
    fi
}

# Check UFW/firewall status
check_firewall_status() {
    if command -v ufw &>/dev/null; then
        local status=$(ufw status 2>/dev/null | head -1)
        
        if [[ ! "$status" =~ "active" ]]; then
            alert_critical "UFW FIREWALL IS NOT ACTIVE!" "$SCRIPT_NAME" \
                "Status: $status
Firewall should be active!
This leaves the server exposed!" \
                "[AUTO] Attempting to enable UFW"
            
            if [[ "$AUTO_RESTART_SERVICES" == "true" ]]; then
                ufw --force enable 2>/dev/null
                alert_info "UFW enable attempted" "$SCRIPT_NAME"
            fi
        else
            log "INFO" "UFW firewall is active" "$SCRIPT_NAME"
        fi
    fi
}

# Check for crypto mining pool connections
check_mining_pools() {
    local mining_ports=("3333" "4444" "5555" "7777" "8888" "9999" "14433" "14444")
    
    for port in "${mining_ports[@]}"; do
        local conn=$(ss -tn 2>/dev/null | grep ":$port")
        if [[ -n "$conn" ]]; then
            alert_critical "CONNECTION TO MINING POOL PORT: $port" "$SCRIPT_NAME" \
                "Port $port is commonly used by mining pools
Connection:
$conn" \
                "Investigate and block"
        fi
    done
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Network monitoring starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    local issues=0
    
    # Check 1: C2 connections
    ((checks++))
    if [[ $(check_c2_connections) == "true" ]]; then
        ((issues++))
    fi
    
    # Check 2: Malicious domains
    ((checks++))
    check_malicious_domains
    
    # Check 3: Unusual ports
    ((checks++))
    check_unusual_ports
    
    # Check 4: Reverse shells
    ((checks++))
    check_reverse_shells
    
    # Check 5: Connection flood
    ((checks++))
    check_connection_flood
    
    # Check 6: New listening ports
    ((checks++))
    check_listening_ports
    
    # Check 7: Firewall status
    ((checks++))
    check_firewall_status
    
    # Check 8: Mining pools
    ((checks++))
    check_mining_pools
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    log "INFO" "Network monitoring complete: $checks checks (${duration}s)" "$SCRIPT_NAME"
}

# Run
main "$@"