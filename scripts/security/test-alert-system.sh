#!/bin/bash
#
# Test Alert System for MaasISO Security Monitoring
# =================================================
# This script tests all notification channels to verify they're working correctly.
#
# Usage:
#   ./test-alert-system.sh                    # Test all channels (email + SMS + Slack)
#   ./test-alert-system.sh --email-only       # Test email only
#   ./test-alert-system.sh --sms-only         # Test SMS (Pushover) only
#   ./test-alert-system.sh --slack-only       # Test Slack only
#   ./test-alert-system.sh --simulate-infection # Create fake malware and run scan
#   ./test-alert-system.sh --status           # Show configuration status
#
# Created: December 9, 2025
# Purpose: Verify alerting system works before relying on it
#

set -euo pipefail

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
    echo "Please ensure security-monitor-config.sh exists in the same directory."
    exit 1
fi

# Test-specific settings
TEST_TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TEST_ID="TEST-$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  MaasISO Alert System Test${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
}

print_status() {
    local status="$1"
    local message="$2"
    
    case "$status" in
        "OK")
            echo -e "  ${GREEN}✓${NC} $message"
            ;;
        "FAIL")
            echo -e "  ${RED}✗${NC} $message"
            ;;
        "WARN")
            echo -e "  ${YELLOW}⚠${NC} $message"
            ;;
        "INFO")
            echo -e "  ${BLUE}ℹ${NC} $message"
            ;;
    esac
}

print_section() {
    echo ""
    echo -e "${YELLOW}--- $1 ---${NC}"
}

# =============================================================================
# CONFIGURATION STATUS
# =============================================================================

show_config_status() {
    print_header
    echo "Configuration Status"
    echo "===================="
    echo ""
    
    print_section "Server Information"
    print_status "INFO" "Hostname: $HOSTNAME"
    print_status "INFO" "Server IP: $SERVER_IP"
    print_status "INFO" "Server Role: $SERVER_ROLE"
    
    print_section "Email Configuration"
    print_status "INFO" "Primary Email: ${ALERT_EMAIL_PRIMARY:-Not configured}"
    print_status "INFO" "Secondary Email: ${ALERT_EMAIL_SECONDARY:-Not configured}"
    print_status "INFO" "Hourly Report Email: ${HOURLY_REPORT_EMAIL:-Not configured}"
    
    # Check if mail command exists
    if command -v mail &>/dev/null; then
        print_status "OK" "Mail command: Available (mail)"
    elif command -v sendmail &>/dev/null; then
        print_status "OK" "Mail command: Available (sendmail)"
    elif command -v msmtp &>/dev/null; then
        print_status "OK" "Mail command: Available (msmtp)"
    else
        print_status "WARN" "Mail command: Not available - email alerts won't work"
    fi
    
    print_section "SMS (Pushover) Configuration"
    if [[ -n "${PUSHOVER_TOKEN:-}" ]] && [[ -n "${PUSHOVER_USER:-}" ]]; then
        print_status "OK" "Pushover: Configured"
        print_status "INFO" "Target Phone: ${SMS_PHONE:-Not set}"
    else
        print_status "WARN" "Pushover: Not configured - SMS alerts disabled"
        print_status "INFO" "To enable: Set PUSHOVER_TOKEN and PUSHOVER_USER in config"
    fi
    
    print_section "Slack Configuration"
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        print_status "OK" "Slack Webhook: Configured"
    else
        print_status "WARN" "Slack Webhook: Not configured - Slack alerts disabled"
    fi
    
    print_section "curl Availability"
    if command -v curl &>/dev/null; then
        print_status "OK" "curl: Available (required for Pushover/Slack)"
    else
        print_status "FAIL" "curl: Not available - Pushover/Slack won't work"
    fi
    
    echo ""
}

# =============================================================================
# TEST EMAIL
# =============================================================================

