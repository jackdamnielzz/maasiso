#!/bin/bash
#
# Guardian Process Monitor
# ========================
# Detects and kills suspicious processes, crypto miners, malware
# Runs every 10 seconds via systemd timer
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="process"
START_TIME=$(get_epoch)

# =============================================================================
# PROCESS ANALYSIS
# =============================================================================

# Get top CPU processes
get_top_processes() {
    ps aux --sort=-%cpu | head -20
}

# Check for suspicious process names
check_suspicious_names() {
    local found=false
    
    for pattern in "${SUSPICIOUS_PROCESSES[@]}"; do
        local matches=$(pgrep -af "$pattern" 2>/dev/null | grep -v "guardian" | grep -v "grep")
        
        if [[ -n "$matches" ]]; then
            while IFS= read -r line; do
                local pid=$(echo "$line" | awk '{print $1}')
                local cmd=$(echo "$line" | cut -d' ' -f2-)
                
                alert_critical "SUSPICIOUS PROCESS DETECTED: $pattern" "$SCRIPT_NAME" \
                    "PID: $pid
Command: $cmd
Pattern: $pattern" \
                    "[AUTO] Attempting to kill process $pid"
                
                # Auto-kill if enabled
                if [[ "$AUTO_KILL_SUSPICIOUS" == "true" ]]; then
                    kill -9 "$pid" 2>/dev/null
                    if [[ $? -eq 0 ]]; then
                        alert_critical "PROCESS KILLED: $pid ($pattern)" "$SCRIPT_NAME" \
                            "Successfully terminated suspicious process" \
                            "[AUTO] kill -9 $pid - SUCCESS"
                    fi
                fi
                
                found=true
            done <<< "$matches"
        fi
    done
    
    echo "$found"
}

# Check for high CPU processes
check_high_cpu() {
    # Get processes with high CPU
    local high_cpu_procs=$(ps aux --sort=-%cpu | awk -v warn="$CPU_WARNING" -v crit="$CPU_CRITICAL" \
        'NR>1 && $3>warn {print $2, $3, $11}' | head -10)
    
    if [[ -z "$high_cpu_procs" ]]; then
        return 0
    fi
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        
        local pid=$(echo "$line" | awk '{print $1}')
        local cpu=$(echo "$line" | awk '{print $2}')
        local cmd=$(echo "$line" | awk '{print $3}')
        
        # Skip whitelisted processes
        if is_whitelisted_process "$cmd"; then
            if (( $(echo "$cpu > $CPU_CRITICAL" | bc -l) )); then
                alert_warning "High CPU on whitelisted process" "$SCRIPT_NAME" \
                    "Process: $cmd (PID: $pid)
CPU: ${cpu}%
This is a known process but using excessive CPU"
            fi
            continue
        fi
        
        # Unknown high CPU process
        local full_cmd=$(ps -p "$pid" -o args= 2>/dev/null)
        
        if (( $(echo "$cpu > $CPU_CRITICAL" | bc -l) )); then
            alert_critical "UNKNOWN HIGH CPU PROCESS: ${cpu}%" "$SCRIPT_NAME" \
                "PID: $pid
CPU: ${cpu}%
Command: $full_cmd
This process is NOT whitelisted and using critical CPU" \
                "[AUTO] Process flagged for investigation"
            
            # Auto-kill unknown high CPU processes if enabled
            if [[ "$AUTO_KILL_SUSPICIOUS" == "true" ]] && (( $(echo "$cpu > 90" | bc -l) )); then
                kill -9 "$pid" 2>/dev/null
                alert_critical "KILLED HIGH CPU PROCESS" "$SCRIPT_NAME" \
                    "PID $pid using ${cpu}% CPU was terminated" \
                    "[AUTO] kill -9 $pid"
            fi
        elif (( $(echo "$cpu > $CPU_WARNING" | bc -l) )); then
            alert_warning "Elevated CPU on unknown process" "$SCRIPT_NAME" \
                "PID: $pid
CPU: ${cpu}%
Command: $full_cmd"
        fi
    done <<< "$high_cpu_procs"
}

# Check for processes from unknown users
check_unknown_users() {
    # Get list of valid system users
    local valid_users="root nobody www-data postgres node strapi"
    
    # Find processes owned by unusual users
    local unusual=$(ps aux | awk 'NR>1 {print $1}' | sort -u | while read user; do
        if [[ ! "$valid_users" =~ "$user" ]] && ! id "$user" &>/dev/null; then
            echo "$user"
        fi
    done)
    
    if [[ -n "$unusual" ]]; then
        alert_warning "Processes owned by unusual users detected" "$SCRIPT_NAME" \
            "Users: $unusual"
    fi
}

