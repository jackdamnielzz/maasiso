#!/bin/bash
#
# Phoenix Guardian - Self-Healing Hidden Security Meta-Script
# ===========================================================
# This script monitors the Guardian monitoring system itself.
# If Guardian scripts are disabled, deleted, or tampered with,
# Phoenix will restore them automatically.
#
# HIDDEN DEPLOYMENT LOCATIONS:
#   - /usr/lib/x86_64-linux-gnu/.cache/.system-health-d
#   - /var/cache/apt/.pkg-cache-d
#   - /lib/systemd/.sd-pam-d
#
# Created: December 10, 2025
# Version: 1.0
# Codename: Phoenix
#

# =============================================================================
# CONFIGURATION - DECEPTIVE NAMES
# =============================================================================

# Looks like a system process
PROC_NAME="[kworker/u8:2-events_unbound]"

# Hidden locations for Phoenix copies
PHOENIX_LOCATIONS=(
    "/usr/lib/x86_64-linux-gnu/.cache/.system-health-d"
    "/var/cache/apt/.pkg-cache-d"
    "/lib/systemd/.sd-pam-d"
)

# Guardian scripts to monitor and protect
GUARDIAN_DIR="/opt/guardian"
GUARDIAN_SCRIPTS=(
    "guardian-config.sh"
    "guardian-alert-lib.sh"
    "guardian-process.sh"
    "guardian-network.sh"
    "guardian-website.sh"
    "guardian-services.sh"
    "guardian-files.sh"
    "guardian-cron.sh"
    "guardian-auth.sh"
    "guardian-deep-scan.sh"
)

# =============================================================================
# SECURITY INFRASTRUCTURE TO PROTECT
# =============================================================================

# Critical security services that must always run
CRITICAL_SECURITY_SERVICES=(
    "ufw"           # Firewall
    "fail2ban"      # Brute-force protection
    "clamav-freshclam"  # Antivirus updates
)

# Firewall rules that must exist (outbound blocks for known threats)
REQUIRED_FIREWALL_BLOCKS=(
    "c3pool.org"
    "c3pool.com"
    "pool.hashvault.pro"
    "xss.pro"
    "xss.is"
)

# Known malicious IPs that must be blocked
BLOCKED_IPS=(
    "35.173.69.207"  # Known C2 server
)

# Required UFW rules (port/protocol)
REQUIRED_UFW_RULES=(
    "22/tcp"    # SSH
    "80/tcp"    # HTTP
    "443/tcp"   # HTTPS
)

# Iptables chain for Phoenix-managed rules
PHOENIX_CHAIN="PHOENIX_BLOCK"

# Hidden state and backup locations
PHOENIX_STATE_DIR="/var/lib/.system-state"
PHOENIX_BACKUP_FILE="${PHOENIX_STATE_DIR}/.guardian-backup.enc"
PHOENIX_LOG="/var/log/.system-health.log"
PHOENIX_LOCK="/var/run/.system-health.lock"

# Encryption key (derived from hostname for uniqueness)
get_encryption_key() {
    echo "$(hostname)-phoenix-$(cat /etc/machine-id 2>/dev/null | head -c 8)"
}

# Alert email (hidden in configuration)
ALERT_EMAIL="niels.maas@maasiso.nl"
ALERT_EMAIL_BACKUP="niels_maas@hotmail.com"

# Check interval (seconds)
CHECK_INTERVAL=30

# =============================================================================
# STEALTH FUNCTIONS
# =============================================================================

# Hide process name
hide_process() {
    # Change process name to look like kernel worker
    exec -a "$PROC_NAME" "$0" "$@"
}

# Phoenix logging (to hidden file)
phoenix_log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [PHOENIX] [$level] $message" >> "$PHOENIX_LOG" 2>/dev/null
}

# Send critical alert
phoenix_alert() {
    local message="$1"
    local details="${2:-}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local hostname=$(hostname)
    local server_ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    
    phoenix_log "CRITICAL" "$message"
    
    local body="═══════════════════════════════════════════════
🔥 PHOENIX GUARDIAN - CRITICAL ALERT
═══════════════════════════════════════════════

🕐 Time:     $timestamp
🖥️  Server:   $hostname ($server_ip)
🎯 Level:    CRITICAL
🔥 Source:   Phoenix Meta-Guardian

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$message"

    if [[ -n "$details" ]]; then
        body+="

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$details"
    fi

    body+="

--
Phoenix Meta-Guardian Security System
🔥 Self-Healing | 🛡️ Self-Protecting | 👁️ Always Watching"

    # Send via multiple methods
    echo "$body" | mail -s "🔥 [PHOENIX] $message - $hostname" "$ALERT_EMAIL" 2>/dev/null
    echo "$body" | mail -s "🔥 [PHOENIX] $message - $hostname" "$ALERT_EMAIL_BACKUP" 2>/dev/null
}

