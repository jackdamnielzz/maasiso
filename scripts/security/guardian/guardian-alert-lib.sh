#!/bin/bash
#
# Guardian Security System - Alert Library
# =========================================
# Shared alerting functions used by all Guardian scripts
# All scripts source this file for email/SMS/logging
#
# Created: December 10, 2025
# Version: 2.0
#

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-config.sh"

# =============================================================================
# INITIALIZATION
# =============================================================================

# Create required directories
mkdir -p "$LOG_DIR" "$STATE_DIR" "$THROTTLE_STATE" "$BASELINE_DIR" "$HASH_DIR" 2>/dev/null
chmod 700 "$LOG_DIR" "$STATE_DIR" 2>/dev/null

# Timestamp functions
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

get_timestamp_short() {
    date '+%Y%m%d_%H%M%S'
}

get_epoch() {
    date +%s
}

# Alert ID generator
generate_alert_id() {
    echo "GRD-$(date +%Y%m%d-%H%M%S)-$(printf '%03d' $((RANDOM % 1000)))"
}

# =============================================================================
# LOGGING
# =============================================================================

log() {
    local level="$1"
    local message="$2"
    local script="${3:-guardian}"
    local timestamp=$(get_timestamp)
    
    echo "[$timestamp] [$level] [$script] $message" >> "$MAIN_LOG"
    
    # Also write to specific log if specified
    case "$script" in
        process) echo "[$timestamp] [$level] $message" >> "$PROCESS_LOG" ;;
        network) echo "[$timestamp] [$level] $message" >> "$NETWORK_LOG" ;;
        files)   echo "[$timestamp] [$level] $message" >> "$FILES_LOG" ;;
        auth)    echo "[$timestamp] [$level] $message" >> "$AUTH_LOG" ;;
        website) echo "[$timestamp] [$level] $message" >> "$WEBSITE_LOG" ;;
    esac
    
    # Console output
    echo "[$level] $message"
}

log_alert() {
    local level="$1"
    local message="$2"
    local timestamp=$(get_timestamp)
    echo "[$timestamp] [$level] $message" >> "$ALERT_LOG"
}

# =============================================================================
# EMAIL THROTTLING
# =============================================================================

should_send_alert() {
    local alert_type="$1"
    local level="$2"
    local throttle_file="${THROTTLE_STATE}/${alert_type//\//_}"
    
    # Critical alerts are NEVER throttled
    if [[ "$level" == "CRITICAL" ]]; then
        touch "$throttle_file"
        return 0
    fi
    
    # Get throttle time based on level
    local throttle_time
    case "$level" in
        INFO)    throttle_time=$THROTTLE_INFO ;;
        WARNING) throttle_time=$THROTTLE_WARNING ;;
        *)       throttle_time=0 ;;
    esac
    
    # Check if throttled
    if [[ -f "$throttle_file" ]]; then
        local last_sent=$(stat -c %Y "$throttle_file" 2>/dev/null || echo 0)
        local now=$(get_epoch)
        local diff=$((now - last_sent))
        
        if [[ $diff -lt $throttle_time ]]; then
            log "DEBUG" "Alert throttled: $alert_type (${diff}s < ${throttle_time}s)" "alert"
            return 1
        fi
    fi
    
    touch "$throttle_file"
    return 0
}

# =============================================================================
# EMAIL SENDING
# =============================================================================

send_email() {
    local subject="$1"
    local body="$2"
    local recipient="$3"
    
    # Try multiple mail methods
    if command -v mail &>/dev/null; then
        echo "$body" | mail -s "$subject" "$recipient" 2>/dev/null
        return $?
    elif command -v sendmail &>/dev/null; then
        {
            echo "To: $recipient"
            echo "Subject: $subject"
            echo "Content-Type: text/plain; charset=UTF-8"
            echo ""
            echo "$body"
        } | sendmail -t 2>/dev/null
        return $?
    elif command -v msmtp &>/dev/null; then
        {
            echo "To: $recipient"
            echo "Subject: $subject"
            echo "Content-Type: text/plain; charset=UTF-8"
            echo ""
            echo "$body"
        } | msmtp "$recipient" 2>/dev/null
        return $?
    else
        log "WARNING" "No mail command available" "alert"
        return 1
    fi
}

# =============================================================================
# SMS VIA PUSHOVER
# =============================================================================

