#!/bin/bash
#
# Enhanced Security Monitor Script
# =================================
# Comprehensive security monitoring for MaasISO VPS infrastructure
# 
# Created: December 9, 2025
# Purpose: Post-incident monitoring after cryptominer/redirect attack
#
# Usage:
#   ./20-enhanced-security-monitor.sh              # Run all checks
#   ./20-enhanced-security-monitor.sh --dry-run    # Test mode (no alerts sent)
#   ./20-enhanced-security-monitor.sh --hourly-report  # Send hourly summary
#   ./20-enhanced-security-monitor.sh --test-alerts    # Send test notifications only
#
# Cron setup:
#   */5 * * * * /root/security_monitor.sh
#   0 * * * * /root/security_monitor.sh --hourly-report
#

# NOTE: Strict mode disabled - it causes early exit on grep "not found" which is expected behavior
# set -euo pipefail
set -u  # Keep unset variable checking but allow command failures

# =============================================================================
# CONFIGURATION
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/security-monitor-config.sh"

# Source configuration
if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
else
    echo "ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# Parse command line arguments
DRY_RUN=false
HOURLY_REPORT=false
VERBOSE=false
TEST_ALERTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --hourly-report)
            HOURLY_REPORT=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --test-alerts)
            TEST_ALERTS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# INITIALIZATION
# =============================================================================

# Create required directories
mkdir -p "$LOG_DIR" "$STATE_DIR"
chmod 700 "$LOG_DIR" "$STATE_DIR"

# Initialize counters
CRITICAL_COUNT=0
WARNING_COUNT=0
INFO_COUNT=0
CHECKS_PASSED=0
CHECKS_FAILED=0

# Store findings for hourly report
declare -a FINDINGS=()

# Timestamp for logs
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DATE_SHORT=$(date '+%Y%m%d_%H%M%S')

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    local message="$2"
    echo "[$TIMESTAMP] [$level] $message" >> "$MAIN_LOG"
    if [[ "$VERBOSE" == "true" ]] || [[ "$level" != "DEBUG" ]]; then
        echo "[$level] $message"
    fi
}

log_alert() {
    local level="$1"
    local message="$2"
    echo "[$TIMESTAMP] [$level] $message" >> "$ALERT_LOG"
    FINDINGS+=("[$level] $message")
}

# =============================================================================
# ALERTING FUNCTIONS
# =============================================================================

send_email() {
    local subject="$1"
    local body="$2"
    local recipient="$3"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY-RUN] Would send email to $recipient: $subject"
        return 0
    fi
    
    # Try multiple mail methods
    if command -v mail &>/dev/null; then
        echo "$body" | mail -s "$subject" "$recipient"
    elif command -v sendmail &>/dev/null; then
        {
            echo "To: $recipient"
            echo "Subject: $subject"
            echo ""
            echo "$body"
        } | sendmail -t
    elif command -v msmtp &>/dev/null; then
        {
            echo "To: $recipient"
            echo "Subject: $subject"
            echo ""
            echo "$body"
        } | msmtp "$recipient"
    else
        log "WARNING" "No mail command available, cannot send email"
        return 1
    fi
}

send_sms_pushover() {
    local message="$1"
    local priority="${2:-1}"  # 1 = high priority (makes noise)
    
    if [[ -z "$PUSHOVER_TOKEN" ]] || [[ -z "$PUSHOVER_USER" ]]; then
        log "DEBUG" "Pushover not configured, skipping SMS"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY-RUN] Would send Pushover SMS: $message"
        return 0
    fi
    
    curl -s \
        --form-string "token=$PUSHOVER_TOKEN" \
        --form-string "user=$PUSHOVER_USER" \
        --form-string "message=$message" \
        --form-string "priority=$priority" \
        --form-string "sound=siren" \
        https://api.pushover.net/1/messages.json > /dev/null
}

send_slack() {
    local message="$1"
    local color="${2:-danger}"  # danger=red, warning=yellow, good=green
    
    if [[ -z "$SLACK_WEBHOOK" ]]; then
        log "DEBUG" "Slack not configured, skipping"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY-RUN] Would send Slack message: $message"
        return 0
    fi
    
    local payload=$(cat <<EOF
{
    "attachments": [{
        "color": "$color",
        "title": "Security Alert - $HOSTNAME",
        "text": "$message",
        "ts": $(date +%s)
    }]
}
EOF
)
    
    curl -s -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK" > /dev/null
}