test_email() {
    print_section "Testing Email Alerts"
    
    local subject="[TEST] MaasISO Security Alert System Test"
    local body="
╔═══════════════════════════════════════════════════════════════════╗
║                   TEST ALERT - NOT A REAL INCIDENT                 ║
╚═══════════════════════════════════════════════════════════════════╝

This is a TEST alert from the MaasISO security monitoring system.

If you receive this message, your email alerting is working correctly.

═══════════════════════════════════════════════════════════════════════
TEST DETAILS
═══════════════════════════════════════════════════════════════════════

Server:      $HOSTNAME
Server IP:   $SERVER_IP
Server Role: $SERVER_ROLE
Test Time:   $TEST_TIMESTAMP
Test ID:     $TEST_ID
Alert Type:  TEST (not a real security incident)

═══════════════════════════════════════════════════════════════════════
ACTION REQUIRED
═══════════════════════════════════════════════════════════════════════

No action required - this was triggered manually to verify the alerting
system is functioning properly.

If you did NOT trigger this test, please investigate immediately.

--
MaasISO Security Monitor
Test ID: $TEST_ID
"

    local email_sent=false
    local email_method=""
    
    # Determine which mail method to use
    if command -v mail &>/dev/null; then
        email_method="mail"
    elif command -v sendmail &>/dev/null; then
        email_method="sendmail"
    elif command -v msmtp &>/dev/null; then
        email_method="msmtp"
    else
        print_status "FAIL" "No mail command available"
        print_status "INFO" "Install mailutils, sendmail, or msmtp to enable email"
        return 1
    fi
    
    print_status "INFO" "Using mail method: $email_method"
    
    # Send to primary email
    if [[ -n "${ALERT_EMAIL_PRIMARY:-}" ]]; then
        print_status "INFO" "Sending to primary: $ALERT_EMAIL_PRIMARY"
        
        case "$email_method" in
            "mail")
                if echo "$body" | mail -s "$subject" "$ALERT_EMAIL_PRIMARY" 2>/dev/null; then
                    print_status "OK" "Email sent to $ALERT_EMAIL_PRIMARY"
                    email_sent=true
                else
                    print_status "FAIL" "Failed to send to $ALERT_EMAIL_PRIMARY"
                fi
                ;;
            "sendmail")
                if {
                    echo "To: $ALERT_EMAIL_PRIMARY"
                    echo "Subject: $subject"
                    echo ""
                    echo "$body"
                } | sendmail -t 2>/dev/null; then
                    print_status "OK" "Email sent to $ALERT_EMAIL_PRIMARY"
                    email_sent=true
                else
                    print_status "FAIL" "Failed to send to $ALERT_EMAIL_PRIMARY"
                fi
                ;;
            "msmtp")
                if {
                    echo "To: $ALERT_EMAIL_PRIMARY"
                    echo "Subject: $subject"
                    echo ""
                    echo "$body"
                } | msmtp "$ALERT_EMAIL_PRIMARY" 2>/dev/null; then
                    print_status "OK" "Email sent to $ALERT_EMAIL_PRIMARY"
                    email_sent=true
                else
                    print_status "FAIL" "Failed to send to $ALERT_EMAIL_PRIMARY"
                fi
                ;;
        esac
    fi
    
    # Send to secondary email
    if [[ -n "${ALERT_EMAIL_SECONDARY:-}" ]]; then
        print_status "INFO" "Sending to secondary: $ALERT_EMAIL_SECONDARY"
        
        case "$email_method" in
            "mail")
                if echo "$body" | mail -s "$subject" "$ALERT_EMAIL_SECONDARY" 2>/dev/null; then
                    print_status "OK" "Email sent to $ALERT_EMAIL_SECONDARY"
                    email_sent=true
                else
                    print_status "FAIL" "Failed to send to $ALERT_EMAIL_SECONDARY"
                fi
                ;;
            "sendmail")
                if {
                    echo "To: $ALERT_EMAIL_SECONDARY"
                    echo "Subject: $subject"
                    echo ""
                    echo "$body"
                } | sendmail -t 2>/dev/null; then
                    print_status "OK" "Email sent to $ALERT_EMAIL_SECONDARY"
                    email_sent=true
                else
                    print_status "FAIL" "Failed to send to $ALERT_EMAIL_SECONDARY"
                fi
                ;;
            "msmtp")
                if {
                    echo "To: $ALERT_EMAIL_SECONDARY"
                    echo "Subject: $subject"
                    echo ""
                    echo "$body"
                } | msmtp "$ALERT_EMAIL_SECONDARY" 2>/dev/null; then
                    print_status "OK" "Email sent to $ALERT_EMAIL_SECONDARY"
                    email_sent=true
                else
                    print_status "FAIL" "Failed to send to $ALERT_EMAIL_SECONDARY"
                fi
                ;;
        esac
    fi
    
    if [[ "$email_sent" == "true" ]]; then
        echo ""
        print_status "OK" "Email test complete - check your inbox"
    else
        print_status "FAIL" "Email test failed - no emails could be sent"
    fi
}