send_sms() {
    local message="$1"
    local priority="${2:-1}"  # 1 = high priority
    
    if [[ -z "$PUSHOVER_TOKEN" ]] || [[ -z "$PUSHOVER_USER" ]]; then
        return 0
    fi
    
    curl -s \
        --form-string "token=$PUSHOVER_TOKEN" \
        --form-string "user=$PUSHOVER_USER" \
        --form-string "message=$message" \
        --form-string "priority=$priority" \
        --form-string "sound=siren" \
        --form-string "title=Guardian Alert" \
        https://api.pushover.net/1/messages.json > /dev/null 2>&1
}

# =============================================================================
# SLACK NOTIFICATION
# =============================================================================

send_slack() {
    local message="$1"
    local color="${2:-danger}"  # danger=red, warning=yellow, good=green
    
    if [[ -z "$SLACK_WEBHOOK" ]]; then
        return 0
    fi
    
    local payload=$(cat <<EOF
{
    "attachments": [{
        "color": "$color",
        "title": "Guardian Alert - $SERVER_NAME",
        "text": "$message",
        "ts": $(get_epoch)
    }]
}
EOF
)
    
    curl -s -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK" > /dev/null 2>&1
}

# =============================================================================
# SYSTEM STATUS FOOTER
# =============================================================================

get_system_status() {
    local cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 2>/dev/null || echo "N/A")
    local mem=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2*100}' 2>/dev/null || echo "N/A")
    local disk=$(df -h / | awk 'NR==2 {print $5}' 2>/dev/null || echo "N/A")
    local load=$(cat /proc/loadavg | awk '{print $1, $2, $3}' 2>/dev/null || echo "N/A")
    local uptime=$(uptime -p 2>/dev/null || echo "N/A")
    
    echo "CPU: ${cpu}% | Memory: ${mem}% | Disk: ${disk}
Load: ${load}
Uptime: ${uptime}"
}

# =============================================================================
# MAIN ALERT FUNCTIONS
# =============================================================================

# INFO Alert - Email only, throttled
alert_info() {
    local message="$1"
    local script="${2:-guardian}"
    local details="${3:-}"
    local alert_type="info_${script}_${message// /_}"
    
    log "INFO" "$message" "$script"
    log_alert "INFO" "[$script] $message"
    
    if ! should_send_alert "$alert_type" "INFO"; then
        return 0
    fi
    
    local alert_id=$(generate_alert_id)
    local timestamp=$(get_timestamp)
    
    local body="═══════════════════════════════════════════════
ℹ️  INFO - GUARDIAN ALERT
═══════════════════════════════════════════════

🕐 Time:     $timestamp
🖥️  Server:   $SERVER_NAME ($SERVER_IP)
📋 Script:   $script
🎯 Level:    INFO

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$(get_system_status)

--
MaasISO Guardian Security System
Alert ID: $alert_id"

    local subject="ℹ️ [INFO] Guardian: $message - $SERVER_NAME"
    
    send_email "$subject" "$body" "$ALERT_EMAIL_PRIMARY"
    send_email "$subject" "$body" "$ALERT_EMAIL_SECONDARY"
}

# WARNING Alert - Email + Slack
alert_warning() {
    local message="$1"
    local script="${2:-guardian}"
    local details="${3:-}"
    local action="${4:-}"
    local alert_type="warning_${script}_${message// /_}"
    
    log "WARNING" "$message" "$script"
    log_alert "WARNING" "[$script] $message"
    
    if ! should_send_alert "$alert_type" "WARNING"; then
        return 0
    fi
    
    local alert_id=$(generate_alert_id)
    local timestamp=$(get_timestamp)
    
    local body="═══════════════════════════════════════════════
⚠️  WARNING - GUARDIAN ALERT
═══════════════════════════════════════════════

🕐 Time:     $timestamp
🖥️  Server:   $SERVER_NAME ($SERVER_IP)
📋 Script:   $script
🎯 Level:    WARNING

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

    if [[ -n "$action" ]]; then
        body+="

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION TAKEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$action"
    fi

    body+="

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$(get_system_status)

--
MaasISO Guardian Security System
Alert ID: $alert_id"

    local subject="⚠️ [WARNING] Guardian: $message - $SERVER_NAME"
    
    send_email "$subject" "$body" "$ALERT_EMAIL_PRIMARY"
    send_email "$subject" "$body" "$ALERT_EMAIL_SECONDARY"
    send_slack "⚠️ WARNING: $message" "warning"
}

