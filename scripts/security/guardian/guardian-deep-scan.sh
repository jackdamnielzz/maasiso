#!/bin/bash
#
# Guardian Deep Scan
# ==================
# Deep security analysis, rootkit detection, comprehensive checks
# Runs every 15 minutes via cron
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="deep-scan"
START_TIME=$(get_epoch)

# =============================================================================
# DEEP SCAN CHECKS
# =============================================================================

# Check for rootkit indicators
check_rootkit_indicators() {
    log "INFO" "Checking for rootkit indicators..." "$SCRIPT_NAME"
    
    local indicators_found=false
    
    # Check for hidden processes (ps vs /proc mismatch)
    local ps_count=$(ps aux 2>/dev/null | wc -l)
    local proc_count=$(ls -d /proc/[0-9]* 2>/dev/null | wc -l)
    local diff=$((proc_count - ps_count))
    
    if [[ $diff -gt 5 ]]; then
        alert_critical "POSSIBLE HIDDEN PROCESSES DETECTED" "$SCRIPT_NAME" \
            "ps shows: $ps_count processes
/proc shows: $proc_count processes
Difference: $diff

This discrepancy could indicate a rootkit hiding processes!"
        indicators_found=true
    fi
    
    # Check for hidden kernel modules
    local lsmod_count=$(lsmod 2>/dev/null | wc -l)
    local proc_modules_count=$(cat /proc/modules 2>/dev/null | wc -l)
    
    if [[ $lsmod_count -ne $proc_modules_count ]]; then
        alert_warning "Kernel module count mismatch" "$SCRIPT_NAME" \
            "lsmod: $lsmod_count
/proc/modules: $proc_modules_count"
    fi
    
    # Check for common rootkit files/directories
    local rootkit_paths=(
        "/usr/lib/libext-2.so.7"
        "/usr/lib/libproc.a"
        "/dev/.udev"
        "/dev/.static"
        "/dev/ptyxx"
        "/dev/ptyzx"
        "/dev/ptyzy"
        "/etc/ssh/.sshd_auth"
        "/lib/security/.config"
        "/lib/libext-2.so.7"
    )
    
    for path in "${rootkit_paths[@]}"; do
        if [[ -e "$path" ]]; then
            alert_critical "ROOTKIT FILE FOUND: $path" "$SCRIPT_NAME" \
                "Path: $path exists!
This is a known rootkit indicator!"
            indicators_found=true
        fi
    done
    
    # Check LD_PRELOAD
    if [[ -n "${LD_PRELOAD:-}" ]]; then
        alert_critical "LD_PRELOAD IS SET!" "$SCRIPT_NAME" \
            "LD_PRELOAD: $LD_PRELOAD
This could be used to hide malicious libraries!"
    fi
    
    if [[ -f "/etc/ld.so.preload" ]]; then
        local preload_content=$(cat /etc/ld.so.preload 2>/dev/null)
        if [[ -n "$preload_content" ]]; then
            alert_critical "SUSPICIOUS /etc/ld.so.preload" "$SCRIPT_NAME" \
                "Content: $preload_content
This could be used for library injection!"
        fi
    fi
    
    echo "$indicators_found"
}

# Check kernel integrity
check_kernel_integrity() {
    log "INFO" "Checking kernel integrity..." "$SCRIPT_NAME"
    
    # Check for modified system calls (basic check)
    local syscall_table="/proc/kallsyms"
    
    if [[ -f "$syscall_table" ]]; then
        # Look for suspicious symbols
        local suspicious=$(grep -E "(rootkit|hide|stealth)" "$syscall_table" 2>/dev/null)
        if [[ -n "$suspicious" ]]; then
            alert_critical "SUSPICIOUS KERNEL SYMBOLS" "$SCRIPT_NAME" \
                "$suspicious"
        fi
    fi
    
    # Check kernel taint flags
    local taint=$(cat /proc/sys/kernel/tainted 2>/dev/null || echo "0")
    if [[ "$taint" != "0" ]]; then
        alert_warning "Kernel is tainted" "$SCRIPT_NAME" \
            "Taint value: $taint
This could indicate unsigned/proprietary modules"
    fi
    
    # Check for unexpected kernel modules
    local modules=$(lsmod 2>/dev/null | awk 'NR>1 {print $1}')
    local suspicious_modules=("rootkit" "hide" "stealth" "diamorphine")
    
    for mod in "${suspicious_modules[@]}"; do
        if echo "$modules" | grep -qi "$mod"; then
            alert_critical "SUSPICIOUS KERNEL MODULE: $mod" "$SCRIPT_NAME"
        fi
    done
}

