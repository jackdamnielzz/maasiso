#!/bin/bash
#
# Fake Malware Simulation for Testing Security Monitoring
# ========================================================
# 
# SAFE: Creates harmless test files that trigger monitoring alerts
# Purpose: Verify that the security monitoring system correctly detects threats
#
# Usage: 
#   ./simulate-infection.sh              # Create fake malware indicators
#   ./simulate-infection.sh --cleanup    # Remove all test indicators
#   ./simulate-infection.sh --status     # Show current test indicator status
#
# Created: December 9, 2025
# For: MaasISO Security Monitoring Testing
#

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================

# Test marker - all fake files will contain this
TEST_MARKER="=== MAASISO SECURITY TEST - NOT REAL MALWARE ==="
TEST_MARKER_SHORT="MAASISO-TEST"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test directories (match monitoring script's MALWARE_DIRECTORIES)
TEST_DIRS=(
    "/root/.sshds"
    "/root/.local/share/.05bf0e9b"
)

# Hidden directory test (not in ALLOWED_HIDDEN_DIRS whitelist)
TEST_HIDDEN_DIR="/root/.test-maasiso-hidden"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_banner() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     ${YELLOW}FAKE MALWARE SIMULATION FOR TESTING${BLUE}                          ║${NC}"
    echo -e "${BLUE}║     ${NC}Creates harmless test indicators for security monitoring${BLUE}     ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: This script creates fake malware indicators!${NC}"
    echo -e "${YELLOW}   These are completely harmless test files that will trigger${NC}"
    echo -e "${YELLOW}   security monitoring alerts for testing purposes.${NC}"
    echo ""
}

log_action() {
    local status="$1"
    local message="$2"
    local timestamp=$(date '+%H:%M:%S')
    
    case "$status" in
        "OK")
            echo -e "[$timestamp] ${GREEN}✓${NC} $message"
            ;;
        "WARN")
            echo -e "[$timestamp] ${YELLOW}⚠${NC} $message"
            ;;
        "ERR")
            echo -e "[$timestamp] ${RED}✗${NC} $message"
            ;;
        "INFO")
            echo -e "[$timestamp] ${BLUE}ℹ${NC} $message"
            ;;
    esac
}

# =============================================================================
# CREATE FAKE MALWARE INDICATORS
# =============================================================================

create_fake_indicators() {
    print_banner
    print_warning
    
    echo -e "${GREEN}Creating fake malware indicators...${NC}"
    echo ""
    
    local created_count=0
    
    # --- Create fake XMRig miner directory ---
    echo -e "${BLUE}--- Fake Miner Directories ---${NC}"
    
    for dir in "${TEST_DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            log_action "WARN" "Directory already exists: $dir"
        else
            mkdir -p "$dir"
            cat > "${dir}/README-TEST" << EOF
$TEST_MARKER

This directory was created by simulate-infection.sh for testing purposes.
It mimics the location used by cryptominer malware.

Created: $(date)
Purpose: Test security monitoring detection
Safe to delete: YES

To clean up, run: simulate-infection.sh --cleanup
EOF
            # Create a fake "binary" file
            echo "$TEST_MARKER" > "${dir}/test-binary"
            chmod 644 "${dir}/test-binary"
            
            log_action "OK" "Created fake malware directory: $dir"
            ((created_count++))
        fi
    done
    
    # --- Create fake hidden directory ---
    echo ""
    echo -e "${BLUE}--- Fake Hidden Directory ---${NC}"
    
    if [[ -d "$TEST_HIDDEN_DIR" ]]; then
        log_action "WARN" "Hidden directory already exists: $TEST_HIDDEN_DIR"
    else
        mkdir -p "$TEST_HIDDEN_DIR"
        cat > "${TEST_HIDDEN_DIR}/README-TEST" << EOF
$TEST_MARKER

This hidden directory was created by simulate-infection.sh for testing.
It is NOT in the whitelist, so the security monitor should flag it.

Created: $(date)
Purpose: Test hidden directory detection
Safe to delete: YES

To clean up, run: simulate-infection.sh --cleanup
EOF
        log_action "OK" "Created fake hidden directory: $TEST_HIDDEN_DIR"
        ((created_count++))
    fi
    
    # --- Add fake cron entry (commented out - won't execute) ---
    echo ""
    echo -e "${BLUE}--- Fake Cron Entry ---${NC}"
    
    local cron_marker="# $TEST_MARKER_SHORT"
    local fake_cron_line="$cron_marker: This is a FAKE malware cron entry for testing detection"
    
    if crontab -l 2>/dev/null | grep -q "$TEST_MARKER_SHORT"; then
        log_action "WARN" "Fake cron entry already exists"
    else
        # Add commented fake cron entry
        (crontab -l 2>/dev/null; echo "$fake_cron_line") | crontab -
        log_action "OK" "Added fake cron entry (commented, won't run)"
        ((created_count++))
    fi
    
    # --- Summary ---
    echo ""
    echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  FAKE MALWARE INDICATORS CREATED: $created_count${NC}"
    echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Created indicators:${NC}"
    for dir in "${TEST_DIRS[@]}"; do
        [[ -d "$dir" ]] && echo "  📁 $dir"
    done
    [[ -d "$TEST_HIDDEN_DIR" ]] && echo "  📁 $TEST_HIDDEN_DIR"
    crontab -l 2>/dev/null | grep -q "$TEST_MARKER_SHORT" && echo "  📝 Fake cron entry (commented)"
    
    echo ""
    echo -e "${YELLOW}NEXT STEPS:${NC}"
    echo "  1. Run the security monitor manually to test detection:"
    echo "     ${BLUE}/root/20-enhanced-security-monitor.sh${NC}"
    echo ""
    echo "  2. Or wait up to 5 minutes for automatic cron detection"
    echo ""
    echo "  3. Check if you receive alerts (email/SMS/Slack)"
    echo ""
    echo "  4. After testing, clean up with:"
    echo "     ${BLUE}./simulate-infection.sh --cleanup${NC}"
    echo ""
}