# =============================================================================
# ALERT DISPATCH
# =============================================================================

alert_critical() {
    local message="$1"
    local subject="🚨 CRITICAL: Security Alert on $HOSTNAME"
    local full_message="CRITICAL SECURITY ALERT

Server: $HOSTNAME ($SERVER_IP)
Role: $SERVER_ROLE
Time: $TIMESTAMP

Issue: $message

Immediate action required!

--
MaasISO Security Monitor"

    ((CRITICAL_COUNT++))
    log_alert "CRITICAL" "$message"
    log "CRITICAL" "$message"
    
    # Send to both emails
    send_email "$subject" "$full_message" "$ALERT_EMAIL_PRIMARY"
    send_email "$subject" "$full_message" "$ALERT_EMAIL_SECONDARY"
    
    # Send SMS
    send_sms_pushover "🚨 CRITICAL: $message on $HOSTNAME"
    
    # Send Slack
    send_slack "$message" "danger"
}

alert_warning() {
    local message="$1"
    local subject="⚠️ WARNING: Security Alert on $HOSTNAME"
    local full_message="SECURITY WARNING

Server: $HOSTNAME ($SERVER_IP)
Role: $SERVER_ROLE
Time: $TIMESTAMP

Issue: $message

Please investigate.

--
MaasISO Security Monitor"

    ((WARNING_COUNT++))
    log_alert "WARNING" "$message"
    log "WARNING" "$message"
    
    # Send to both emails
    send_email "$subject" "$full_message" "$ALERT_EMAIL_PRIMARY"
    send_email "$subject" "$full_message" "$ALERT_EMAIL_SECONDARY"
    
    # Send Slack (no SMS for warnings)
    send_slack "$message" "warning"
}

alert_info() {
    local message="$1"
    ((INFO_COUNT++))
    log "INFO" "$message"
}

# =============================================================================
# SECURITY CHECKS
# =============================================================================