# Comprehensive process analysis
check_process_tree() {
    log "INFO" "Analyzing process tree..." "$SCRIPT_NAME"
    
    # Check for orphaned processes
    local orphans=$(ps -eo pid,ppid,cmd 2>/dev/null | awk '$2 == 1 && $1 != 1 {print}' | head -20)
    
    # Many orphans are normal (daemons), but check for suspicious ones
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        
        local cmd=$(echo "$line" | awk '{$1=$2=""; print $0}' | xargs)
        
        # Check for suspicious orphan commands
        if [[ "$cmd" =~ "curl" ]] || [[ "$cmd" =~ "wget" ]] || \
           [[ "$cmd" =~ "/tmp/" ]] || [[ "$cmd" =~ "base64" ]]; then
            alert_warning "Suspicious orphan process" "$SCRIPT_NAME" \
                "$line"
        fi
    done <<< "$orphans"
    
    # Check for processes with deleted binaries
    local deleted_bins=$(ls -l /proc/*/exe 2>/dev/null | grep "(deleted)" | head -10)
    
    if [[ -n "$deleted_bins" ]]; then
        alert_warning "Processes running from deleted binaries" "$SCRIPT_NAME" \
            "$deleted_bins"
    fi
    
    # Check process environment for suspicious variables
    for pid in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$' | head -50); do
        if [[ -f "/proc/$pid/environ" ]]; then
            local env=$(cat "/proc/$pid/environ" 2>/dev/null | tr '\0' '\n')
            
            # Check for suspicious environment variables
            if echo "$env" | grep -qE "(LD_PRELOAD|LD_LIBRARY_PATH=/tmp|SHELL=/tmp)"; then
                local cmd=$(cat "/proc/$pid/cmdline" 2>/dev/null | tr '\0' ' ')
                alert_critical "Process with suspicious environment" "$SCRIPT_NAME" \
                    "PID: $pid
Command: $cmd
Suspicious env vars detected"
            fi
        fi
    done
}

# Network socket analysis
check_socket_analysis() {
    log "INFO" "Analyzing network sockets..." "$SCRIPT_NAME"
    
    # Look for raw sockets (often used by sniffers/rootkits)
    local raw_sockets=$(ss -w 2>/dev/null)
    if [[ -n "$raw_sockets" ]] && [[ $(echo "$raw_sockets" | wc -l) -gt 1 ]]; then
        alert_warning "Raw sockets detected" "$SCRIPT_NAME" \
            "Raw sockets can be used for packet sniffing:
$raw_sockets"
    fi
    
    # Check for processes listening on unexpected interfaces
    local external_listen=$(ss -tlnp 2>/dev/null | grep -v "127.0.0.1" | grep -v "::1")
    
    # Log all external listeners
    log "INFO" "External listeners:\n$external_listen" "$SCRIPT_NAME"
    
    # Check for UDP listeners (often used by backdoors)
    local udp_listen=$(ss -ulnp 2>/dev/null)
    if [[ -n "$udp_listen" ]] && [[ $(echo "$udp_listen" | wc -l) -gt 1 ]]; then
        log "INFO" "UDP listeners:\n$udp_listen" "$SCRIPT_NAME"
    fi
}

# File system analysis
check_filesystem_anomalies() {
    log "INFO" "Checking filesystem anomalies..." "$SCRIPT_NAME"
    
    # Check for files with unusual timestamps (in the future)
    local future_files=$(find /etc /usr /var -type f -newermt "tomorrow" 2>/dev/null | head -10)
    
    if [[ -n "$future_files" ]]; then
        alert_warning "Files with future timestamps" "$SCRIPT_NAME" \
            "These files have timestamps in the future:
$future_files

This could indicate timestamp manipulation"
    fi
    
    # Check for files with no owner
    local no_owner=$(find / -nouser -o -nogroup 2>/dev/null | head -20)
    
    if [[ -n "$no_owner" ]]; then
        alert_warning "Files with no owner/group" "$SCRIPT_NAME" \
            "$no_owner"
    fi
    
    # Check /dev for regular files (should only have device files)
    local dev_files=$(find /dev -type f 2>/dev/null | grep -v "null\|zero\|random\|urandom")
    
    if [[ -n "$dev_files" ]]; then
        alert_warning "Regular files in /dev" "$SCRIPT_NAME" \
            "Regular files found in /dev (unusual):
$dev_files"
    fi
    
    # Check for immutable files in unusual places
    local immutable=$(lsattr -R /tmp /var/tmp 2>/dev/null | grep "i" | head -10)
    
    if [[ -n "$immutable" ]]; then
        alert_warning "Immutable files in temp directories" "$SCRIPT_NAME" \
            "$immutable"
    fi
}

# Binary integrity check
check_binary_integrity() {
    log "INFO" "Checking binary integrity..." "$SCRIPT_NAME"
    
    # Key system binaries to check
    local binaries=(
        "/bin/ls"
        "/bin/ps"
        "/bin/netstat"
        "/bin/ss"
        "/usr/bin/find"
        "/usr/bin/lsof"
        "/usr/bin/top"
    )
    
    local baseline_file="${BASELINE_DIR}/binary_sizes"
    local current_sizes=""
    
    for bin in "${binaries[@]}"; do
        if [[ -f "$bin" ]]; then
            local size=$(stat -c %s "$bin" 2>/dev/null)
            current_sizes+="$bin:$size\n"
        fi
    done
    
    if [[ ! -f "$baseline_file" ]]; then
        echo -e "$current_sizes" > "$baseline_file"
        log "INFO" "Saved binary size baseline" "$SCRIPT_NAME"
        return 0
    fi
    
    local baseline=$(cat "$baseline_file")
    
    # Compare sizes
    while IFS=: read -r bin size; do
        [[ -z "$bin" ]] && continue
        
        local baseline_size=$(echo -e "$baseline" | grep "^$bin:" | cut -d: -f2)
        
        if [[ -n "$baseline_size" ]] && [[ "$size" != "$baseline_size" ]]; then
            alert_critical "SYSTEM BINARY SIZE CHANGED: $bin" "$SCRIPT_NAME" \
                "Binary: $bin
Baseline size: $baseline_size
Current size: $size

This could indicate the binary has been replaced (trojanized)!"
        fi
    done <<< "$(echo -e "$current_sizes")"
}

# Run rkhunter if available
run_rkhunter() {
    if command -v rkhunter &>/dev/null; then
        log "INFO" "Running rkhunter..." "$SCRIPT_NAME"
        
        local rkhunter_output=$(rkhunter --check --skip-keypress --quiet 2>&1)
        local warnings=$(echo "$rkhunter_output" | grep -i "warning")
        
        if [[ -n "$warnings" ]]; then
            alert_warning "Rkhunter warnings" "$SCRIPT_NAME" \
                "$warnings"
        fi
    fi
}

# Run chkrootkit if available
run_chkrootkit() {
    if command -v chkrootkit &>/dev/null; then
        log "INFO" "Running chkrootkit..." "$SCRIPT_NAME"
        
        local chkrootkit_output=$(chkrootkit 2>&1 | grep -i "infected\|INFECTED")
        
        if [[ -n "$chkrootkit_output" ]]; then
            alert_critical "CHKROOTKIT FOUND INFECTIONS" "$SCRIPT_NAME" \
                "$chkrootkit_output"
        fi
    fi
}

# Check for suspicious scheduled tasks
check_scheduled_tasks() {
    log "INFO" "Checking all scheduled tasks..." "$SCRIPT_NAME"
    
    # Check all user crontabs
    for user in $(cut -d: -f1 /etc/passwd); do
        local cron=$(crontab -u "$user" -l 2>/dev/null | grep -v "^#")
        if [[ -n "$cron" ]]; then
            log "INFO" "Crontab for $user:\n$cron" "$SCRIPT_NAME"
        fi
    done
    
    # Check /etc/cron.* directories
    for dir in /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly; do
        if [[ -d "$dir" ]]; then
            local scripts=$(ls -la "$dir" 2>/dev/null)
            log "INFO" "$dir contents:\n$scripts" "$SCRIPT_NAME"
        fi
    done
}

# System integrity summary
generate_integrity_summary() {
    local summary="SYSTEM INTEGRITY SUMMARY
========================

Server: $SERVER_NAME ($SERVER_IP)
Time: $(get_timestamp)
Role: $SERVER_ROLE

System:
- Kernel: $(uname -r)
- Uptime: $(uptime -p)
- Load: $(cat /proc/loadavg)

Users:
- Root logins: $(last root 2>/dev/null | head -3)
- Active sessions: $(who | wc -l)

Network:
- Listening ports: $(ss -tlnp 2>/dev/null | wc -l)
- Established: $(ss -tn state established 2>/dev/null | wc -l)

Processes:
- Total: $(ps aux | wc -l)
- Root processes: $(ps -U root | wc -l)

Filesystem:
- Disk usage: $(df -h / | awk 'NR==2 {print $5}')
- Inodes: $(df -i / | awk 'NR==2 {print $5}')
"
    
    log "INFO" "$summary" "$SCRIPT_NAME"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Deep scan starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    local issues=0
    
    # Check 1: Rootkit indicators
    ((checks++))
    if [[ $(check_rootkit_indicators) == "true" ]]; then
        ((issues++))
    fi
    
    # Check 2: Kernel integrity
    ((checks++))
    check_kernel_integrity
    
    # Check 3: Process tree
    ((checks++))
    check_process_tree
    
    # Check 4: Socket analysis
    ((checks++))
    check_socket_analysis
    
    # Check 5: Filesystem anomalies
    ((checks++))
    check_filesystem_anomalies
    
    # Check 6: Binary integrity
    ((checks++))
    check_binary_integrity
    
    # Check 7: rkhunter
    ((checks++))
    run_rkhunter
    
    # Check 8: chkrootkit
    ((checks++))
    run_chkrootkit
    
    # Check 9: Scheduled tasks
    ((checks++))
    check_scheduled_tasks
    
    # Generate summary
    generate_integrity_summary
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    log "INFO" "Deep scan complete: $checks checks (${duration}s)" "$SCRIPT_NAME"
}

# Run
main "$@"