# =============================================================================
# CLEANUP FAKE INDICATORS
# =============================================================================

cleanup_fake_indicators() {
    print_banner
    
    echo -e "${GREEN}Cleaning up fake malware indicators...${NC}"
    echo ""
    
    local removed_count=0
    
    # --- Remove fake directories ---
    echo -e "${BLUE}--- Removing Fake Directories ---${NC}"
    
    for dir in "${TEST_DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            # Verify it's our test directory by checking for marker
            if [[ -f "${dir}/README-TEST" ]] && grep -q "$TEST_MARKER_SHORT" "${dir}/README-TEST" 2>/dev/null; then
                rm -rf "$dir"
                log_action "OK" "Removed: $dir"
                ((removed_count++))
            else
                log_action "WARN" "Directory exists but doesn't look like test data: $dir"
                log_action "WARN" "  Skipping for safety - remove manually if needed"
            fi
        else
            log_action "INFO" "Already clean: $dir"
        fi
    done
    
    # --- Remove hidden test directory ---
    if [[ -d "$TEST_HIDDEN_DIR" ]]; then
        rm -rf "$TEST_HIDDEN_DIR"
        log_action "OK" "Removed: $TEST_HIDDEN_DIR"
        ((removed_count++))
    else
        log_action "INFO" "Already clean: $TEST_HIDDEN_DIR"
    fi
    
    # --- Remove fake cron entry ---
    echo ""
    echo -e "${BLUE}--- Removing Fake Cron Entry ---${NC}"
    
    if crontab -l 2>/dev/null | grep -q "$TEST_MARKER_SHORT"; then
        crontab -l 2>/dev/null | grep -v "$TEST_MARKER_SHORT" | crontab -
        log_action "OK" "Removed fake cron entry"
        ((removed_count++))
    else
        log_action "INFO" "No fake cron entry found"
    fi
    
    # --- Summary ---
    echo ""
    echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  CLEANUP COMPLETE - Removed $removed_count items${NC}"
    echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Verify cleanup
    show_status
}

# =============================================================================
# SHOW STATUS
# =============================================================================

show_status() {
    echo -e "${BLUE}Current test indicator status:${NC}"
    echo ""
    
    local found=0
    
    for dir in "${TEST_DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            echo -e "  ${YELLOW}⚠ EXISTS:${NC} $dir"
            ((found++))
        else
            echo -e "  ${GREEN}✓ Clean:${NC}  $dir"
        fi
    done
    
    if [[ -d "$TEST_HIDDEN_DIR" ]]; then
        echo -e "  ${YELLOW}⚠ EXISTS:${NC} $TEST_HIDDEN_DIR"
        ((found++))
    else
        echo -e "  ${GREEN}✓ Clean:${NC}  $TEST_HIDDEN_DIR"
    fi
    
    if crontab -l 2>/dev/null | grep -q "$TEST_MARKER_SHORT"; then
        echo -e "  ${YELLOW}⚠ EXISTS:${NC} Fake cron entry"
        ((found++))
    else
        echo -e "  ${GREEN}✓ Clean:${NC}  Cron entries"
    fi
    
    echo ""
    if [[ $found -gt 0 ]]; then
        echo -e "${YELLOW}Found $found test indicator(s) still present.${NC}"
        echo -e "Run ${BLUE}./simulate-infection.sh --cleanup${NC} to remove them."
    else
        echo -e "${GREEN}All test indicators have been cleaned up.${NC}"
    fi
    echo ""
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    # Must run as root
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}ERROR: This script must be run as root${NC}"
        exit 1
    fi
    
    case "${1:-}" in
        --cleanup|-c)
            cleanup_fake_indicators
            ;;
        --status|-s)
            print_banner
            show_status
            ;;
        --help|-h)
            print_banner
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  (none)      Create fake malware indicators for testing"
            echo "  --cleanup   Remove all fake malware indicators"
            echo "  --status    Show current status of test indicators"
            echo "  --help      Show this help message"
            echo ""
            echo "This script creates harmless test files that will trigger"
            echo "the security monitoring system's alerts, allowing you to"
            echo "verify that detection and alerting are working correctly."
            echo ""
            ;;
        *)
            create_fake_indicators
            ;;
    esac
}

main "$@"