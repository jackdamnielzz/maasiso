#!/bin/bash
#
# Guardian Files Monitor
# ======================
# Monitors file integrity, detects unauthorized changes, malware directories
# Runs every minute via cron
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="files"
START_TIME=$(get_epoch)

# =============================================================================
# FILE CHECKS
# =============================================================================

# Check for known malware directories
check_malware_directories() {
    local found=false
    
    for dir in "${MALWARE_DIRECTORIES[@]}"; do
        if [[ -e "$dir" ]]; then
            local file_type="file"
            [[ -d "$dir" ]] && file_type="directory"
            
            local contents=""
            if [[ -d "$dir" ]]; then
                contents=$(ls -la "$dir" 2>/dev/null | head -20)
            fi
            
            alert_critical "MALWARE $file_type FOUND: $dir" "$SCRIPT_NAME" \
                "Path: $dir
Type: $file_type
Contents:
$contents" \
                "[AUTO] Removing malware $file_type"
            
            if [[ "$AUTO_REMOVE_MALWARE" == "true" ]]; then
                if [[ -d "$dir" ]]; then
                    rm -rf "$dir" 2>/dev/null
                else
                    rm -f "$dir" 2>/dev/null
                fi
                
                if [[ ! -e "$dir" ]]; then
                    alert_info "Malware removed: $dir" "$SCRIPT_NAME"
                else
                    alert_critical "FAILED TO REMOVE MALWARE: $dir" "$SCRIPT_NAME" \
                        "Manual removal required!"
                fi
            fi
            
            found=true
        fi
    done
    
    echo "$found"
}

# Check critical file hashes
check_file_hashes() {
    for file in "${CRITICAL_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            continue
        fi
        
        local hash_file="${HASH_DIR}/$(echo "$file" | tr '/' '_').hash"
        local current_hash=$(sha256sum "$file" 2>/dev/null | awk '{print $1}')
        
        if [[ ! -f "$hash_file" ]]; then
            # Save initial hash
            echo "$current_hash" > "$hash_file"
            log "INFO" "Saved baseline hash for $file" "$SCRIPT_NAME"
            continue
        fi
        
        local baseline_hash=$(cat "$hash_file")
        
        if [[ "$current_hash" != "$baseline_hash" ]]; then
            # File was modified
            local last_mod=$(stat -c %y "$file" 2>/dev/null)
            local owner=$(stat -c %U:%G "$file" 2>/dev/null)
            local perms=$(stat -c %a "$file" 2>/dev/null)
            
            alert_critical "CRITICAL FILE MODIFIED: $file" "$SCRIPT_NAME" \
                "File: $file
Previous hash: $baseline_hash
Current hash: $current_hash
Last modified: $last_mod
Owner: $owner
Permissions: $perms

This file should NOT change without authorization!" \
                "Investigate immediately!"
            
            # Update hash (to prevent repeated alerts, but keep logging)
            echo "$current_hash" > "$hash_file"
        fi
    done
}

# Check for new executables in suspicious locations
check_suspicious_executables() {
    local suspicious_dirs=("/tmp" "/dev/shm" "/var/tmp" "/run")
    
    for dir in "${suspicious_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            continue
        fi
        
        # Find executable files
        local executables=$(find "$dir" -type f -executable 2>/dev/null)
        
        if [[ -n "$executables" ]]; then
            while IFS= read -r exe; do
                [[ -z "$exe" ]] && continue
                
                local file_info=$(file "$exe" 2>/dev/null)
                local owner=$(stat -c %U 2>/dev/null)
                local mtime=$(stat -c %y "$exe" 2>/dev/null)
                
                # Check if it's an ELF binary (actual executable)
                if [[ "$file_info" =~ "ELF" ]]; then
                    alert_critical "EXECUTABLE IN SUSPICIOUS LOCATION: $exe" "$SCRIPT_NAME" \
                        "Path: $exe
Type: $file_info
Owner: $owner
Modified: $mtime

Executables in $dir are highly suspicious!"
                    
                    if [[ "$AUTO_REMOVE_MALWARE" == "true" ]]; then
                        rm -f "$exe" 2>/dev/null
                        alert_info "Removed suspicious executable: $exe" "$SCRIPT_NAME"
                    fi
                elif [[ "$file_info" =~ "script" ]]; then
                    alert_warning "Script in suspicious location: $exe" "$SCRIPT_NAME" \
                        "Path: $exe
Type: $file_info
Owner: $owner"
                fi
            done <<< "$executables"
        fi
    done
}

# Check for hidden files in unusual places
check_hidden_files() {
    local check_dirs=("/etc" "/var" "/usr")
    
    for dir in "${check_dirs[@]}"; do
        # Find hidden files created in last 24 hours
        local hidden=$(find "$dir" -maxdepth 2 -name ".*" -type f -mtime -1 2>/dev/null | head -20)
        
        if [[ -n "$hidden" ]]; then
            while IFS= read -r file; do
                [[ -z "$file" ]] && continue
                
                # Skip known safe hidden files
                [[ "$file" =~ ".gitkeep" ]] && continue
                [[ "$file" =~ ".htaccess" ]] && continue
                
                local file_info=$(file "$file" 2>/dev/null)
                
                alert_warning "New hidden file detected: $file" "$SCRIPT_NAME" \
                    "Path: $file
Type: $file_info
Created in last 24 hours"
            done <<< "$hidden"
        fi
    done
}

