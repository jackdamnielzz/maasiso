#!/bin/bash
#
# Guardian Authentication Monitor
# ================================
# Monitors SSH logins, failed attempts, authorized_keys changes
# Runs every 5 minutes via cron
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="auth"
START_TIME=$(get_epoch)

# State files
LAST_CHECK_FILE="${STATE_DIR}/auth_last_check"
KNOWN_IPS_FILE="${STATE_DIR}/known_ssh_ips"

# =============================================================================
# AUTH CHECKS
# =============================================================================

# Get last check timestamp
get_last_check() {
    if [[ -f "$LAST_CHECK_FILE" ]]; then
        cat "$LAST_CHECK_FILE"
    else
        # Default: 5 minutes ago
        echo $(($(get_epoch) - 300))
    fi
}

# Save current timestamp
save_last_check() {
    get_epoch > "$LAST_CHECK_FILE"
}

# Check failed SSH login attempts
check_failed_logins() {
    local auth_log="/var/log/auth.log"
    
    if [[ ! -f "$auth_log" ]]; then
        auth_log="/var/log/secure"  # CentOS/RHEL
    fi
    
    if [[ ! -f "$auth_log" ]]; then
        log "WARNING" "Auth log not found" "$SCRIPT_NAME"
        return 0
    fi
    
    # Count failed attempts in last 5 minutes
    local since=$(date -d "5 minutes ago" '+%b %d %H:%M' 2>/dev/null || date '+%b %d %H:%M')
    local failed_count=$(grep -c "Failed password" "$auth_log" 2>/dev/null || echo 0)
    local recent_failed=$(grep "Failed password" "$auth_log" 2>/dev/null | tail -50)
    
    # Get unique IPs with failed attempts
    local failed_ips=$(grep "Failed password" "$auth_log" 2>/dev/null | \
        grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | \
        sort | uniq -c | sort -rn | head -10)
    
    if [[ -n "$failed_ips" ]]; then
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue
            
            local count=$(echo "$line" | awk '{print $1}')
            local ip=$(echo "$line" | awk '{print $2}')
            
            if [[ $count -gt $SSH_FAILED_CRITICAL ]]; then
                alert_critical "BRUTE FORCE ATTACK FROM: $ip" "$SCRIPT_NAME" \
                    "IP: $ip
Failed attempts: $count
Threshold: $SSH_FAILED_CRITICAL

This IP is attempting to brute force SSH!" \
                    "[AUTO] Blocking IP with fail2ban/iptables"
                
                # Block IP
                if [[ "$AUTO_BLOCK_IPS" == "true" ]]; then
                    iptables -A INPUT -s "$ip" -j DROP 2>/dev/null
                    # Also add to fail2ban if available
                    fail2ban-client set sshd banip "$ip" 2>/dev/null
                fi
                
            elif [[ $count -gt $SSH_FAILED_WARNING ]]; then
                alert_warning "Multiple failed SSH attempts from: $ip" "$SCRIPT_NAME" \
                    "IP: $ip
Failed attempts: $count
Threshold: $SSH_FAILED_WARNING"
            fi
        done <<< "$failed_ips"
    fi
}

# Check successful logins
check_successful_logins() {
    local auth_log="/var/log/auth.log"
    
    if [[ ! -f "$auth_log" ]]; then
        auth_log="/var/log/secure"
    fi
    
    if [[ ! -f "$auth_log" ]]; then
        return 0
    fi
    
    # Load known IPs
    local known_ips=""
    if [[ -f "$KNOWN_IPS_FILE" ]]; then
        known_ips=$(cat "$KNOWN_IPS_FILE")
    fi
    
    # Find successful logins
    local successful=$(grep "Accepted" "$auth_log" 2>/dev/null | tail -20)
    
    if [[ -n "$successful" ]]; then
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue
            
            local ip=$(echo "$line" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1)
            local user=$(echo "$line" | grep -oP 'for \K\w+' | head -1)
            local method=$(echo "$line" | grep -oP 'Accepted \K\w+' | head -1)
            local timestamp=$(echo "$line" | awk '{print $1, $2, $3}')
            
            [[ -z "$ip" ]] && continue
            
            # Check if new IP
            if [[ ! "$known_ips" =~ "$ip" ]]; then
                alert_critical "SSH LOGIN FROM NEW IP: $ip" "$SCRIPT_NAME" \
                    "SECURITY ALERT: Login from previously unknown IP!

IP: $ip
User: $user
Method: $method
Time: $timestamp

This IP has never logged in before.
If this is not you, your server may be compromised!" \
                    "Verify this login immediately"
                
                # Add to known IPs
                echo "$ip" >> "$KNOWN_IPS_FILE"
            else
                # Known IP, just log
                alert_info "SSH login: $user from $ip" "$SCRIPT_NAME" \
                    "User: $user
IP: $ip
Method: $method
Time: $timestamp"
            fi
        done <<< "$successful"
    fi
}

