#!/bin/bash
#
# Guardian Website Monitor
# ========================
# Monitors website availability, response time, SSL, content integrity
# Runs every 30 seconds via systemd timer (on Backend VPS only)
#
# Created: December 10, 2025
# Version: 2.0
#

set -u

# Source alert library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/guardian-alert-lib.sh"

SCRIPT_NAME="website"
START_TIME=$(get_epoch)

# =============================================================================
# WEBSITE CHECKS
# =============================================================================

# Check HTTP response code
check_http_response() {
    local url="$1"
    local expected_code="${2:-200}"
    local timeout=10
    
    local response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" \
        --connect-timeout $timeout \
        --max-time $timeout \
        -L "$url" 2>/dev/null)
    
    local http_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    # Check HTTP code
    if [[ "$http_code" != "$expected_code" ]]; then
        if [[ "$http_code" == "000" ]]; then
            alert_critical "WEBSITE UNREACHABLE: $url" "$SCRIPT_NAME" \
                "URL: $url
Expected: $expected_code
Got: Connection failed (timeout or DNS failure)
Timeout: ${timeout}s" \
                "Check server status, nginx, DNS"
            return 1
        else
            alert_critical "WEBSITE WRONG STATUS CODE: $url" "$SCRIPT_NAME" \
                "URL: $url
Expected: $expected_code
Got: $http_code
Response Time: ${response_time}s" \
                "Investigate HTTP error"
            return 1
        fi
    fi
    
    # Check response time
    local rt_int=$(echo "$response_time" | cut -d'.' -f1)
    
    if (( $(echo "$response_time > $RESPONSE_CRITICAL" | bc -l) )); then
        alert_critical "WEBSITE CRITICALLY SLOW: $url" "$SCRIPT_NAME" \
            "URL: $url
Response Time: ${response_time}s
Threshold: ${RESPONSE_CRITICAL}s" \
            "Investigate server performance"
    elif (( $(echo "$response_time > $RESPONSE_ALERT" | bc -l) )); then
        alert_warning "Website very slow: $url" "$SCRIPT_NAME" \
            "URL: $url
Response Time: ${response_time}s
Threshold: ${RESPONSE_ALERT}s"
    elif (( $(echo "$response_time > $RESPONSE_WARNING" | bc -l) )); then
        alert_warning "Website slow: $url" "$SCRIPT_NAME" \
            "URL: $url
Response Time: ${response_time}s
Threshold: ${RESPONSE_WARNING}s"
    elif (( $(echo "$response_time > $RESPONSE_INFO" | bc -l) )); then
        alert_info "Website response elevated: ${response_time}s for $url" "$SCRIPT_NAME"
    fi
    
    log "INFO" "$url - HTTP $http_code in ${response_time}s" "$SCRIPT_NAME"
    return 0
}

# Check SSL certificate
check_ssl_certificate() {
    local domain="$1"
    local port="${2:-443}"
    
    # Get certificate expiry
    local expiry=$(echo | openssl s_client -servername "$domain" -connect "${domain}:${port}" 2>/dev/null | \
        openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    
    if [[ -z "$expiry" ]]; then
        alert_critical "SSL CERTIFICATE CHECK FAILED: $domain" "$SCRIPT_NAME" \
            "Could not retrieve SSL certificate for $domain
This could indicate:
- Certificate is missing
- SSL is not configured
- Connection issues"
        return 1
    fi
    
    # Calculate days until expiry
    local expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null)
    local now_epoch=$(get_epoch)
    local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
    
    if [[ $days_left -lt 3 ]]; then
        alert_critical "SSL CERTIFICATE EXPIRES IN $days_left DAYS: $domain" "$SCRIPT_NAME" \
            "Domain: $domain
Expiry: $expiry
Days Left: $days_left
URGENT: Certificate needs immediate renewal!"
    elif [[ $days_left -lt 7 ]]; then
        alert_critical "SSL certificate expires soon: $domain" "$SCRIPT_NAME" \
            "Domain: $domain
Expiry: $expiry
Days Left: $days_left"
    elif [[ $days_left -lt 30 ]]; then
        alert_warning "SSL certificate expiring: $domain" "$SCRIPT_NAME" \
            "Domain: $domain
Expiry: $expiry
Days Left: $days_left"
    else
        log "INFO" "SSL OK: $domain expires in $days_left days" "$SCRIPT_NAME"
    fi
    
    return 0
}

# Check page content for defacement
check_content_integrity() {
    local url="$1"
    local expected_content="$2"
    local timeout=10
    
    local content=$(curl -s --connect-timeout $timeout --max-time $timeout -L "$url" 2>/dev/null)
    
    if [[ -z "$content" ]]; then
        alert_critical "WEBSITE CONTENT EMPTY: $url" "$SCRIPT_NAME" \
            "URL: $url
Expected content: $expected_content
Got: Empty response
This could indicate:
- Server error
- Application crash
- Defacement"
        return 1
    fi
    
    if [[ ! "$content" =~ "$expected_content" ]]; then
        alert_critical "WEBSITE POSSIBLY DEFACED: $url" "$SCRIPT_NAME" \
            "URL: $url
Expected to find: '$expected_content'
Content did NOT contain expected text!
This could indicate:
- Website defacement
- Redirect to malicious site
- Application error" \
            "IMMEDIATELY check website manually!"
        return 1
    fi
    
    log "INFO" "Content integrity OK: $url contains expected content" "$SCRIPT_NAME"
    return 0
}

