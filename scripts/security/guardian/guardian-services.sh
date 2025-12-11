#!/bin/bash
#
# Guardian Services Monitor
# =========================
# Monitors critical services, auto-restarts crashed services
# Runs every minute via cron
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="services"
START_TIME=$(get_epoch)

# Restart tracking
RESTART_TRACK_FILE="${STATE_DIR}/restart_tracking"

# =============================================================================
# SERVICE CHECKS
# =============================================================================

# Check systemd service status
check_systemd_service() {
    local service="$1"
    
    if ! systemctl is-active --quiet "$service" 2>/dev/null; then
        local status=$(systemctl status "$service" 2>&1 | head -10)
        
        alert_critical "SERVICE DOWN: $service" "$SCRIPT_NAME" \
            "Service $service is not running!
Status:
$status" \
            "[AUTO] Attempting restart"
        
        if [[ "$AUTO_RESTART_SERVICES" == "true" ]]; then
            # Track restarts
            local restart_count=$(grep -c "^${service}:" "$RESTART_TRACK_FILE" 2>/dev/null || echo 0)
            
            if [[ $restart_count -lt 3 ]]; then
                systemctl restart "$service" 2>/dev/null
                echo "${service}:$(get_epoch)" >> "$RESTART_TRACK_FILE"
                
                sleep 2
                
                if systemctl is-active --quiet "$service" 2>/dev/null; then
                    alert_info "Service restarted successfully: $service" "$SCRIPT_NAME"
                else
                    alert_critical "SERVICE RESTART FAILED: $service" "$SCRIPT_NAME" \
                        "Auto-restart did not work. Manual intervention required!"
                fi
            else
                alert_critical "SERVICE RESTART LIMIT REACHED: $service" "$SCRIPT_NAME" \
                    "Service has been restarted 3+ times recently
Not attempting another restart
Manual intervention required!"
            fi
        fi
        
        return 1
    fi
    
    log "INFO" "Service OK: $service" "$SCRIPT_NAME"
    return 0
}

# Check PM2 application status
check_pm2_app() {
    local app_name="$1"
    
    local status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name == \"$app_name\") | .pm2_env.status" 2>/dev/null)
    
    if [[ -z "$status" ]]; then
        alert_critical "PM2 APP NOT FOUND: $app_name" "$SCRIPT_NAME" \
            "Application $app_name is not registered in PM2!" \
            "Check PM2 configuration"
        return 1
    fi
    
    if [[ "$status" != "online" ]]; then
        local pm2_info=$(pm2 show "$app_name" 2>&1 | head -20)
        local pm2_logs=$(pm2 logs "$app_name" --nostream --lines 20 2>&1)
        
        alert_critical "PM2 APP DOWN: $app_name" "$SCRIPT_NAME" \
            "Application $app_name is not online!
Status: $status

PM2 Info:
$pm2_info

Recent Logs:
$pm2_logs" \
            "[AUTO] Attempting PM2 restart"
        
        if [[ "$AUTO_RESTART_SERVICES" == "true" ]]; then
            pm2 restart "$app_name" 2>/dev/null
            sleep 3
            
            local new_status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name == \"$app_name\") | .pm2_env.status" 2>/dev/null)
            
            if [[ "$new_status" == "online" ]]; then
                alert_info "PM2 app restarted successfully: $app_name" "$SCRIPT_NAME"
            else
                alert_critical "PM2 RESTART FAILED: $app_name" "$SCRIPT_NAME" \
                    "New status: $new_status"
            fi
        fi
        
        return 1
    fi
    
    # Check restart count
    local restarts=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name == \"$app_name\") | .pm2_env.restart_time" 2>/dev/null)
    local restart_threshold=5
    
    if [[ -n "$restarts" ]] && [[ $restarts -gt $restart_threshold ]]; then
        alert_warning "PM2 app has high restart count: $app_name" "$SCRIPT_NAME" \
            "Restart count: $restarts
This could indicate application instability"
    fi
    
    # Check memory usage
    local memory=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name == \"$app_name\") | .monit.memory" 2>/dev/null)
    local memory_mb=$((memory / 1024 / 1024))
    local memory_threshold=500
    
    if [[ -n "$memory" ]] && [[ $memory_mb -gt $memory_threshold ]]; then
        alert_warning "PM2 app high memory usage: $app_name" "$SCRIPT_NAME" \
            "Memory: ${memory_mb}MB
Threshold: ${memory_threshold}MB
Consider investigating memory leak"
    fi
    
    log "INFO" "PM2 app OK: $app_name (status: $status, memory: ${memory_mb:-?}MB)" "$SCRIPT_NAME"
    return 0
}

# Check if port is responding
check_port_response() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local timeout=5
    
    if ! timeout $timeout bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        alert_critical "PORT NOT RESPONDING: $port ($service_name)" "$SCRIPT_NAME" \
            "Host: $host
Port: $port
Service: $service_name
Port is not accepting connections!"
        return 1
    fi
    
    log "INFO" "Port OK: $host:$port ($service_name)" "$SCRIPT_NAME"
    return 0
}