# Check authorized_keys changes
check_authorized_keys() {
    local auth_keys="/root/.ssh/authorized_keys"
    local hash_file="${HASH_DIR}/authorized_keys.hash"
    
    if [[ ! -f "$auth_keys" ]]; then
        alert_warning "No authorized_keys file found" "$SCRIPT_NAME"
        return 0
    fi
    
    local current_hash=$(sha256sum "$auth_keys" | awk '{print $1}')
    
    if [[ -f "$hash_file" ]]; then
        local baseline_hash=$(cat "$hash_file")
        
        if [[ "$current_hash" != "$baseline_hash" ]]; then
            local key_count=$(grep -c "ssh-" "$auth_keys" 2>/dev/null || echo 0)
            local keys=$(cat "$auth_keys")
            
            alert_critical "AUTHORIZED_KEYS MODIFIED!" "$SCRIPT_NAME" \
                "The SSH authorized_keys file has been changed!

File: $auth_keys
Previous hash: $baseline_hash
Current hash: $current_hash
Key count: $key_count

Current keys:
$keys

If you did not make this change, REMOVE UNAUTHORIZED KEYS IMMEDIATELY!"
            
            echo "$current_hash" > "$hash_file"
        fi
    else
        echo "$current_hash" > "$hash_file"
        log "INFO" "Saved authorized_keys baseline" "$SCRIPT_NAME"
    fi
    
    # Verify keys against whitelist
    check_ssh_key_whitelist
}

# Check SSH keys against whitelist
check_ssh_key_whitelist() {
    local auth_keys="/root/.ssh/authorized_keys"
    
    if [[ ! -f "$auth_keys" ]]; then
        return 0
    fi
    
    # Get whitelist for this server
    local -a whitelist
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        whitelist=("${BACKEND_SSH_WHITELIST[@]}")
    else
        whitelist=("${FRONTEND_SSH_WHITELIST[@]}")
    fi
    
    local unauthorized_found=false
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^# ]] && continue
        
        local comment=$(echo "$line" | awk '{print $NF}')
        
        local is_whitelisted=false
        for allowed in "${whitelist[@]}"; do
            if [[ "$comment" == *"$allowed"* ]] || [[ "$line" == *"$allowed"* ]]; then
                is_whitelisted=true
                break
            fi
        done
        
        if [[ "$is_whitelisted" == "false" ]]; then
            alert_critical "UNAUTHORIZED SSH KEY DETECTED" "$SCRIPT_NAME" \
                "An SSH key not in the whitelist was found!

Key comment: $comment
Full key (truncated): ${line:0:100}...

This key is NOT authorized. Remove it immediately if you did not add it!"
            
            unauthorized_found=true
        fi
    done < "$auth_keys"
    
    if [[ "$unauthorized_found" == "false" ]]; then
        log "INFO" "All SSH keys are whitelisted" "$SCRIPT_NAME"
    fi
}