# =============================================================================
# TEST SMS (PUSHOVER)
# =============================================================================

test_sms() {
    print_section "Testing SMS via Pushover"
    
    if [[ -z "${PUSHOVER_TOKEN:-}" ]] || [[ -z "${PUSHOVER_USER:-}" ]]; then
        print_status "WARN" "Pushover not configured - SMS test skipped"
        print_status "INFO" "To enable SMS alerts:"
        print_status "INFO" "  1. Create account at https://pushover.net/"
        print_status "INFO" "  2. Create an Application to get PUSHOVER_TOKEN"
        print_status "INFO" "  3. Copy your User Key as PUSHOVER_USER"
        print_status "INFO" "  4. Update security-monitor-config.sh with these values"
        return 0
    fi
    
    if ! command -v curl &>/dev/null; then
        print_status "FAIL" "curl not installed - cannot send Pushover messages"
        return 1
    fi
    
    local message="[TEST] MaasISO Security Alert Test

Server: $HOSTNAME ($SERVER_IP)
Time: $TEST_TIMESTAMP
Test ID: $TEST_ID

This is a TEST. Your SMS notifications are working correctly.

No action required."

    print_status "INFO" "Sending test notification to Pushover..."
    
    # Use priority 0 for test (normal priority, no alarm sound)
    local response
    response=$(curl -s \
        --form-string "token=$PUSHOVER_TOKEN" \
        --form-string "user=$PUSHOVER_USER" \
        --form-string "title=[TEST] MaasISO Security" \
        --form-string "message=$message" \
        --form-string "priority=0" \
        --form-string "sound=pushover" \
        https://api.pushover.net/1/messages.json 2>&1)
    
    # Check response
    if echo "$response" | grep -q '"status":1'; then
        print_status "OK" "Pushover notification sent successfully"
        print_status "INFO" "Check your phone/Pushover app for the test message"
        
        # If SMS delivery is configured, mention it
        if [[ -n "${SMS_PHONE:-}" ]]; then
            print_status "INFO" "SMS target: $SMS_PHONE (if configured in Pushover)"
        fi
    else
        print_status "FAIL" "Pushover notification failed"
        print_status "INFO" "Response: $response"
    fi
}

# =============================================================================
# TEST SLACK
# =============================================================================

test_slack() {
    print_section "Testing Slack Notifications"
    
    if [[ -z "${SLACK_WEBHOOK:-}" ]]; then
        print_status "WARN" "Slack webhook not configured - Slack test skipped"
        print_status "INFO" "To enable Slack alerts:"
        print_status "INFO" "  1. Go to your Slack workspace settings"
        print_status "INFO" "  2. Create an Incoming Webhook"
        print_status "INFO" "  3. Copy the webhook URL to security-monitor-config.sh"
        return 0
    fi
    
    if ! command -v curl &>/dev/null; then
        print_status "FAIL" "curl not installed - cannot send Slack messages"
        return 1
    fi
    
    print_status "INFO" "Sending test message to Slack..."
    
    local payload
    payload=$(cat <<EOF
{
    "attachments": [{
        "color": "good",
        "title": "🧪 TEST - Security Alert System",
        "text": "This is a TEST alert from the MaasISO security monitoring system.\n\nIf you see this message, Slack notifications are working correctly.",
        "fields": [
            {"title": "Server", "value": "$HOSTNAME", "short": true},
            {"title": "IP", "value": "$SERVER_IP", "short": true},
            {"title": "Role", "value": "$SERVER_ROLE", "short": true},
            {"title": "Test ID", "value": "$TEST_ID", "short": true}
        ],
        "footer": "MaasISO Security Monitor | TEST",
        "ts": $(date +%s)
    }]
}
EOF
)
    
    local response
    response=$(curl -s -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK" 2>&1)
    
    if [[ "$response" == "ok" ]]; then
        print_status "OK" "Slack notification sent successfully"
        print_status "INFO" "Check your Slack channel for the test message"
    else
        print_status "FAIL" "Slack notification failed"
        print_status "INFO" "Response: $response"
    fi
}

# =============================================================================
# SIMULATE INFECTION TEST
# =============================================================================

simulate_infection() {
    print_section "Simulated Infection Test"
    
    echo ""
    echo -e "${YELLOW}WARNING: This will create a harmless test file and trigger a real security scan.${NC}"
    echo -e "${YELLOW}The alert will be marked as TEST but will use the full alerting system.${NC}"
    echo ""
    
    # Create unique test file
    local test_file="/tmp/.maasiso-test-malware-${TEST_ID}"
    
    print_status "INFO" "Creating simulated malware indicator: $test_file"
    
    # Create the test file
    cat > "$test_file" <<EOF
# MAASISO SECURITY TEST FILE
# ==========================
# This is a harmless test file created by test-alert-system.sh
# to verify the security monitoring system detects suspicious files.
#
# Test ID: $TEST_ID
# Created: $TEST_TIMESTAMP
# Server: $HOSTNAME
#
# This file should be automatically detected and trigger an alert.
# It will be cleaned up after the test.
#
# DO NOT PANIC - This is a scheduled test.
EOF
    
    print_status "OK" "Test file created: $test_file"
    
    # Also create a suspicious hidden directory (will be cleaned up)
    local test_dir="/tmp/.maasiso-test-hidden-${TEST_ID}"
    mkdir -p "$test_dir"
    print_status "OK" "Test directory created: $test_dir"
    
    # Run the security monitor
    print_status "INFO" "Running security scan..."
    echo ""
    
    # Run with verbose output
    if [[ -f "${SCRIPT_DIR}/20-enhanced-security-monitor.sh" ]]; then
        "${SCRIPT_DIR}/20-enhanced-security-monitor.sh" --verbose || true
    else
        print_status "FAIL" "Security monitor script not found"
    fi
    
    echo ""
    print_section "Cleanup"
    
    # Clean up test file
    if [[ -f "$test_file" ]]; then
        rm -f "$test_file"
        print_status "OK" "Cleaned up test file: $test_file"
    fi
    
    # Clean up test directory
    if [[ -d "$test_dir" ]]; then
        rm -rf "$test_dir"
        print_status "OK" "Cleaned up test directory: $test_dir"
    fi
    
    echo ""
    print_status "OK" "Simulated infection test complete"
    print_status "INFO" "Check all notification channels for alerts"
}

# =============================================================================
# RUN ALL TESTS
# =============================================================================

run_all_tests() {
    print_header
    
    echo "Testing notifications to:"
    echo "  Email 1: ${ALERT_EMAIL_PRIMARY:-Not configured}"
    echo "  Email 2: ${ALERT_EMAIL_SECONDARY:-Not configured}"
    echo "  SMS:     ${SMS_PHONE:-Not configured} (via Pushover)"
    echo "  Slack:   $(if [[ -n "${SLACK_WEBHOOK:-}" ]]; then echo "Configured"; else echo "Not configured"; fi)"
    echo ""
    echo "Server: $HOSTNAME ($SERVER_IP)"
    echo "Role: $SERVER_ROLE"
    echo "Test ID: $TEST_ID"
    
    test_email
    test_sms
    test_slack
    
    print_section "Test Summary"
    echo ""
    echo "All tests have been initiated."
    echo ""
    echo "Please check the following:"
    echo "  1. Your email inboxes for test messages"
    echo "  2. Your phone/Pushover app for SMS notifications"
    echo "  3. Your Slack channel for test messages"
    echo ""
    echo "If any notifications are missing:"
    echo "  - Run './test-alert-system.sh --status' to check configuration"
    echo "  - Verify the credentials in security-monitor-config.sh"
    echo "  - Check server logs for errors"
    echo ""
}

# =============================================================================
# MAIN
# =============================================================================

case "${1:-}" in
    --email-only)
        print_header
        test_email
        ;;
    --sms-only)
        print_header
        test_sms
        ;;
    --slack-only)
        print_header
        test_slack
        ;;
    --simulate-infection)
        print_header
        simulate_infection
        ;;
    --status)
        show_config_status
        ;;
    --help|-h)
        echo "MaasISO Security Alert System Test"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  (no option)          Test all notification channels"
        echo "  --email-only         Test email notifications only"
        echo "  --sms-only           Test SMS (Pushover) only"
        echo "  --slack-only         Test Slack notifications only"
        echo "  --simulate-infection Create fake malware and run full scan"
        echo "  --status             Show configuration status"
        echo "  --help, -h           Show this help message"
        echo ""
        echo "Configuration file: $CONFIG_FILE"
        echo ""
        ;;
    *)
        run_all_tests
        ;;
esac

echo ""
echo "Test ID: $TEST_ID"
echo "Completed: $(date '+%Y-%m-%d %H:%M:%S')"