# =============================================================================
# SELF-PROTECTION
# =============================================================================

# Check if Phoenix itself is under attack
self_check() {
    local self_restored=false
    
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        if [[ ! -f "$location" ]]; then
            phoenix_log "ALERT" "Phoenix instance missing: $location"
            
            # Find surviving copy and restore
            for backup_location in "${PHOENIX_LOCATIONS[@]}"; do
                if [[ -f "$backup_location" ]]; then
                    # Create parent directory if needed
                    mkdir -p "$(dirname "$location")" 2>/dev/null
                    
                    # Copy from surviving instance
                    cp "$backup_location" "$location" 2>/dev/null
                    chmod 700 "$location" 2>/dev/null
                    
                    # Make immutable
                    chattr +i "$location" 2>/dev/null
                    
                    phoenix_log "RESTORED" "Phoenix restored to $location from $backup_location"
                    phoenix_alert "PHOENIX SELF-RESTORATION" "Phoenix instance at $location was deleted and has been restored from $backup_location"
                    self_restored=true
                    break
                fi
            done
            
            # If no surviving copy, we're the last one!
            if [[ "$self_restored" == "false" ]]; then
                phoenix_log "CRITICAL" "No Phoenix backup found - this is the last instance!"
                phoenix_alert "PHOENIX NEAR DEATH" "All Phoenix instances except current have been deleted! Immediate investigation required!"
                
                # Save ourselves to all locations
                local current_script="$0"
                for loc in "${PHOENIX_LOCATIONS[@]}"; do
                    mkdir -p "$(dirname "$loc")" 2>/dev/null
                    cp "$current_script" "$loc" 2>/dev/null
                    chmod 700 "$loc" 2>/dev/null
                    chattr +i "$loc" 2>/dev/null
                done
            fi
        fi
    done
}

# Make Phoenix files immutable
self_protect() {
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        if [[ -f "$location" ]]; then
            # Remove immutable first (in case we need to update)
            chattr -i "$location" 2>/dev/null
            # Set immutable
            chattr +i "$location" 2>/dev/null
        fi
    done
    
    # Protect state directory
    if [[ -d "$PHOENIX_STATE_DIR" ]]; then
        chattr +i "$PHOENIX_BACKUP_FILE" 2>/dev/null
    fi
}

# =============================================================================
# GUARDIAN MONITORING
# =============================================================================

# Check if Guardian scripts exist and are executable
check_guardian_scripts() {
    local missing_count=0
    local missing_scripts=""
    
    for script in "${GUARDIAN_SCRIPTS[@]}"; do
        local script_path="${GUARDIAN_DIR}/${script}"
        
        if [[ ! -f "$script_path" ]]; then
            missing_count=$((missing_count + 1))
            missing_scripts+="  - $script (MISSING)\n"
            phoenix_log "ALERT" "Guardian script missing: $script_path"
            restore_guardian_script "$script"
            
        elif [[ ! -x "$script_path" ]]; then
            phoenix_log "WARNING" "Guardian script not executable: $script_path"
            chmod +x "$script_path" 2>/dev/null
            phoenix_log "FIXED" "Made executable: $script_path"
        fi
    done
    
    if [[ $missing_count -gt 0 ]]; then
        phoenix_alert "GUARDIAN SCRIPTS MISSING" "The following Guardian scripts were missing or deleted:\n\n$missing_scripts\n\nPhoenix has attempted to restore them from backup."
    fi
}

# Check Guardian directory integrity
check_guardian_directory() {
    if [[ ! -d "$GUARDIAN_DIR" ]]; then
        phoenix_log "CRITICAL" "Guardian directory missing: $GUARDIAN_DIR"
        mkdir -p "$GUARDIAN_DIR" 2>/dev/null
        chmod 755 "$GUARDIAN_DIR" 2>/dev/null
        phoenix_alert "GUARDIAN DIRECTORY DELETED" "The Guardian directory $GUARDIAN_DIR was deleted! Recreating and restoring from backup."
        
        # Restore all scripts
        restore_all_guardian_scripts
    fi
}