# Check for hidden processes (/proc analysis)
check_hidden_processes() {
    # Compare ps output with /proc
    local ps_pids=$(ps aux | awk 'NR>1 {print $2}' | sort -n)
    local proc_pids=$(ls -d /proc/[0-9]* 2>/dev/null | sed 's|/proc/||' | sort -n)
    
    # Find PIDs in /proc but not in ps (potentially hidden)
    local hidden=$(comm -23 <(echo "$proc_pids") <(echo "$ps_pids"))
    
    if [[ -n "$hidden" ]]; then
        for pid in $hidden; do
            # Check if it's a kernel thread (these are normal)
            if [[ -f "/proc/$pid/cmdline" ]]; then
                local cmdline=$(cat "/proc/$pid/cmdline" 2>/dev/null | tr '\0' ' ')
                if [[ -n "$cmdline" ]]; then
                    alert_critical "HIDDEN PROCESS DETECTED" "$SCRIPT_NAME" \
                        "PID: $pid
This process is visible in /proc but NOT in ps output
Command: $cmdline
This is a strong indicator of rootkit activity!"
                fi
            fi
        done
    fi
}

# Check for processes with deleted executables
check_deleted_executables() {
    local deleted=$(ls -l /proc/*/exe 2>/dev/null | grep "(deleted)" | head -10)
    
    if [[ -n "$deleted" ]]; then
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue
            
            local pid=$(echo "$line" | grep -oP '/proc/\K[0-9]+')
            local exe=$(echo "$line" | awk '{print $NF}')
            
            # Skip known safe deleted executables (package updates)
            if [[ "$exe" =~ "dpkg" ]] || [[ "$exe" =~ "apt" ]]; then
                continue
            fi
            
            local cmdline=$(cat "/proc/$pid/cmdline" 2>/dev/null | tr '\0' ' ')
            
            alert_warning "Process running from deleted executable" "$SCRIPT_NAME" \
                "PID: $pid
Deleted exe: $exe
Command: $cmdline
This could indicate malware that deleted itself after execution"
        done <<< "$deleted"
    fi
}

# Check for crypto miner wallet addresses in process arguments
check_wallet_addresses() {
    for wallet in "${MALWARE_WALLETS[@]}"; do
        local found=$(ps aux | grep -F "$wallet" | grep -v grep)
        
        if [[ -n "$found" ]]; then
            local pid=$(echo "$found" | awk '{print $2}')
            
            alert_critical "CRYPTO MINER WALLET DETECTED IN PROCESS" "$SCRIPT_NAME" \
                "Wallet: $wallet
Process: $found" \
                "[AUTO] Killing process with miner wallet"
            
            if [[ "$AUTO_KILL_SUSPICIOUS" == "true" ]]; then
                kill -9 "$pid" 2>/dev/null
            fi
        fi
    done
}

# Check process count anomaly
check_process_count() {
    local count=$(ps aux | wc -l)
    local baseline_file="${BASELINE_DIR}/process_count"
    
    # Save baseline if doesn't exist
    if [[ ! -f "$baseline_file" ]]; then
        echo "$count" > "$baseline_file"
        return 0
    fi
    
    local baseline=$(cat "$baseline_file")
    local diff=$((count - baseline))
    local threshold=50
    
    if [[ $diff -gt $threshold ]]; then
        alert_warning "Process count anomaly detected" "$SCRIPT_NAME" \
            "Current: $count processes
Baseline: $baseline processes
Increase: +$diff
This could indicate a fork bomb or mass process spawning"
    fi
    
    # Update baseline with rolling average
    local new_baseline=$(( (baseline + count) / 2 ))
    echo "$new_baseline" > "$baseline_file"
}

# Check for zombie processes
check_zombie_processes() {
    local zombies=$(ps aux | awk '$8 ~ /Z/ {print $2, $11}')
    local zombie_count=$(echo "$zombies" | grep -c .)
    
    if [[ $zombie_count -gt 5 ]]; then
        alert_warning "Multiple zombie processes detected" "$SCRIPT_NAME" \
            "Count: $zombie_count zombies
PIDs: $zombies
Excessive zombies may indicate system issues"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Process scan starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    local issues=0
    
    # Check 1: Suspicious process names
    ((checks++))
    if [[ $(check_suspicious_names) == "true" ]]; then
        ((issues++))
    fi
    
    # Check 2: High CPU processes
    ((checks++))
    check_high_cpu
    
    # Check 3: Unknown users
    ((checks++))
    check_unknown_users
    
    # Check 4: Hidden processes
    ((checks++))
    check_hidden_processes
    
    # Check 5: Deleted executables
    ((checks++))
    check_deleted_executables
    
    # Check 6: Wallet addresses
    ((checks++))
    check_wallet_addresses
    
    # Check 7: Process count
    ((checks++))
    check_process_count
    
    # Check 8: Zombie processes
    ((checks++))
    check_zombie_processes
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    log "INFO" "Process scan complete: $checks checks, $issues issues (${duration}s)" "$SCRIPT_NAME"
}

# Run
main "$@"