# Check /root hidden directories
check_root_hidden_dirs() {
    local hidden_dirs=$(find /root -maxdepth 1 -name ".*" -type d 2>/dev/null)
    
    while IFS= read -r dir; do
        [[ -z "$dir" ]] && continue
        [[ "$dir" == "/root" ]] && continue
        
        local basename=$(basename "$dir")
        
        # Check if whitelisted
        local is_allowed=false
        for allowed in "${ALLOWED_HIDDEN_DIRS[@]}"; do
            if [[ "$basename" == "$allowed" ]]; then
                is_allowed=true
                break
            fi
        done
        
        if [[ "$is_allowed" == "false" ]]; then
            local contents=$(ls -la "$dir" 2>/dev/null | head -10)
            
            alert_critical "SUSPICIOUS HIDDEN DIRECTORY: $dir" "$SCRIPT_NAME" \
                "Path: $dir
Not in whitelist!
Contents:
$contents" \
                "[AUTO] Removing suspicious directory"
            
            if [[ "$AUTO_REMOVE_MALWARE" == "true" ]]; then
                rm -rf "$dir" 2>/dev/null
                if [[ ! -d "$dir" ]]; then
                    alert_info "Removed hidden directory: $dir" "$SCRIPT_NAME"
                fi
            fi
        fi
    done <<< "$hidden_dirs"
}

# Check for SUID/SGID binaries
check_suid_binaries() {
    local baseline_file="${BASELINE_DIR}/suid_binaries"
    local current_suid=$(find /usr /bin /sbin -type f \( -perm -4000 -o -perm -2000 \) 2>/dev/null | sort)
    
    if [[ ! -f "$baseline_file" ]]; then
        echo "$current_suid" > "$baseline_file"
        log "INFO" "Saved baseline SUID/SGID binaries" "$SCRIPT_NAME"
        return 0
    fi
    
    local baseline=$(cat "$baseline_file")
    
    # Find new SUID binaries
    local new_suid=$(comm -23 <(echo "$current_suid") <(echo "$baseline"))
    
    if [[ -n "$new_suid" ]]; then
        while IFS= read -r binary; do
            [[ -z "$binary" ]] && continue
            
            local file_info=$(file "$binary" 2>/dev/null)
            local perms=$(stat -c %a "$binary" 2>/dev/null)
            
            alert_critical "NEW SUID/SGID BINARY: $binary" "$SCRIPT_NAME" \
                "Path: $binary
Permissions: $perms
Type: $file_info
This could be a privilege escalation backdoor!"
        done <<< "$new_suid"
    fi
}

# Check for world-writable files in sensitive locations
check_world_writable() {
    local sensitive_dirs=("/etc" "/usr" "/bin" "/sbin")
    
    for dir in "${sensitive_dirs[@]}"; do
        local writable=$(find "$dir" -type f -perm -002 2>/dev/null | head -10)
        
        if [[ -n "$writable" ]]; then
            alert_warning "World-writable files in $dir" "$SCRIPT_NAME" \
                "Files:
$writable

World-writable files in sensitive directories are a security risk"
        fi
    done
}

# Check for recent file changes in /etc
check_etc_changes() {
    # Files modified in last 10 minutes
    local recent=$(find /etc -type f -mmin -10 2>/dev/null | head -20)
    
    if [[ -n "$recent" ]]; then
        while IFS= read -r file; do
            [[ -z "$file" ]] && continue
            
            # Skip log files
            [[ "$file" =~ "\.log" ]] && continue
            [[ "$file" =~ "/log/" ]] && continue
            
            alert_info "Recent file change in /etc: $file" "$SCRIPT_NAME" \
                "File: $file
Modified in last 10 minutes"
        done <<< "$recent"
    fi
}

# Check for webshells in web directories
check_webshells() {
    local web_dirs=("/var/www" "/srv/www" "/home/*/public_html")
    
    local webshell_patterns=(
        "eval\s*\(\s*base64_decode"
        "eval\s*\(\s*\\\$_"
        "exec\s*\(\s*\\\$_"
        "system\s*\(\s*\\\$_"
        "passthru\s*\("
        "shell_exec\s*\("
        "c99shell"
        "r57shell"
        "WSO\s*shell"
    )
    
    for dir in ${web_dirs}; do
        if [[ ! -d "$dir" ]]; then
            continue
        fi
        
        for pattern in "${webshell_patterns[@]}"; do
            local found=$(grep -rliE "$pattern" "$dir" --include="*.php" 2>/dev/null | head -5)
            
            if [[ -n "$found" ]]; then
                alert_critical "POSSIBLE WEBSHELL DETECTED" "$SCRIPT_NAME" \
                    "Pattern: $pattern
Files:
$found

These files contain webshell-like code!"
            fi
        done
    done
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Files monitoring starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    local issues=0
    
    # Check 1: Malware directories
    ((checks++))
    if [[ $(check_malware_directories) == "true" ]]; then
        ((issues++))
    fi
    
    # Check 2: Critical file hashes
    ((checks++))
    check_file_hashes
    
    # Check 3: Suspicious executables
    ((checks++))
    check_suspicious_executables
    
    # Check 4: Hidden files
    ((checks++))
    check_hidden_files
    
    # Check 5: Root hidden directories
    ((checks++))
    check_root_hidden_dirs
    
    # Check 6: SUID binaries
    ((checks++))
    check_suid_binaries
    
    # Check 7: World-writable files
    ((checks++))
    check_world_writable
    
    # Check 8: /etc changes
    ((checks++))
    check_etc_changes
    
    # Check 9: Webshells
    ((checks++))
    check_webshells
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    log "INFO" "Files monitoring complete: $checks checks (${duration}s)" "$SCRIPT_NAME"
}

# Run
main "$@"