# CRITICAL Alert - Email + SMS + Slack - NEVER throttled
alert_critical() {
    local message="$1"
    local script="${2:-guardian}"
    local details="${3:-}"
    local action="${4:-}"
    
    log "CRITICAL" "$message" "$script"
    log_alert "CRITICAL" "[$script] $message"
    
    local alert_id=$(generate_alert_id)
    local timestamp=$(get_timestamp)
    
    local body="═══════════════════════════════════════════════
🚨 CRITICAL - GUARDIAN SECURITY ALERT
═══════════════════════════════════════════════

🕐 Time:     $timestamp
🖥️  Server:   $SERVER_NAME ($SERVER_IP)
📋 Script:   $script
🎯 Level:    CRITICAL

⚠️  IMMEDIATE ACTION MAY BE REQUIRED!

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

    if [[ -n "$action" ]]; then
        body+="

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION TAKEN (AUTO-REMEDIATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$action"
    fi

    body+="

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$(get_system_status)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SSH into the server: ssh root@$SERVER_IP
2. Check running processes: ps aux | head -20
3. Check network connections: netstat -tulpn
4. Review logs: tail -100 /var/log/guardian/guardian.log

--
MaasISO Guardian Security System
Alert ID: $alert_id
🚨 THIS IS A CRITICAL SECURITY ALERT 🚨"

    local subject="🚨 [CRITICAL] Guardian: $message - $SERVER_NAME"
    
    # Always send critical alerts
    send_email "$subject" "$body" "$ALERT_EMAIL_PRIMARY"
    send_email "$subject" "$body" "$ALERT_EMAIL_SECONDARY"
    send_sms "🚨 CRITICAL: $message on $SERVER_NAME" 1
    send_slack "🚨 CRITICAL: $message\n\nDetails: $details\n\nAction: $action" "danger"
}

# =============================================================================
# SCAN NOTIFICATION FUNCTIONS
# =============================================================================

# Notify scan started
notify_scan_start() {
    local script="$1"
    local checks="$2"
    
    log "INFO" "Scan started: $checks checks" "$script"
    
    # Only send email if configured (for debugging)
    if [[ "${NOTIFY_SCAN_START:-false}" == "true" ]]; then
        alert_info "Guardian scan started: $checks checks" "$script"
    fi
}

# Notify scan completed
notify_scan_complete() {
    local script="$1"
    local passed="$2"
    local failed="$3"
    local duration="$4"
    
    log "INFO" "Scan complete: $passed passed, $failed failed (${duration}s)" "$script"
    
    if [[ $failed -gt 0 ]]; then
        alert_warning "Scan completed with issues" "$script" "Passed: $passed, Failed: $failed, Duration: ${duration}s"
    fi
}

# =============================================================================
# HEARTBEAT
# =============================================================================

send_heartbeat() {
    local script="$1"
    local status="$2"
    local heartbeat_file="${STATE_DIR}/heartbeat_${script}"
    
    echo "$(get_epoch)|$status" > "$heartbeat_file"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Check if process is whitelisted
is_whitelisted_process() {
    local process_name="$1"
    
    for whitelist in "${WHITELIST_PROCESSES[@]}"; do
        if [[ "$process_name" == *"$whitelist"* ]]; then
            return 0
        fi
    done
    return 1
}

# Check if IP is in C2 list
is_c2_ip() {
    local ip="$1"
    
    for c2 in "${C2_IPS[@]}"; do
        if [[ "$ip" == "$c2" ]]; then
            return 0
        fi
    done
    return 1
}

# Check if directory is known malware
is_malware_directory() {
    local dir="$1"
    
    for mal in "${MALWARE_DIRECTORIES[@]}"; do
        if [[ "$dir" == "$mal"* ]]; then
            return 0
        fi
    done
    return 1
}

# Get SSH whitelist for current server
get_ssh_whitelist() {
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        echo "${BACKEND_SSH_WHITELIST[@]}"
    else
        echo "${FRONTEND_SSH_WHITELIST[@]}"
    fi
}

# Get services for current server
get_services() {
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        echo "${BACKEND_SERVICES[@]}"
    else
        echo "${FRONTEND_SERVICES[@]}"
    fi
}

# Get PM2 apps for current server
get_pm2_apps() {
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        echo "${BACKEND_PM2_APPS[@]}"
    else
        echo "${FRONTEND_PM2_APPS[@]}"
    fi
}

# =============================================================================
# EXPORT FUNCTIONS
# =============================================================================

export -f log log_alert alert_info alert_warning alert_critical
export -f send_email send_sms send_slack
export -f get_timestamp get_timestamp_short get_epoch generate_alert_id
export -f is_whitelisted_process is_c2_ip is_malware_directory
export -f get_ssh_whitelist get_services get_pm2_apps
export -f notify_scan_start notify_scan_complete send_heartbeat
export -f get_system_status should_send_alert