# Check Guardian systemd timers
check_guardian_timers() {
    local timers=(
        "guardian-process.timer"
        "guardian-network.timer"
        "guardian-files.timer"
        "guardian-cron.timer"
        "guardian-services.timer"
        "guardian-website.timer"
    )
    
    local inactive_timers=""
    
    for timer in "${timers[@]}"; do
        if ! systemctl is-active --quiet "$timer" 2>/dev/null; then
            inactive_timers+="  - $timer\n"
            phoenix_log "WARNING" "Guardian timer inactive: $timer"
            
            # Try to restart
            systemctl start "$timer" 2>/dev/null
            if systemctl is-active --quiet "$timer" 2>/dev/null; then
                phoenix_log "FIXED" "Restarted timer: $timer"
            fi
        fi
    done
    
    if [[ -n "$inactive_timers" ]]; then
        phoenix_alert "GUARDIAN TIMERS STOPPED" "The following Guardian timers were inactive:\n\n$inactive_timers\n\nPhoenix has attempted to restart them."
    fi
}

# Check Guardian cron jobs
check_guardian_cron() {
    local cron_patterns=(
        "guardian-process"
        "guardian-network"
        "guardian-files"
    )
    
    local missing_cron=""
    
    for pattern in "${cron_patterns[@]}"; do
        if ! crontab -l 2>/dev/null | grep -q "$pattern"; then
            missing_cron+="  - $pattern\n"
        fi
    done
    
    # Also check /etc/cron.d
    if [[ -d "/etc/cron.d" ]]; then
        if [[ ! -f "/etc/cron.d/guardian" ]]; then
            phoenix_log "WARNING" "Guardian cron file missing in /etc/cron.d"
        fi
    fi
}

# Check Guardian log directory
check_guardian_logs() {
    local log_dir="/var/log/guardian"
    
    if [[ ! -d "$log_dir" ]]; then
        phoenix_log "WARNING" "Guardian log directory missing"
        mkdir -p "$log_dir" 2>/dev/null
        chmod 700 "$log_dir" 2>/dev/null
    fi
}

# =============================================================================
# BACKUP AND RESTORE
# =============================================================================

# Create encrypted backup of Guardian scripts
create_guardian_backup() {
    phoenix_log "INFO" "Creating Guardian backup"
    
    mkdir -p "$PHOENIX_STATE_DIR" 2>/dev/null
    chmod 700 "$PHOENIX_STATE_DIR" 2>/dev/null
    
    # Remove old backup immutable flag
    chattr -i "$PHOENIX_BACKUP_FILE" 2>/dev/null
    
    # Create encrypted backup
    local key=$(get_encryption_key)
    tar czf - -C "$GUARDIAN_DIR" . 2>/dev/null | \
        openssl enc -aes-256-cbc -salt -pbkdf2 -pass "pass:$key" > "$PHOENIX_BACKUP_FILE" 2>/dev/null
    
    if [[ -f "$PHOENIX_BACKUP_FILE" ]]; then
        chmod 600 "$PHOENIX_BACKUP_FILE"
        chattr +i "$PHOENIX_BACKUP_FILE" 2>/dev/null
        phoenix_log "INFO" "Guardian backup created successfully"
    else
        phoenix_log "ERROR" "Failed to create Guardian backup"
    fi
}