# Check Nginx configuration
check_nginx_config() {
    if command -v nginx &>/dev/null; then
        local test_result=$(nginx -t 2>&1)
        
        if [[ $? -ne 0 ]]; then
            alert_critical "NGINX CONFIG ERROR" "$SCRIPT_NAME" \
                "Nginx configuration test failed!
$test_result"
            return 1
        fi
        
        log "INFO" "Nginx config OK" "$SCRIPT_NAME"
    fi
    return 0
}

# Check PostgreSQL (backend only)
check_postgresql() {
    if [[ "$SERVER_ROLE" != "backend" ]]; then
        return 0
    fi
    
    if command -v psql &>/dev/null; then
        # Try to connect
        local result=$(psql -U postgres -c "SELECT 1;" 2>&1)
        
        if [[ $? -ne 0 ]]; then
            alert_critical "POSTGRESQL CONNECTION FAILED" "$SCRIPT_NAME" \
                "Cannot connect to PostgreSQL!
$result"
            return 1
        fi
        
        log "INFO" "PostgreSQL OK" "$SCRIPT_NAME"
    fi
    return 0
}

# Check disk space (can affect services)
check_disk_space() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    
    if [[ $usage -gt $DISK_CRITICAL ]]; then
        alert_critical "DISK SPACE CRITICAL: ${usage}%" "$SCRIPT_NAME" \
            "Disk usage: ${usage}%
Threshold: ${DISK_CRITICAL}%
Services may fail due to disk space!"
    elif [[ $usage -gt $DISK_WARNING ]]; then
        alert_warning "Disk space warning: ${usage}%" "$SCRIPT_NAME" \
            "Disk usage: ${usage}%
Threshold: ${DISK_WARNING}%"
    fi
    
    log "INFO" "Disk usage: ${usage}%" "$SCRIPT_NAME"
}

# Check memory (can affect services)
check_memory() {
    local usage=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2*100}')
    
    if [[ $usage -gt $MEM_CRITICAL ]]; then
        alert_critical "MEMORY CRITICAL: ${usage}%" "$SCRIPT_NAME" \
            "Memory usage: ${usage}%
Threshold: ${MEM_CRITICAL}%
Services may crash due to OOM!"
    elif [[ $usage -gt $MEM_WARNING ]]; then
        alert_warning "Memory warning: ${usage}%" "$SCRIPT_NAME" \
            "Memory usage: ${usage}%
Threshold: ${MEM_WARNING}%"
    fi
    
    log "INFO" "Memory usage: ${usage}%" "$SCRIPT_NAME"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Services monitoring starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    # Clean old restart tracking (older than 1 hour)
    if [[ -f "$RESTART_TRACK_FILE" ]]; then
        local one_hour_ago=$(($(get_epoch) - 3600))
        local temp_file=$(mktemp)
        while IFS=: read -r service timestamp; do
            if [[ $timestamp -gt $one_hour_ago ]]; then
                echo "${service}:${timestamp}" >> "$temp_file"
            fi
        done < "$RESTART_TRACK_FILE"
        mv "$temp_file" "$RESTART_TRACK_FILE" 2>/dev/null
    fi
    
    local checks=0
    local issues=0
    
    # Get services for this server
    local services
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        services=("${BACKEND_SERVICES[@]}")
    else
        services=("${FRONTEND_SERVICES[@]}")
    fi
    
    # Check systemd services
    for service in "${services[@]}"; do
        ((checks++))
        if ! check_systemd_service "$service"; then
            ((issues++))
        fi
    done
    
    # Get PM2 apps for this server
    local pm2_apps
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        pm2_apps=("${BACKEND_PM2_APPS[@]}")
    else
        pm2_apps=("${FRONTEND_PM2_APPS[@]}")
    fi
    
    # Check PM2 applications
    for app in "${pm2_apps[@]}"; do
        ((checks++))
        if ! check_pm2_app "$app"; then
            ((issues++))
        fi
    done
    
    # Check critical ports
    ((checks++))
    if ! check_port_response "127.0.0.1" "80" "nginx"; then
        ((issues++))
    fi
    
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        ((checks++))
        if ! check_port_response "127.0.0.1" "1337" "strapi"; then
            ((issues++))
        fi
        
        ((checks++))
        if ! check_port_response "127.0.0.1" "5432" "postgresql"; then
            ((issues++))
        fi
    else
        ((checks++))
        if ! check_port_response "127.0.0.1" "3000" "next.js"; then
            ((issues++))
        fi
    fi
    
    # Check Nginx config
    ((checks++))
    if ! check_nginx_config; then
        ((issues++))
    fi
    
    # Check PostgreSQL (backend only)
    ((checks++))
    check_postgresql
    
    # Check resources
    ((checks++))
    check_disk_space
    
    ((checks++))
    check_memory
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    
    if [[ $issues -eq 0 ]]; then
        log "INFO" "Services monitoring complete: All $checks checks passed (${duration}s)" "$SCRIPT_NAME"
    else
        log "WARNING" "Services monitoring: $issues/$checks issues found (${duration}s)" "$SCRIPT_NAME"
    fi
}

# Run
main "$@"