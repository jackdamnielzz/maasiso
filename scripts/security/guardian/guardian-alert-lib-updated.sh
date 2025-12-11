#!/bin/bash
# Guardian Alert Library - Silent Mode

source /opt/guardian/guardian-config.sh 2>/dev/null

# State directory
STATE_DIR="/var/lib/guardian"
mkdir -p "$STATE_DIR"

log_guardian() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> /var/log/guardian/guardian.log
}

send_alert() {
    local level="$1"
    local subject="$2"
    local message="$3"
    
    # Always log
    log_guardian "[$level] $subject"
    
    # Check if this level should send email
    case $level in
        INFO)
            [ "$ALERT_INFO_ENABLED" != "true" ] && return 0
            ;;
        WARNING)
            [ "$ALERT_WARNING_ENABLED" != "true" ] && return 0
            ;;
        CRITICAL)
            [ "$ALERT_CRITICAL_ENABLED" != "true" ] && return 0
            ;;
    esac
    
    # Check throttle
    local throttle_file="$STATE_DIR/last_${level}_alert"
    local last_alert=0
    [ -f "$throttle_file" ] && last_alert=$(cat "$throttle_file")
    local now=$(date +%s)
    
    case $level in
        INFO) throttle=$THROTTLE_INFO ;;
        WARNING) throttle=$THROTTLE_WARNING ;;
        CRITICAL) throttle=$THROTTLE_CRITICAL ;;
        *) throttle=300 ;;
    esac
    
    if [ $((now - last_alert)) -lt $throttle ]; then
        log_guardian "Throttled $level alert: $subject"
        return 0
    fi
    
    # Send email only for enabled levels
    echo "$message" | mail -s "[$level] Guardian: $subject" "$ALERT_EMAIL_PRIMARY" 2>/dev/null
    echo $now > "$throttle_file"
    
    log_guardian "Sent $level alert: $subject"
}