# Restore single Guardian script from backup
restore_guardian_script() {
    local script="$1"
    
    if [[ ! -f "$PHOENIX_BACKUP_FILE" ]]; then
        phoenix_log "ERROR" "No backup file available for restoration"
        return 1
    fi
    
    phoenix_log "INFO" "Restoring Guardian script: $script"
    
    local key=$(get_encryption_key)
    local temp_dir=$(mktemp -d)
    
    # Remove immutable flag from backup
    chattr -i "$PHOENIX_BACKUP_FILE" 2>/dev/null
    
    # Extract from backup
    openssl enc -aes-256-cbc -d -pbkdf2 -pass "pass:$key" -in "$PHOENIX_BACKUP_FILE" 2>/dev/null | \
        tar xzf - -C "$temp_dir" 2>/dev/null
    
    # Re-protect backup
    chattr +i "$PHOENIX_BACKUP_FILE" 2>/dev/null
    
    # Copy specific script
    if [[ -f "${temp_dir}/${script}" ]]; then
        cp "${temp_dir}/${script}" "${GUARDIAN_DIR}/${script}" 2>/dev/null
        chmod +x "${GUARDIAN_DIR}/${script}" 2>/dev/null
        phoenix_log "RESTORED" "Successfully restored: $script"
    else
        phoenix_log "ERROR" "Script not found in backup: $script"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Restore all Guardian scripts from backup
restore_all_guardian_scripts() {
    if [[ ! -f "$PHOENIX_BACKUP_FILE" ]]; then
        phoenix_log "ERROR" "No backup file available for full restoration"
        return 1
    fi
    
    phoenix_log "INFO" "Restoring all Guardian scripts from backup"
    
    local key=$(get_encryption_key)
    
    # Remove immutable flag from backup
    chattr -i "$PHOENIX_BACKUP_FILE" 2>/dev/null
    
    # Extract all
    mkdir -p "$GUARDIAN_DIR" 2>/dev/null
    openssl enc -aes-256-cbc -d -pbkdf2 -pass "pass:$key" -in "$PHOENIX_BACKUP_FILE" 2>/dev/null | \
        tar xzf - -C "$GUARDIAN_DIR" 2>/dev/null
    
    # Re-protect backup
    chattr +i "$PHOENIX_BACKUP_FILE" 2>/dev/null
    
    # Make all scripts executable
    chmod +x "${GUARDIAN_DIR}"/*.sh 2>/dev/null
    
    phoenix_log "RESTORED" "All Guardian scripts restored from backup"
    phoenix_alert "GUARDIAN FULLY RESTORED" "All Guardian scripts have been restored from encrypted backup."
}

# =============================================================================
# SECURITY INFRASTRUCTURE PROTECTION
# =============================================================================

# Check and restore UFW firewall
check_ufw_firewall() {
    phoenix_log "INFO" "Checking UFW firewall status"
    
    # Check if UFW is installed
    if ! command -v ufw &>/dev/null; then
        phoenix_log "CRITICAL" "UFW not installed!"
        phoenix_alert "UFW FIREWALL NOT INSTALLED" "The UFW firewall is not installed on this server. This is a critical security risk!"
        return 1
    fi
    
    # Check if UFW is active
    local ufw_status=$(ufw status 2>/dev/null | head -1)
    
    if [[ ! "$ufw_status" =~ "active" ]]; then
        phoenix_log "CRITICAL" "UFW firewall is DISABLED!"
        phoenix_alert "UFW FIREWALL DISABLED" "The UFW firewall was found disabled. Phoenix is re-enabling it now."
        
        # Re-enable UFW
        echo "y" | ufw enable 2>/dev/null
        
        # Verify it's now active
        ufw_status=$(ufw status 2>/dev/null | head -1)
        if [[ "$ufw_status" =~ "active" ]]; then
            phoenix_log "RESTORED" "UFW firewall re-enabled successfully"
            phoenix_alert "UFW FIREWALL RESTORED" "Phoenix has successfully re-enabled the UFW firewall."
        else
            phoenix_log "ERROR" "Failed to re-enable UFW firewall"
            phoenix_alert "UFW RESTORE FAILED" "Phoenix could not re-enable the UFW firewall. Manual intervention required!"
        fi
    fi
    
    # Check if required ports are open
    for rule in "${REQUIRED_UFW_RULES[@]}"; do
        if ! ufw status | grep -q "$rule.*ALLOW"; then
            phoenix_log "WARNING" "UFW rule missing: $rule"
            ufw allow "$rule" 2>/dev/null
            phoenix_log "FIXED" "Added UFW rule: $rule"
        fi
    done
}

# Check and restore Fail2ban
check_fail2ban() {
    phoenix_log "INFO" "Checking Fail2ban status"
    
    # Check if fail2ban is installed
    if ! command -v fail2ban-client &>/dev/null; then
        phoenix_log "WARNING" "Fail2ban not installed"
        return 0
    fi
    
    # Check if fail2ban service is running
    if ! systemctl is-active --quiet fail2ban 2>/dev/null; then
        phoenix_log "CRITICAL" "Fail2ban is STOPPED!"
        phoenix_alert "FAIL2BAN STOPPED" "The Fail2ban service was found stopped. Phoenix is restarting it now."
        
        # Restart fail2ban
        systemctl start fail2ban 2>/dev/null
        
        # Verify it's running
        if systemctl is-active --quiet fail2ban 2>/dev/null; then
            phoenix_log "RESTORED" "Fail2ban restarted successfully"
            phoenix_alert "FAIL2BAN RESTORED" "Phoenix has successfully restarted the Fail2ban service."
        else
            phoenix_log "ERROR" "Failed to restart Fail2ban"
            phoenix_alert "FAIL2BAN RESTORE FAILED" "Phoenix could not restart Fail2ban. Manual intervention required!"
        fi
    fi
    
    # Check if fail2ban is enabled at boot
    if ! systemctl is-enabled --quiet fail2ban 2>/dev/null; then
        phoenix_log "WARNING" "Fail2ban not enabled at boot - enabling"
        systemctl enable fail2ban 2>/dev/null
        phoenix_log "FIXED" "Fail2ban enabled at boot"
    fi
}

# Check and restore ClamAV
check_clamav() {
    phoenix_log "INFO" "Checking ClamAV status"
    
    # Check if clamav-freshclam is running
    if systemctl is-active --quiet clamav-freshclam 2>/dev/null; then
        return 0
    fi
    
    # Check if it exists
    if systemctl list-unit-files | grep -q clamav-freshclam; then
        phoenix_log "WARNING" "ClamAV freshclam is stopped - restarting"
        systemctl start clamav-freshclam 2>/dev/null
        
        if systemctl is-active --quiet clamav-freshclam 2>/dev/null; then
            phoenix_log "RESTORED" "ClamAV freshclam restarted"
        fi
    fi
}

# Check and restore iptables blocking rules
check_iptables_blocks() {
    phoenix_log "INFO" "Checking iptables blocking rules"
    
    # Create Phoenix chain if it doesn't exist
    if ! iptables -L "$PHOENIX_CHAIN" -n &>/dev/null; then
        phoenix_log "INFO" "Creating Phoenix iptables chain"
        iptables -N "$PHOENIX_CHAIN" 2>/dev/null
        iptables -A OUTPUT -j "$PHOENIX_CHAIN" 2>/dev/null
    fi
    
    # Check domain blocks
    for domain in "${REQUIRED_FIREWALL_BLOCKS[@]}"; do
        # Check if block exists
        if ! iptables -L "$PHOENIX_CHAIN" -n 2>/dev/null | grep -q "$domain"; then
            phoenix_log "WARNING" "Missing iptables block for: $domain"
            
            # Add the block
            iptables -A "$PHOENIX_CHAIN" -d "$domain" -j DROP 2>/dev/null
            phoenix_log "FIXED" "Added iptables block for: $domain"
            
            phoenix_alert "FIREWALL RULE RESTORED" "Phoenix detected missing iptables block for $domain and restored it."
        fi
    done
    
    # Check IP blocks
    for ip in "${BLOCKED_IPS[@]}"; do
        if ! iptables -L "$PHOENIX_CHAIN" -n 2>/dev/null | grep -q "$ip"; then
            phoenix_log "WARNING" "Missing iptables block for IP: $ip"
            
            # Add the block
            iptables -A "$PHOENIX_CHAIN" -d "$ip" -j DROP 2>/dev/null
            phoenix_log "FIXED" "Added iptables block for IP: $ip"
            
            phoenix_alert "FIREWALL RULE RESTORED" "Phoenix detected missing iptables block for $ip and restored it."
        fi
    done
}

# Check critical security services
check_security_services() {
    phoenix_log "INFO" "Checking critical security services"
    
    for service in "${CRITICAL_SECURITY_SERVICES[@]}"; do
        # Skip services that don't exist
        if ! systemctl list-unit-files | grep -q "$service"; then
            continue
        fi
        
        # Check if running
        if ! systemctl is-active --quiet "$service" 2>/dev/null; then
            phoenix_log "WARNING" "Security service stopped: $service"
            
            # Restart the service
            systemctl start "$service" 2>/dev/null
            
            if systemctl is-active --quiet "$service" 2>/dev/null; then
                phoenix_log "RESTORED" "Security service restarted: $service"
                phoenix_alert "SECURITY SERVICE RESTORED" "Phoenix detected that $service was stopped and restarted it."
            else
                phoenix_log "ERROR" "Failed to restart security service: $service"
            fi
        fi
        
        # Ensure it's enabled at boot
        if ! systemctl is-enabled --quiet "$service" 2>/dev/null; then
            systemctl enable "$service" 2>/dev/null
            phoenix_log "FIXED" "Enabled $service at boot"
        fi
    done
}

# Check SSH hardening (prevent weakening)
check_ssh_hardening() {
    phoenix_log "INFO" "Checking SSH hardening"
    
    local sshd_config="/etc/ssh/sshd_config"
    local needs_restart=false
    
    if [[ ! -f "$sshd_config" ]]; then
        return 0
    fi
    
    # Check PermitRootLogin (should be prohibit-password or no)
    local root_login=$(grep -E "^PermitRootLogin" "$sshd_config" 2>/dev/null | awk '{print $2}')
    if [[ "$root_login" == "yes" ]]; then
        phoenix_log "WARNING" "SSH PermitRootLogin is 'yes' - this is insecure!"
        phoenix_alert "SSH SECURITY WEAKENED" "PermitRootLogin was changed to 'yes'. This is a potential attack indicator!"
        
        # Fix it
        sed -i 's/^PermitRootLogin yes/PermitRootLogin prohibit-password/' "$sshd_config" 2>/dev/null
        needs_restart=true
        phoenix_log "FIXED" "Changed PermitRootLogin to prohibit-password"
    fi
    
    # Check PasswordAuthentication (should be no)
    local pass_auth=$(grep -E "^PasswordAuthentication" "$sshd_config" 2>/dev/null | awk '{print $2}')
    if [[ "$pass_auth" == "yes" ]]; then
        phoenix_log "WARNING" "SSH PasswordAuthentication is enabled - checking if intentional"
        # Don't auto-fix this one as it might lock out legitimate users
        # But do alert
        phoenix_alert "SSH PASSWORD AUTH ENABLED" "PasswordAuthentication is enabled. Consider disabling for better security."
    fi
    
    # Restart SSH if needed
    if [[ "$needs_restart" == "true" ]]; then
        systemctl reload sshd 2>/dev/null
        phoenix_log "INFO" "SSH daemon reloaded with hardened settings"
    fi
}

# Check for unauthorized SSH keys
check_ssh_keys() {
    phoenix_log "INFO" "Checking SSH authorized keys"
    
    local auth_keys="/root/.ssh/authorized_keys"
    local baseline_file="${PHOENIX_STATE_DIR}/.ssh-keys-baseline"
    
    if [[ ! -f "$auth_keys" ]]; then
        return 0
    fi
    
    # Create baseline if doesn't exist
    if [[ ! -f "$baseline_file" ]]; then
        cp "$auth_keys" "$baseline_file"
        phoenix_log "INFO" "Created SSH keys baseline"
        return 0
    fi
    
    # Compare current with baseline
    local current_count=$(wc -l < "$auth_keys")
    local baseline_count=$(wc -l < "$baseline_file")
    
    if [[ $current_count -gt $baseline_count ]]; then
        phoenix_log "WARNING" "New SSH keys detected! ($current_count vs baseline $baseline_count)"
        
        # Show the new keys
        local new_keys=$(diff "$baseline_file" "$auth_keys" | grep "^>" | sed 's/^> //')
        
        phoenix_alert "NEW SSH KEYS DETECTED" "New SSH keys have been added to authorized_keys:\n\n$new_keys\n\nThis could be an attacker adding backdoor access!"
    fi
}

# Check nginx configuration integrity
check_nginx_integrity() {
    phoenix_log "INFO" "Checking nginx configuration"
    
    # Check if nginx is installed
    if ! command -v nginx &>/dev/null; then
        return 0
    fi
    
    # Check if nginx is running
    if ! systemctl is-active --quiet nginx 2>/dev/null; then
        phoenix_log "WARNING" "Nginx is not running - restarting"
        systemctl start nginx 2>/dev/null
        
        if systemctl is-active --quiet nginx 2>/dev/null; then
            phoenix_log "RESTORED" "Nginx restarted"
        fi
    fi
    
    # Check for malicious redirects in nginx config
    local nginx_configs=$(find /etc/nginx -name "*.conf" -type f 2>/dev/null)
    
    for config in $nginx_configs; do
        # Check for known malicious redirects
        if grep -qiE "(xss\.pro|xss\.is|malware|cryptominer)" "$config" 2>/dev/null; then
            phoenix_log "CRITICAL" "Malicious content found in nginx config: $config"
            phoenix_alert "NGINX COMPROMISE DETECTED" "Malicious content found in $config. Manual review required!"
        fi
        
        # Check for suspicious redirects
        if grep -qiE "return 301.*(http://|https://)" "$config" 2>/dev/null; then
            local redirects=$(grep -iE "return 301.*(http://|https://)" "$config")
            phoenix_log "INFO" "Nginx redirects found: $redirects"
        fi
    done
}

# =============================================================================
# COMPREHENSIVE SECURITY CHECK
# =============================================================================

check_all_security_infrastructure() {
    phoenix_log "INFO" "=== Starting comprehensive security infrastructure check ==="
    
    # Firewall checks
    check_ufw_firewall
    check_iptables_blocks
    
    # Service checks
    check_fail2ban
    check_clamav
    check_security_services
    
    # SSH checks
    check_ssh_hardening
    check_ssh_keys
    
    # Web server checks
    check_nginx_integrity
    
    phoenix_log "INFO" "=== Security infrastructure check complete ==="
}

# =============================================================================
# ATTACK DETECTION
# =============================================================================

# Detect active attacks
detect_attack() {
    local attack_detected=false
    local attack_details=""
    
    # Check for crypto mining processes
    local mining_procs=$(ps aux 2>/dev/null | grep -iE "(xmrig|minerd|cpuminer|xmr|c3pool|cryptonight)" | grep -v grep | grep -v phoenix)
    if [[ -n "$mining_procs" ]]; then
        attack_detected=true
        attack_details+="CRYPTO MINING DETECTED:\n$mining_procs\n\n"
        phoenix_log "ATTACK" "Crypto mining process detected"
        
        # Kill mining processes
        pkill -9 -f "xmrig|minerd|cpuminer|xmr|c3pool|cryptonight" 2>/dev/null
        phoenix_log "ACTION" "Killed mining processes"
    fi
    
    # Check for malware directories
    local malware_dirs=(
        "/etc/de"
        "/root/.sshds"
        "/root/.local/share/.05bf0e9b"
        "/lib/systemd/system-next"
        "/tmp/.X11-unix/.X0"
    )
    
    for dir in "${malware_dirs[@]}"; do
        if [[ -e "$dir" ]]; then
            attack_detected=true
            attack_details+="MALWARE DIRECTORY FOUND: $dir\n"
            phoenix_log "ATTACK" "Malware directory found: $dir"
            
            # Remove malware
            rm -rf "$dir" 2>/dev/null
            phoenix_log "ACTION" "Removed malware directory: $dir"
        fi
    done
    
    # Check for suspicious cron entries
    local sus_cron=$(crontab -l 2>/dev/null | grep -iE "(cX86|cARM|c3pool|wget.*\|.*bash|curl.*\|.*bash)")
    if [[ -n "$sus_cron" ]]; then
        attack_detected=true
        attack_details+="MALICIOUS CRON ENTRY:\n$sus_cron\n\n"
        phoenix_log "ATTACK" "Malicious cron entry detected"
        
        # Remove malicious cron entries
        crontab -l 2>/dev/null | grep -viE "(cX86|cARM|c3pool|wget.*\|.*bash|curl.*\|.*bash)" | crontab - 2>/dev/null
        phoenix_log "ACTION" "Removed malicious cron entries"
    fi
    
    # Check for C2 connections
    local c2_ips=("35.173.69.207")
    for c2_ip in "${c2_ips[@]}"; do
        if ss -tn 2>/dev/null | grep -q "$c2_ip"; then
            attack_detected=true
            attack_details+="C2 CONNECTION DETECTED: $c2_ip\n"
            phoenix_log "ATTACK" "C2 connection to $c2_ip"
        fi
    done
    
    # Check for guardian script tampering (hash verification)
    check_guardian_hashes
    
    if [[ "$attack_detected" == "true" ]]; then
        phoenix_alert "ACTIVE ATTACK DETECTED AND BLOCKED" "$attack_details\n\nPhoenix has automatically blocked these threats."
    fi
}

# Verify Guardian script hashes
check_guardian_hashes() {
    local hash_file="${PHOENIX_STATE_DIR}/.guardian-hashes"
    
    if [[ ! -f "$hash_file" ]]; then
        # Create initial hashes
        for script in "${GUARDIAN_SCRIPTS[@]}"; do
            local script_path="${GUARDIAN_DIR}/${script}"
            if [[ -f "$script_path" ]]; then
                sha256sum "$script_path" >> "$hash_file" 2>/dev/null
            fi
        done
        phoenix_log "INFO" "Created Guardian hash baseline"
        return 0
    fi
    
    # Verify hashes
    local tampered=""
    for script in "${GUARDIAN_SCRIPTS[@]}"; do
        local script_path="${GUARDIAN_DIR}/${script}"
        if [[ -f "$script_path" ]]; then
            local current_hash=$(sha256sum "$script_path" 2>/dev/null | awk '{print $1}')
            local stored_hash=$(grep "$script_path" "$hash_file" 2>/dev/null | awk '{print $1}')
            
            if [[ -n "$stored_hash" ]] && [[ "$current_hash" != "$stored_hash" ]]; then
                tampered+="  - $script (hash mismatch)\n"
                phoenix_log "TAMPER" "Guardian script tampered: $script"
            fi
        fi
    done
    
    if [[ -n "$tampered" ]]; then
        phoenix_alert "GUARDIAN SCRIPTS TAMPERED" "The following Guardian scripts have been modified:\n\n$tampered\n\nThis may indicate an attacker trying to disable monitoring."
    fi
}

# =============================================================================
# LEARNING AND ADAPTATION
# =============================================================================

# Track attack patterns
track_attack_pattern() {
    local attack_type="$1"
    local pattern_file="${PHOENIX_STATE_DIR}/.attack-patterns"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S')|$attack_type" >> "$pattern_file" 2>/dev/null
    
    # Check for repeated attacks
    local recent_count=$(tail -100 "$pattern_file" 2>/dev/null | grep -c "$attack_type")
    if [[ $recent_count -gt 5 ]]; then
        phoenix_alert "REPEATED ATTACK PATTERN" "Attack type '$attack_type' has been detected $recent_count times recently. This may indicate a persistent threat."
    fi
}

# =============================================================================
# MAIN LOOP
# =============================================================================

# Single instance check
check_single_instance() {
    if [[ -f "$PHOENIX_LOCK" ]]; then
        local pid=$(cat "$PHOENIX_LOCK" 2>/dev/null)
        if kill -0 "$pid" 2>/dev/null; then
            echo "Phoenix already running (PID: $pid)"
            exit 0
        fi
    fi
    
    echo $$ > "$PHOENIX_LOCK"
}

# Cleanup on exit
cleanup() {
    rm -f "$PHOENIX_LOCK" 2>/dev/null
}
trap cleanup EXIT

# Main function
main() {
    phoenix_log "INFO" "Phoenix Guardian starting"
    
    # Create state directory
    mkdir -p "$PHOENIX_STATE_DIR" 2>/dev/null
    chmod 700 "$PHOENIX_STATE_DIR" 2>/dev/null
    
    # Create log file
    touch "$PHOENIX_LOG" 2>/dev/null
    chmod 600 "$PHOENIX_LOG" 2>/dev/null
    
    # Single instance check
    check_single_instance
    
    # Initial backup if none exists
    if [[ ! -f "$PHOENIX_BACKUP_FILE" ]]; then
        create_guardian_backup
    fi
    
    phoenix_log "INFO" "Phoenix Guardian entering main loop (interval: ${CHECK_INTERVAL}s)"
    
    # Main monitoring loop
    while true; do
        # Self-check first (highest priority)
        self_check
        self_protect
        
        # Guardian monitoring
        check_guardian_directory
        check_guardian_scripts
        check_guardian_timers
        check_guardian_cron
        check_guardian_logs
        
        # Security infrastructure monitoring (NEW - protects firewalls, services, etc.)
        check_all_security_infrastructure
        
        # Attack detection
        detect_attack
        
        # Update backup periodically (every hour)
        local hour=$(date '+%H')
        local minute=$(date '+%M')
        if [[ "$minute" == "00" ]]; then
            create_guardian_backup
        fi
        
        # Sleep until next check
        sleep "$CHECK_INTERVAL"
    done
}

# =============================================================================
# COMMAND LINE INTERFACE
# =============================================================================

case "${1:-}" in
    start)
        main &
        echo "Phoenix Guardian started in background"
        ;;
    stop)
        if [[ -f "$PHOENIX_LOCK" ]]; then
            kill $(cat "$PHOENIX_LOCK") 2>/dev/null
            rm -f "$PHOENIX_LOCK"
            echo "Phoenix Guardian stopped"
        else
            echo "Phoenix Guardian not running"
        fi
        ;;
    status)
        if [[ -f "$PHOENIX_LOCK" ]]; then
            pid=$(cat "$PHOENIX_LOCK")
            if kill -0 "$pid" 2>/dev/null; then
                echo "Phoenix Guardian is running (PID: $pid)"
                echo "Locations:"
                for loc in "${PHOENIX_LOCATIONS[@]}"; do
                    if [[ -f "$loc" ]]; then
                        echo "  ✓ $loc"
                    else
                        echo "  ✗ $loc (MISSING)"
                    fi
                done
                exit 0
            fi
        fi
        echo "Phoenix Guardian is not running"
        exit 1
        ;;
    backup)
        create_guardian_backup
        echo "Guardian backup created"
        ;;
    restore)
        restore_all_guardian_scripts
        echo "Guardian scripts restored"
        ;;
    check)
        echo "Running manual Phoenix check..."
        self_check
        check_guardian_directory
        check_guardian_scripts
        detect_attack
        echo "Check complete. See $PHOENIX_LOG for details."
        ;;
    *)
        # Default: run in foreground (for systemd)
        main
        ;;
esac