# Check DNS resolution
check_dns_resolution() {
    local domain="$1"
    local expected_ip="$2"
    
    local resolved_ip=$(dig +short "$domain" A 2>/dev/null | head -1)
    
    if [[ -z "$resolved_ip" ]]; then
        alert_critical "DNS RESOLUTION FAILED: $domain" "$SCRIPT_NAME" \
            "Domain: $domain
Expected IP: $expected_ip
Got: No DNS response
This could indicate:
- DNS server issues
- Domain expired
- DNS hijacking"
        return 1
    fi
    
    if [[ "$resolved_ip" != "$expected_ip" ]]; then
        alert_critical "DNS MISMATCH - POSSIBLE HIJACKING: $domain" "$SCRIPT_NAME" \
            "Domain: $domain
Expected IP: $expected_ip
Resolved IP: $resolved_ip
WARNING: DNS is resolving to unexpected IP!
This could indicate DNS hijacking!" \
            "IMMEDIATELY verify DNS settings"
        return 1
    fi
    
    log "INFO" "DNS OK: $domain -> $resolved_ip" "$SCRIPT_NAME"
    return 0
}

# Check Strapi API health
check_strapi_health() {
    local api_url="$1"
    local timeout=10
    
    # Try health endpoint first
    local health_url="${api_url}/_health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout $timeout \
        --max-time $timeout \
        "$health_url" 2>/dev/null)
    
    if [[ "$response" == "204" ]] || [[ "$response" == "200" ]]; then
        log "INFO" "Strapi health endpoint OK: $health_url" "$SCRIPT_NAME"
        return 0
    fi
    
    # Try base API endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout $timeout \
        --max-time $timeout \
        "${api_url}/api" 2>/dev/null)
    
    if [[ "$response" == "200" ]] || [[ "$response" == "403" ]]; then
        log "INFO" "Strapi API responding: ${api_url}/api (HTTP $response)" "$SCRIPT_NAME"
        return 0
    fi
    
    alert_critical "STRAPI API NOT RESPONDING: $api_url" "$SCRIPT_NAME" \
        "API URL: $api_url
Health endpoint: $health_url
HTTP Response: $response
Strapi CMS may be down!" \
        "Check PM2 status on backend server"
    return 1
}

# Check website from external perspective (using external service)
check_external_status() {
    local url="$1"
    
    # Use httpstat.us or similar to verify external access
    # This checks if the site is accessible from outside
    
    # For now, we rely on local checks
    # TODO: Add external monitoring API integration
    return 0
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log "INFO" "Website monitoring starting" "$SCRIPT_NAME"
    send_heartbeat "$SCRIPT_NAME" "running"
    
    local checks=0
    local issues=0
    
    # Check 1: Main website HTTP
    ((checks++))
    if ! check_http_response "https://maasiso.nl" "200"; then
        ((issues++))
    fi
    
    # Check 2: WWW redirect
    ((checks++))
    if ! check_http_response "https://www.maasiso.nl" "200"; then
        ((issues++))
    fi
    
    # Check 3: API endpoint
    ((checks++))
    if ! check_http_response "https://api.maasiso.nl" "200"; then
        ((issues++))
    fi
    
    # Check 4: SSL Certificate - maasiso.nl
    ((checks++))
    if ! check_ssl_certificate "maasiso.nl"; then
        ((issues++))
    fi
    
    # Check 5: SSL Certificate - api.maasiso.nl
    ((checks++))
    if ! check_ssl_certificate "api.maasiso.nl"; then
        ((issues++))
    fi
    
    # Check 6: Content integrity
    ((checks++))
    if ! check_content_integrity "https://maasiso.nl" "$HOMEPAGE_EXPECTED_CONTENT"; then
        ((issues++))
    fi
    
    # Check 7: DNS resolution - frontend
    ((checks++))
    if ! check_dns_resolution "maasiso.nl" "$FRONTEND_IP"; then
        ((issues++))
    fi
    
    # Check 8: DNS resolution - API
    ((checks++))
    if ! check_dns_resolution "api.maasiso.nl" "$BACKEND_IP"; then
        ((issues++))
    fi
    
    # Check 9: Strapi API health
    ((checks++))
    if ! check_strapi_health "https://api.maasiso.nl"; then
        ((issues++))
    fi
    
    local end_time=$(get_epoch)
    local duration=$((end_time - START_TIME))
    
    send_heartbeat "$SCRIPT_NAME" "complete"
    
    if [[ $issues -eq 0 ]]; then
        log "INFO" "Website monitoring complete: All $checks checks passed (${duration}s)" "$SCRIPT_NAME"
    else
        log "WARNING" "Website monitoring complete: $issues/$checks checks failed (${duration}s)" "$SCRIPT_NAME"
        alert_warning "Website monitoring found issues" "$SCRIPT_NAME" \
            "Checks: $checks total
Failed: $issues
Passed: $((checks - issues))
Duration: ${duration}s"
    fi
}

# Run
main "$@"