# -----------------------------------------------------------------------------
# Check 1: Nginx Config Tampering
# -----------------------------------------------------------------------------
check_nginx_config() {
    log "INFO" "Checking nginx configuration integrity..."
    
    local nginx_conf="/etc/nginx/nginx.conf"
    local expected_hash=$(get_expected_nginx_hash)
    
    if [[ ! -f "$nginx_conf" ]]; then
        alert_info "Nginx not installed or config not found"
        return 0
    fi
    
    if [[ -z "$expected_hash" ]]; then
        log "WARNING" "No expected nginx hash configured - skipping integrity check"
        log "INFO" "Current hash: $(sha256sum "$nginx_conf" | awk '{print $1}')"
        ((CHECKS_PASSED++))
        return 0
    fi
    
    local current_hash=$(sha256sum "$nginx_conf" | awk '{print $1}')
    
    if [[ "$current_hash" != "$expected_hash" ]]; then
        alert_critical "Nginx config has been modified! Expected: $expected_hash, Got: $current_hash"
        ((CHECKS_FAILED++))
    else
        alert_info "Nginx config integrity OK"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 2: Known Malware Directories
# -----------------------------------------------------------------------------
check_malware_directories() {
    log "INFO" "Checking for known malware directories..."
    
    local found=false
    for dir in "${MALWARE_DIRECTORIES[@]}"; do
        if [[ -d "$dir" ]] || [[ -f "$dir" ]]; then
            alert_critical "MALWARE FOUND: $dir exists!"
            found=true
        fi
    done
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "No known malware directories found"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 3: Malicious Cron Jobs
# -----------------------------------------------------------------------------
check_cron_jobs() {
    log "INFO" "Checking cron jobs for malicious patterns..."
    
    local cron_locations=(
        "/etc/crontab"
        "/etc/cron.d/"
        "/var/spool/cron/"
        "/var/spool/cron/crontabs/"
    )
    
    local found=false
    
    for location in "${cron_locations[@]}"; do
        if [[ -e "$location" ]]; then
            for pattern in "${CRON_MALWARE_PATTERNS[@]}"; do
                if grep -rqE "$pattern" "$location" 2>/dev/null; then
                    local match=$(grep -rE "$pattern" "$location" 2>/dev/null | head -5)
                    alert_critical "Malicious cron pattern found in $location: $match"
                    found=true
                fi
            done
        fi
    done
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "No malicious cron patterns found"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 4: Suspicious Systemd Services
# -----------------------------------------------------------------------------
check_systemd_services() {
    log "INFO" "Checking for suspicious systemd services..."
    
    local found=false
    local services_dir="/etc/systemd/system"
    
    if [[ -d "$services_dir" ]]; then
        for pattern in "${SUSPICIOUS_SERVICE_PATTERNS[@]}"; do
            local matches=$(find "$services_dir" -name "*.service" 2>/dev/null | xargs -I {} basename {} 2>/dev/null | grep -iE "$pattern" || true)
            if [[ -n "$matches" ]]; then
                alert_critical "Suspicious systemd service found: $matches"
                found=true
            fi
        done
        
        # Also check for recently created services (last 24 hours)
        local recent=$(find "$services_dir" -name "*.service" -mtime -1 2>/dev/null)
        if [[ -n "$recent" ]]; then
            alert_warning "Recently created systemd services (last 24h): $recent"
        fi
    fi
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "No suspicious systemd services found"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 5: Infected .bashrc / .profile
# -----------------------------------------------------------------------------
check_profile_files() {
    log "INFO" "Checking shell profile files for infections..."
    
    local files_to_check=(
        "/root/.bashrc"
        "/root/.profile"
        "/root/.bash_profile"
        "/etc/profile"
        "/etc/bash.bashrc"
    )
    
    local found=false
    
    for file in "${files_to_check[@]}"; do
        if [[ -f "$file" ]]; then
            for pattern in "${PROFILE_MALWARE_PATTERNS[@]}"; do
                if grep -qE "$pattern" "$file" 2>/dev/null; then
                    local match=$(grep -E "$pattern" "$file" 2>/dev/null | head -3)
                    alert_critical "Malicious pattern in $file: $match"
                    found=true
                fi
            done
        fi
    done
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "Shell profile files are clean"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 6: Unauthorized SSH Keys
# -----------------------------------------------------------------------------
check_ssh_keys() {
    log "INFO" "Checking authorized SSH keys..."
    
    local auth_keys="/root/.ssh/authorized_keys"
    
    if [[ ! -f "$auth_keys" ]]; then
        alert_warning "No authorized_keys file found"
        ((CHECKS_PASSED++))
        return 0
    fi
    
    # Get whitelist for current server
    local -a whitelist
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        whitelist=("${BACKEND_SSH_WHITELIST[@]}")
    else
        whitelist=("${FRONTEND_SSH_WHITELIST[@]}")
    fi
    
    local found_unauthorized=false
    local key_count=0
    
    while IFS= read -r line; do
        # Skip empty lines and comments
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^# ]] && continue
        
        ((key_count++))
        
        # Extract the comment (last field)
        local comment=$(echo "$line" | awk '{print $NF}')
        
        # Check if this key is in whitelist
        local is_whitelisted=false
        for allowed in "${whitelist[@]}"; do
            if [[ "$comment" == *"$allowed"* ]] || [[ "$line" == *"$allowed"* ]]; then
                is_whitelisted=true
                break
            fi
        done
        
        if [[ "$is_whitelisted" == "false" ]]; then
            alert_critical "UNAUTHORIZED SSH KEY FOUND: $comment"
            found_unauthorized=true
        fi
    done < "$auth_keys"
    
    # Check total key count
    if [[ $key_count -gt $MAX_SSH_KEYS ]]; then
        alert_warning "High number of SSH keys: $key_count (max recommended: $MAX_SSH_KEYS)"
    fi
    
    if [[ "$found_unauthorized" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "All $key_count SSH keys are authorized"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 7: Hidden Binaries in /lib/systemd/
# -----------------------------------------------------------------------------
check_hidden_systemd_binaries() {
    log "INFO" "Checking for hidden binaries in /lib/systemd/..."
    
    local found=false
    
    # Look for hidden files/dirs
    local hidden=$(find /lib/systemd/ -name ".*" -type f 2>/dev/null)
    if [[ -n "$hidden" ]]; then
        alert_critical "Hidden files in /lib/systemd/: $hidden"
        found=true
    fi
    
    # Look for executables in unusual places
    local unusual=$(find /lib/systemd/ -type f -executable ! -path "*/systemd/*" 2>/dev/null | grep -v "\.so" || true)
    if [[ -n "$unusual" ]]; then
        alert_warning "Unusual executables in /lib/systemd/: $unusual"
    fi
    
    # Check for system-next directory (known malware)
    if [[ -d "/lib/systemd/system-next" ]]; then
        alert_critical "MALWARE: /lib/systemd/system-next directory exists!"
        found=true
    fi
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "/lib/systemd/ appears clean"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 8: Outbound Connections to C2 IPs
# -----------------------------------------------------------------------------
check_c2_connections() {
    log "INFO" "Checking for connections to known C2 infrastructure..."
    
    local found=false
    
    # Check established connections
    for ip in "${C2_IPS[@]}"; do
        if ss -tn 2>/dev/null | grep -q "$ip"; then
            alert_critical "ACTIVE CONNECTION TO C2 IP: $ip"
            found=true
        fi
        if netstat -tn 2>/dev/null | grep -q "$ip"; then
            alert_critical "ACTIVE CONNECTION TO C2 IP: $ip"
            found=true
        fi
    done
    
    # Check for domain resolutions (in recent DNS cache if available)
    for domain in "${MALICIOUS_DOMAINS[@]}"; do
        if grep -rq "$domain" /var/log/syslog 2>/dev/null; then
            alert_warning "Recent DNS query for malicious domain: $domain"
        fi
    done
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "No connections to known C2 infrastructure"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 9: Crypto Miner Processes (High CPU)
# -----------------------------------------------------------------------------
check_crypto_miners() {
    log "INFO" "Checking for crypto miner processes..."
    
    local found=false
    
    # Check for high CPU processes
    local high_cpu=$(ps aux --sort=-%cpu | awk -v threshold="$CPU_THRESHOLD" 'NR>1 && $3>threshold {print $0}' | head -5)
    if [[ -n "$high_cpu" ]]; then
        alert_warning "High CPU processes detected (>$CPU_THRESHOLD%): $high_cpu"
    fi
    
    # Check for known miner process names
    local miner_names=("xmrig" "minerd" "cpuminer" "cryptonight" "stratum" "kworkerds" "kthreaddi")
    for name in "${miner_names[@]}"; do
        if pgrep -f "$name" > /dev/null 2>&1; then
            local proc=$(pgrep -af "$name" 2>/dev/null)
            alert_critical "CRYPTO MINER PROCESS DETECTED: $proc"
            found=true
        fi
    done
    
    # Check for processes with known wallet addresses
    for wallet in "${MALICIOUS_WALLETS[@]}"; do
        if ps aux | grep -q "$wallet"; then
            alert_critical "Process with known malicious wallet detected!"
            found=true
        fi
    done
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "No crypto miner processes detected"
        ((CHECKS_PASSED++))
    fi
}

# -----------------------------------------------------------------------------
# Check 10: Hidden Directories in /root/
# -----------------------------------------------------------------------------
check_hidden_directories() {
    log "INFO" "Checking for suspicious hidden directories in /root/..."
    
    local found=false
    
    # Find all hidden directories in /root
    while IFS= read -r dir; do
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
            # Check if it's a file or directory
            if [[ -d "$dir" ]]; then
                alert_critical "SUSPICIOUS HIDDEN DIRECTORY: $dir"
                found=true
            fi
        fi
    done < <(find /root -maxdepth 1 -name ".*" -type d 2>/dev/null)
    
    if [[ "$found" == "true" ]]; then
        ((CHECKS_FAILED++))
    else
        alert_info "No suspicious hidden directories in /root/"
        ((CHECKS_PASSED++))
    fi
}

# =============================================================================
# HOURLY REPORT GENERATION
# =============================================================================

generate_hourly_report() {
    local report_subject="📊 Hourly Security Report - $HOSTNAME"
    local report_body="HOURLY SECURITY STATUS REPORT
==============================

Server: $HOSTNAME ($SERVER_IP)
Role: $SERVER_ROLE
Time: $TIMESTAMP

SUMMARY
-------
✅ Checks Passed: $CHECKS_PASSED
❌ Checks Failed: $CHECKS_FAILED
🚨 Critical Alerts: $CRITICAL_COUNT
⚠️  Warnings: $WARNING_COUNT
ℹ️  Info: $INFO_COUNT

"

    if [[ ${#FINDINGS[@]} -gt 0 ]]; then
        report_body+="FINDINGS
--------
"
        for finding in "${FINDINGS[@]}"; do
            report_body+="• $finding
"
        done
    else
        report_body+="No issues detected in this check cycle.
"
    fi

    report_body+="
SYSTEM STATUS
-------------
Load Average: $(cat /proc/loadavg | awk '{print $1, $2, $3}')
Memory Usage: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')
Disk Usage: $(df -h / | awk 'NR==2 {print $5}')
Uptime: $(uptime -p)

--
MaasISO Security Monitor
Report generated: $TIMESTAMP
"

    # Send hourly report to single email
    send_email "$report_subject" "$report_body" "$HOURLY_REPORT_EMAIL"
    
    # Log the report
    echo "$report_body" >> "$HOURLY_REPORT_LOG"
}

# =============================================================================
# TEST ALERTS FUNCTION
# =============================================================================

send_test_alerts() {
    local test_id="TEST-$(date +%s)"
    local test_timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo ""
    echo "============================================="
    echo "  MaasISO Security Alert System Test"
    echo "============================================="
    echo ""
    echo "Server: $HOSTNAME ($SERVER_IP)"
    echo "Role: $SERVER_ROLE"
    echo "Test ID: $test_id"
    echo ""
    
    local test_subject="[TEST] MaasISO Security Alert System Test"
    local test_body="
╔═══════════════════════════════════════════════════════════════════╗
║                   TEST ALERT - NOT A REAL INCIDENT                 ║
╚═══════════════════════════════════════════════════════════════════╝

This is a TEST alert from the MaasISO security monitoring system.

If you receive this message, your alerting system is working correctly.

═══════════════════════════════════════════════════════════════════════
TEST DETAILS
═══════════════════════════════════════════════════════════════════════

Server:      $HOSTNAME
Server IP:   $SERVER_IP
Server Role: $SERVER_ROLE
Test Time:   $test_timestamp
Test ID:     $test_id
Alert Type:  TEST (not a real security incident)

═══════════════════════════════════════════════════════════════════════
ACTION REQUIRED
═══════════════════════════════════════════════════════════════════════

No action required - this was triggered manually to verify the alerting
system is functioning properly.

If you did NOT trigger this test, please investigate immediately.

--
MaasISO Security Monitor
Test ID: $test_id
"

    # Test Email to Primary
    echo "--- Testing Email (Primary) ---"
    if [[ -n "$ALERT_EMAIL_PRIMARY" ]]; then
        echo "  Sending to: $ALERT_EMAIL_PRIMARY"
        if send_email "$test_subject" "$test_body" "$ALERT_EMAIL_PRIMARY"; then
            echo "  ✓ Email sent to primary"
        else
            echo "  ✗ Failed to send to primary"
        fi
    else
        echo "  ⚠ Primary email not configured"
    fi
    
    # Test Email to Secondary
    echo ""
    echo "--- Testing Email (Secondary) ---"
    if [[ -n "$ALERT_EMAIL_SECONDARY" ]]; then
        echo "  Sending to: $ALERT_EMAIL_SECONDARY"
        if send_email "$test_subject" "$test_body" "$ALERT_EMAIL_SECONDARY"; then
            echo "  ✓ Email sent to secondary"
        else
            echo "  ✗ Failed to send to secondary"
        fi
    else
        echo "  ⚠ Secondary email not configured"
    fi
    
    # Test SMS via Pushover
    echo ""
    echo "--- Testing SMS (Pushover) ---"
    if [[ -n "$PUSHOVER_TOKEN" ]] && [[ -n "$PUSHOVER_USER" ]]; then
        echo "  Target: ${SMS_PHONE:-Pushover app}"
        local sms_message="[TEST] MaasISO Security Alert Test

Server: $HOSTNAME ($SERVER_IP)
Time: $test_timestamp
Test ID: $test_id

This is a TEST. Your SMS notifications are working correctly."
        
        # Use priority 0 for test (normal priority)
        local response
        response=$(curl -s \
            --form-string "token=$PUSHOVER_TOKEN" \
            --form-string "user=$PUSHOVER_USER" \
            --form-string "title=[TEST] MaasISO Security" \
            --form-string "message=$sms_message" \
            --form-string "priority=0" \
            --form-string "sound=pushover" \
            https://api.pushover.net/1/messages.json 2>&1)
        
        if echo "$response" | grep -q '"status":1'; then
            echo "  ✓ Pushover notification sent"
        else
            echo "  ✗ Pushover notification failed: $response"
        fi
    else
        echo "  ⚠ Pushover not configured - SMS test skipped"
        echo "  To enable: Set PUSHOVER_TOKEN and PUSHOVER_USER in config"
    fi
    
    # Test Slack
    echo ""
    echo "--- Testing Slack ---"
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        local slack_payload
        slack_payload=$(cat <<EOF
{
    "attachments": [{
        "color": "good",
        "title": "🧪 TEST - Security Alert System",
        "text": "This is a TEST alert from the MaasISO security monitoring system.\n\nIf you see this message, Slack notifications are working correctly.",
        "fields": [
            {"title": "Server", "value": "$HOSTNAME", "short": true},
            {"title": "IP", "value": "$SERVER_IP", "short": true},
            {"title": "Role", "value": "$SERVER_ROLE", "short": true},
            {"title": "Test ID", "value": "$test_id", "short": true}
        ],
        "footer": "MaasISO Security Monitor | TEST",
        "ts": $(date +%s)
    }]
}
EOF
)
        
        local slack_response
        slack_response=$(curl -s -X POST -H 'Content-type: application/json' \
            --data "$slack_payload" \
            "$SLACK_WEBHOOK" 2>&1)
        
        if [[ "$slack_response" == "ok" ]]; then
            echo "  ✓ Slack notification sent"
        else
            echo "  ✗ Slack notification failed: $slack_response"
        fi
    else
        echo "  ⚠ Slack not configured - Slack test skipped"
    fi
    
    echo ""
    echo "============================================="
    echo "  Test Complete"
    echo "============================================="
    echo ""
    echo "Please check:"
    echo "  1. Your email inboxes for test messages"
    echo "  2. Your phone/Pushover app for SMS notifications"
    echo "  3. Your Slack channel for test messages"
    echo ""
    echo "Test ID: $test_id"
    echo ""
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    # Handle test alerts mode
    if [[ "$TEST_ALERTS" == "true" ]]; then
        send_test_alerts
        exit 0
    fi
    
    log "INFO" "=========================================="
    log "INFO" "Security Monitor Starting - $TIMESTAMP"
    log "INFO" "Server: $HOSTNAME ($SERVER_IP) - Role: $SERVER_ROLE"
    log "INFO" "Mode: $(if $DRY_RUN; then echo 'DRY-RUN'; else echo 'LIVE'; fi)"
    log "INFO" "=========================================="
    
    # Run all security checks
    check_nginx_config
    check_malware_directories
    check_cron_jobs
    check_systemd_services
    check_profile_files
    check_ssh_keys
    check_hidden_systemd_binaries
    check_c2_connections
    check_crypto_miners
    check_hidden_directories
    
    # Summary
    log "INFO" "=========================================="
    log "INFO" "Security Check Complete"
    log "INFO" "Passed: $CHECKS_PASSED | Failed: $CHECKS_FAILED"
    log "INFO" "Critical: $CRITICAL_COUNT | Warnings: $WARNING_COUNT"
    log "INFO" "=========================================="
    
    # Generate hourly report if requested
    if [[ "$HOURLY_REPORT" == "true" ]]; then
        generate_hourly_report
    fi
    
    # Exit with appropriate code
    if [[ $CHECKS_FAILED -gt 0 ]]; then
        exit 1
    fi
    exit 0
}

# Run main function
main "$@"