# Check for new users
check_new_users() {
    local passwd_hash_file="${HASH_DIR}/passwd.hash"
    local current_hash=$(sha256sum /etc/passwd | awk '{print $1}')
    
    if [[ -f "$passwd_hash_file" ]]; then
        local baseline_hash=$(cat "$passwd_hash_file")
        
        if [[ "$current_hash" != "$baseline_hash" ]]; then
            # Find new users
            local users=$(cat /etc/passwd | cut -d: -f1)
            
            alert_critical "/etc/passwd HAS BEEN MODIFIED!" "$SCRIPT_NAME" \
                "The user database has changed!

Current users:
$users

If a new user was added without your knowledge, 
the server may be compromised!"
            
            echo "$current_hash" > "$passwd_hash_file"
        fi
    else
        echo "$current_hash" > "$passwd_hash_file"
        log "INFO" "Saved /etc/passwd baseline" "$SCRIPT_NAME"
    fi
}

# Check sudo usage
check_sudo_usage() {
    local auth_log="/var/log/auth.log"
    
    if [[ ! -f "$auth_log" ]]; then
        return 0
    fi
    
    # Recent sudo commands
    local sudo_cmds=$(grep "sudo:" "$auth_log" 2>/dev/null | grep "COMMAND" | tail -10)
    
    if [[ -n "$sudo_cmds" ]]; then
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue
            
            local user=$(echo "$line" | grep -oP 'USER=\K\w+')
            local cmd=$(echo "$line" | grep -oP 'COMMAND=\K.*')
            local timestamp=$(echo "$line" | awk '{print $1, $2, $3}')
            
            # Check for suspicious sudo commands
            if [[ "$cmd" =~ "passwd" ]] || [[ "$cmd" =~ "useradd" ]] || [[ "$cmd" =~ "visudo" ]]; then
                alert_warning "Sensitive sudo command executed" "$SCRIPT_NAME" \
                    "User: $user
Command: $cmd
Time: $timestamp"
            fi
        done <<< "$sudo_cmds"
    fi
}

# Check for active sessions
check_active_sessions() {
    local sessions=$(who 2>/dev/null)
    local session_count=$(echo "$sessions" | grep -c . 2>/dev/null || echo 0)
    
    if [[ $session_count -gt 3 ]]; then
        alert_warning "Multiple active sessions" "$SCRIPT_NAME" \
            "Active sessions: $session_count

$sessions"
    fi
    
    # Check for sessions from unusual IPs
    local session_ips=$(who 2>/dev/null | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}')
    
    if [[ -n "$session_ips" ]]; then
        log "INFO" "Active session IPs: $session_ips" "$SCRIPT_NAME"
    fi
}

# Check fail2ban status
check_fail2ban() {
    if command -v fail2ban-client &>/dev/null; then
        if ! systemctl is-active --quiet fail2ban 2>/dev/null; then
            alert_critical "FAIL2BAN IS NOT RUNNING!" "$SCRIPT_NAME" \
                "Fail2ban protects against brute force attacks.
It should be running at all times!" \
                "[AUTO] Attempting to start fail2ban"
            
            if [[ "$AUTO_RESTART_SERVICES" == "true" ]]; then
                systemctl start fail2ban 2>/dev/null
            fi
        else
            # Get banned IPs
            local banned=$(fail2ban-client status sshd 2>/dev/null | grep "Banned IP" || echo "")
            if [[ -n "$banned" ]]; then
                log "INFO" "Fail2ban active. $banned" "$SCRIPT_NAME"
            fi
        fi
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Auth monitoring starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    
    # Check 1: Failed logins
    ((checks++))
    check_failed_logins
    
    # Check 2: Successful logins
    ((checks++))
    check_successful_logins
    
    # Check 3: Authorized keys
    ((checks++))
    check_authorized_keys
    
    # Check 4: New users
    ((checks++))
    check_new_users
    
    # Check 5: Sudo usage
    ((checks++))
    check_sudo_usage
    
    # Check 6: Active sessions
    ((checks++))
    check_active_sessions
    
    # Check 7: Fail2ban
    ((checks++))
    check_fail2ban
    
    save_last_check
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    log "INFO" "Auth monitoring complete: $checks checks (${duration}s)" "$SCRIPT_NAME"
}

# Run
main "$@"