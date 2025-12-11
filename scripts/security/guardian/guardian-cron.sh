#!/bin/bash
#
# Guardian Cron Monitor
# =====================
# Monitors cron jobs for malicious entries, auto-restores from backup
# Runs every 2 minutes via cron
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="cron"
START_TIME=$(get_epoch)

# Cron locations to monitor
CRON_LOCATIONS=(
    "/etc/crontab"
    "/etc/cron.d"
    "/var/spool/cron"
    "/var/spool/cron/crontabs"
)

CRON_BACKUP_DIR="${BASELINE_DIR}/cron_backup"

# =============================================================================
# CRON CHECKS
# =============================================================================

# Backup cron files
backup_cron_files() {
    mkdir -p "$CRON_BACKUP_DIR"
    
    # Backup /etc/crontab
    if [[ -f "/etc/crontab" ]]; then
        cp "/etc/crontab" "${CRON_BACKUP_DIR}/etc_crontab.bak"
    fi
    
    # Backup /etc/cron.d
    if [[ -d "/etc/cron.d" ]]; then
        cp -r "/etc/cron.d" "${CRON_BACKUP_DIR}/cron.d.bak"
    fi
    
    # Backup root crontab
    crontab -l > "${CRON_BACKUP_DIR}/root_crontab.bak" 2>/dev/null
    
    log "INFO" "Cron files backed up" "$SCRIPT_NAME"
}

# Check for malicious patterns in cron
check_malicious_patterns() {
    local found=false
    
    for location in "${CRON_LOCATIONS[@]}"; do
        if [[ ! -e "$location" ]]; then
            continue
        fi
        
        for pattern in "${CRON_MALWARE_PATTERNS[@]}"; do
            local matches=$(grep -rE "$pattern" "$location" 2>/dev/null)
            
            if [[ -n "$matches" ]]; then
                alert_critical "MALICIOUS CRON PATTERN DETECTED" "$SCRIPT_NAME" \
                    "Location: $location
Pattern: $pattern
Matches:
$matches

This is a known malware persistence technique!" \
                    "[AUTO] Removing malicious cron entry"
                
                if [[ "$AUTO_RESTORE_CRON" == "true" ]]; then
                    # Try to remove the malicious entry
                    if [[ -f "$location" ]]; then
                        grep -vE "$pattern" "$location" > "${location}.clean" 2>/dev/null
                        mv "${location}.clean" "$location" 2>/dev/null
                    fi
                fi
                
                found=true
            fi
        done
    done
    
    echo "$found"
}

# Check root crontab specifically
check_root_crontab() {
    local root_cron=$(crontab -l 2>/dev/null)
    
    if [[ -z "$root_cron" ]]; then
        log "INFO" "Root crontab is empty" "$SCRIPT_NAME"
        return 0
    fi
    
    # Check each line
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^# ]] && continue
        
        # Check for suspicious patterns
        for pattern in "${CRON_MALWARE_PATTERNS[@]}"; do
            if echo "$line" | grep -qE "$pattern"; then
                alert_critical "MALICIOUS ROOT CRONTAB ENTRY" "$SCRIPT_NAME" \
                    "Entry: $line
Pattern: $pattern" \
                    "[AUTO] Removing entry"
                
                if [[ "$AUTO_RESTORE_CRON" == "true" ]]; then
                    # Remove the line from crontab
                    crontab -l 2>/dev/null | grep -vF "$line" | crontab -
                    alert_info "Removed crontab entry: $line" "$SCRIPT_NAME"
                fi
            fi
        done
        
        # Check for downloads to execution
        if echo "$line" | grep -qE "(wget|curl).*\|.*(bash|sh)"; then
            alert_critical "DOWNLOAD-TO-EXECUTE IN CRONTAB" "$SCRIPT_NAME" \
                "Entry: $line
This is a classic malware pattern!"
        fi
        
        # Check for suspicious paths
        if echo "$line" | grep -qE "/tmp/|/dev/shm/|/var/tmp/"; then
            alert_warning "Crontab references suspicious directory" "$SCRIPT_NAME" \
                "Entry: $line"
        fi
        
    done <<< "$root_cron"
}

# Check for new cron files
check_new_cron_files() {
    # Files created in last hour in /etc/cron.d
    if [[ -d "/etc/cron.d" ]]; then
        local new_files=$(find /etc/cron.d -type f -mmin -60 2>/dev/null)
        
        if [[ -n "$new_files" ]]; then
            while IFS= read -r file; do
                [[ -z "$file" ]] && continue
                
                local content=$(cat "$file" 2>/dev/null | head -20)
                
                alert_warning "New cron file detected: $file" "$SCRIPT_NAME" \
                    "File: $file
Created in last hour
Content:
$content"
            done <<< "$new_files"
        fi
    fi
}

# Check for cron file tampering
check_cron_integrity() {
    local baseline_file="${BASELINE_DIR}/cron_hashes"
    local current_hashes=""
    
    # Generate hashes of all cron files
    for location in "${CRON_LOCATIONS[@]}"; do
        if [[ -f "$location" ]]; then
            current_hashes+="$(sha256sum "$location" 2>/dev/null)\n"
        elif [[ -d "$location" ]]; then
            for file in "$location"/*; do
                if [[ -f "$file" ]]; then
                    current_hashes+="$(sha256sum "$file" 2>/dev/null)\n"
                fi
            done
        fi
    done
    
    if [[ ! -f "$baseline_file" ]]; then
        echo -e "$current_hashes" > "$baseline_file"
        log "INFO" "Saved cron baseline hashes" "$SCRIPT_NAME"
        return 0
    fi
    
    local baseline=$(cat "$baseline_file")
    
    # Compare
    if [[ "$current_hashes" != "$baseline" ]]; then
        alert_warning "Cron files have changed since baseline" "$SCRIPT_NAME" \
            "One or more cron configuration files have been modified.
Run a manual review of cron jobs."
        
        # Update baseline
        echo -e "$current_hashes" > "$baseline_file"
    fi
}

# Check cron daemon status
check_cron_daemon() {
    if ! systemctl is-active --quiet cron 2>/dev/null; then
        alert_critical "CRON DAEMON NOT RUNNING" "$SCRIPT_NAME" \
            "The cron service is not active!
This could prevent legitimate scheduled tasks from running." \
            "[AUTO] Attempting to start cron"
        
        if [[ "$AUTO_RESTART_SERVICES" == "true" ]]; then
            systemctl start cron 2>/dev/null
            
            if systemctl is-active --quiet cron 2>/dev/null; then
                alert_info "Cron daemon started successfully" "$SCRIPT_NAME"
            fi
        fi
    fi
}

# Check for at jobs (another scheduler)
check_at_jobs() {
    if command -v atq &>/dev/null; then
        local at_jobs=$(atq 2>/dev/null)
        
        if [[ -n "$at_jobs" ]]; then
            alert_info "At jobs pending" "$SCRIPT_NAME" \
                "Jobs:
$at_jobs"
        fi
    fi
}

# Check systemd timers (another scheduling mechanism)
check_systemd_timers() {
    local suspicious_timers=$(systemctl list-timers --all 2>/dev/null | grep -iE "crypto|miner|xmr|download")
    
    if [[ -n "$suspicious_timers" ]]; then
        alert_critical "SUSPICIOUS SYSTEMD TIMER FOUND" "$SCRIPT_NAME" \
            "Timers:
$suspicious_timers"
    fi
    
    # Check for recently created timers
    local new_timers=$(find /etc/systemd/system -name "*.timer" -mtime -1 2>/dev/null)
    
    if [[ -n "$new_timers" ]]; then
        while IFS= read -r timer; do
            [[ -z "$timer" ]] && continue
            
            local content=$(cat "$timer" 2>/dev/null)
            
            alert_warning "New systemd timer detected: $timer" "$SCRIPT_NAME" \
                "File: $timer
Created in last 24 hours
Content:
$content"
        done <<< "$new_timers"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Cron monitoring starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    local issues=0
    
    # Create backup if not exists
    if [[ ! -d "$CRON_BACKUP_DIR" ]]; then
        backup_cron_files
    fi
    
    # Check 1: Malicious patterns
    ((checks++))
    if [[ $(check_malicious_patterns) == "true" ]]; then
        ((issues++))
    fi
    
    # Check 2: Root crontab
    ((checks++))
    check_root_crontab
    
    # Check 3: New cron files
    ((checks++))
    check_new_cron_files
    
    # Check 4: Cron integrity
    ((checks++))
    check_cron_integrity
    
    # Check 5: Cron daemon
    ((checks++))
    check_cron_daemon
    
    # Check 6: At jobs
    ((checks++))
    check_at_jobs
    
    # Check 7: Systemd timers
    ((checks++))
    check_systemd_timers
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    log "INFO" "Cron monitoring complete: $checks checks (${duration}s)" "$SCRIPT_NAME"
}

# Run
main "$@"