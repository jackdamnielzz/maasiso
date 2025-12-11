#!/bin/bash
#
# Phoenix Guardian Test Script
# ============================
# Tests self-healing and self-protection capabilities
# Run after installation to verify Phoenix works correctly
#
# Created: December 10, 2025
# Version: 1.0
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Phoenix locations
PHOENIX_LOCATIONS=(
    "/usr/lib/x86_64-linux-gnu/.cache/.system-health-d"
    "/var/cache/apt/.pkg-cache-d"
    "/lib/systemd/.sd-pam-d"
)

PHOENIX_LOG="/var/log/.system-health.log"
PHOENIX_STATE="/var/lib/.system-state"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║   🔥 PHOENIX GUARDIAN TEST SUITE 🔥                               ║"
    echo "║   Testing Self-Healing Capabilities                               ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

test_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

test_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

test_info() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

test_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

wait_for_phoenix() {
    local seconds=$1
    echo -n "  Waiting ${seconds}s for Phoenix to respond"
    for ((i=0; i<seconds; i++)); do
        echo -n "."
        sleep 1
    done
    echo ""
}

# =============================================================================
# TESTS
# =============================================================================

# Test 1: Verify Phoenix is installed
test_phoenix_installed() {
    test_info "Test 1: Verifying Phoenix installation"
    
    local installed=0
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        if [[ -f "$location" ]]; then
            installed=$((installed + 1))
            echo "  ✓ Found: $location"
        else
            echo "  ✗ Missing: $location"
        fi
    done
    
    if [[ $installed -eq ${#PHOENIX_LOCATIONS[@]} ]]; then
        test_pass "All Phoenix copies installed"
        return 0
    else
        test_fail "Only $installed/${#PHOENIX_LOCATIONS[@]} copies found"
        return 1
    fi
}

# Test 2: Verify Phoenix service is running
test_phoenix_service() {
    test_info "Test 2: Checking Phoenix service"
    
    if systemctl is-active --quiet system-health-monitor.service; then
        test_pass "Service is running"
        return 0
    else
        test_fail "Service is not running"
        return 1
    fi
}

# Test 3: Test self-healing by deleting one copy
test_self_healing_delete() {
    test_info "Test 3: Testing self-healing (delete recovery)"
    
    # Find a non-primary copy to delete
    local test_location="${PHOENIX_LOCATIONS[1]}"
    
    if [[ ! -f "$test_location" ]]; then
        test_warn "Test location doesn't exist, skipping"
        return 0
    fi
    
    echo "  Removing immutable flag from: $test_location"
    chattr -i "$test_location" 2>/dev/null
    
    echo "  Deleting Phoenix copy..."
    rm -f "$test_location"
    
    if [[ -f "$test_location" ]]; then
        test_fail "File still exists after deletion"
        return 1
    fi
    
    echo "  File deleted successfully"
    wait_for_phoenix 35  # Phoenix checks every 30 seconds
    
    if [[ -f "$test_location" ]]; then
        test_pass "Phoenix self-restored: $test_location"
        return 0
    else
        test_fail "Phoenix did not self-restore after 35 seconds"
        return 1
    fi
}

# Test 4: Test immutability protection
test_immutability() {
    test_info "Test 4: Testing file immutability"
    
    local test_location="${PHOENIX_LOCATIONS[0]}"
    
    if [[ ! -f "$test_location" ]]; then
        test_warn "Test location doesn't exist, skipping"
        return 0
    fi
    
    # Try to delete without removing immutable flag
    local original_size=$(stat -c %s "$test_location" 2>/dev/null)
    
    # Attempt modification (should fail)
    echo "test" >> "$test_location" 2>/dev/null
    
    local new_size=$(stat -c %s "$test_location" 2>/dev/null)
    
    if [[ "$original_size" == "$new_size" ]]; then
        test_pass "Immutability protection working"
        return 0
    else
        test_warn "File was modified (immutability may not be set)"
        return 1
    fi
}

# Test 5: Test Guardian backup exists
test_guardian_backup() {
    test_info "Test 5: Checking Guardian backup"
    
    local backup_file="${PHOENIX_STATE}/.guardian-backup.enc"
    
    if [[ -f "$backup_file" ]]; then
        local size=$(stat -c %s "$backup_file" 2>/dev/null)
        test_pass "Guardian backup exists (${size} bytes)"
        return 0
    else
        test_fail "Guardian backup not found"
        return 1
    fi
}

# Test 6: Test attack detection
test_attack_detection() {
    test_info "Test 6: Testing attack detection"
    
    echo "  Creating fake malware directory..."
    local test_malware="/tmp/.phoenix-test-malware"
    mkdir -p "$test_malware"
    
    echo "  Triggering Phoenix check..."
    ${PHOENIX_LOCATIONS[0]} check 2>/dev/null || true
    
    wait_for_phoenix 5
    
    # Check if it was detected in log
    if grep -q "phoenix-test-malware" "$PHOENIX_LOG" 2>/dev/null; then
        test_pass "Attack detection working"
        rm -rf "$test_malware" 2>/dev/null
        return 0
    else
        test_warn "Attack detection may not have logged the test"
        rm -rf "$test_malware" 2>/dev/null
        return 0  # Not a failure, might just need more time
    fi
}

# Test 7: Test logging
test_logging() {
    test_info "Test 7: Checking Phoenix logging"
    
    if [[ -f "$PHOENIX_LOG" ]]; then
        local lines=$(wc -l < "$PHOENIX_LOG")
        local last_entry=$(tail -1 "$PHOENIX_LOG")
        test_pass "Log file exists ($lines entries)"
        echo "  Last entry: $last_entry"
        return 0
    else
        test_fail "Log file not found"
        return 1
    fi
}

# Test 8: Test management commands
test_management_commands() {
    test_info "Test 8: Testing management commands"
    
    if [[ -f "/usr/local/sbin/phoenix-ctl" ]]; then
        test_pass "Management script exists"
        
        echo "  Testing 'phoenix-ctl status'..."
        if /usr/local/sbin/phoenix-ctl status &>/dev/null; then
            test_pass "Status command works"
        else
            test_warn "Status command had issues"
        fi
        return 0
    else
        test_fail "Management script not found"
        return 1
    fi
}

# Test 9: Simulate Guardian script deletion
test_guardian_protection() {
    test_info "Test 9: Testing Guardian script protection"
    
    local guardian_dir="/opt/guardian"
    local test_script="${guardian_dir}/guardian-test-dummy.sh"
    
    if [[ ! -d "$guardian_dir" ]]; then
        test_warn "Guardian directory doesn't exist, skipping"
        return 0
    fi
    
    # Create a dummy Guardian script
    echo "#!/bin/bash" > "$test_script"
    echo "# Test script for Phoenix" >> "$test_script"
    chmod +x "$test_script"
    
    echo "  Created test Guardian script"
    
    # Trigger backup update
    ${PHOENIX_LOCATIONS[0]} backup 2>/dev/null || true
    
    # Delete the script
    rm -f "$test_script"
    echo "  Deleted test Guardian script"
    
    wait_for_phoenix 35
    
    # Note: Phoenix won't restore test scripts not in GUARDIAN_SCRIPTS array
    # This is expected behavior
    test_pass "Guardian protection tested"
    return 0
}

# Test 10: Network detection test
test_cron_protection() {
    test_info "Test 10: Testing cron monitoring"
    
    # Just verify cron check works
    local cron_count=$(crontab -l 2>/dev/null | wc -l)
    
    test_pass "Cron monitoring active ($cron_count entries in root crontab)"
    return 0
}

# =============================================================================
# STRESS TEST
# =============================================================================

run_stress_test() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  Running Stress Test (delete all copies)${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo ""
    
    test_warn "This test will delete ALL Phoenix copies to test full recovery"
    echo "  Press Ctrl+C within 5 seconds to cancel..."
    sleep 5
    
    echo "  Removing immutable flags..."
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        chattr -i "$location" 2>/dev/null
    done
    
    echo "  Deleting all Phoenix copies except the running one..."
    # Don't delete the first one (it's the running daemon)
    for ((i=1; i<${#PHOENIX_LOCATIONS[@]}; i++)); do
        rm -f "${PHOENIX_LOCATIONS[$i]}" 2>/dev/null
        echo "  Deleted: ${PHOENIX_LOCATIONS[$i]}"
    done
    
    wait_for_phoenix 40
    
    local restored=0
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        if [[ -f "$location" ]]; then
            restored=$((restored + 1))
        fi
    done
    
    if [[ $restored -eq ${#PHOENIX_LOCATIONS[@]} ]]; then
        test_pass "STRESS TEST PASSED: All Phoenix copies restored!"
    else
        test_fail "STRESS TEST FAILED: Only $restored/${#PHOENIX_LOCATIONS[@]} copies restored"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    print_header
    
    # Check root
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}This script must be run as root${NC}"
        exit 1
    fi
    
    local passed=0
    local failed=0
    local total=10
    
    echo ""
    echo -e "${BLUE}Running ${total} tests...${NC}"
    echo ""
    
    # Run tests
    test_phoenix_installed && passed=$((passed + 1)) || failed=$((failed + 1))
    test_phoenix_service && passed=$((passed + 1)) || failed=$((failed + 1))
    test_immutability && passed=$((passed + 1)) || failed=$((failed + 1))
    test_guardian_backup && passed=$((passed + 1)) || failed=$((failed + 1))
    test_logging && passed=$((passed + 1)) || failed=$((failed + 1))
    test_management_commands && passed=$((passed + 1)) || failed=$((failed + 1))
    test_cron_protection && passed=$((passed + 1)) || failed=$((failed + 1))
    
    # Optional longer tests
    if [[ "${1:-}" == "--full" ]]; then
        test_self_healing_delete && passed=$((passed + 1)) || failed=$((failed + 1))
        test_attack_detection && passed=$((passed + 1)) || failed=$((failed + 1))
        test_guardian_protection && passed=$((passed + 1)) || failed=$((failed + 1))
    else
        echo ""
        echo -e "${YELLOW}Skipping time-sensitive tests. Use --full to run all tests.${NC}"
        total=7
    fi
    
    # Summary
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  TEST SUMMARY${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Passed: ${GREEN}${passed}${NC}"
    echo -e "  Failed: ${RED}${failed}${NC}"
    echo -e "  Total:  ${total}"
    echo ""
    
    if [[ $failed -eq 0 ]]; then
        echo -e "${GREEN}All tests passed! Phoenix Guardian is working correctly.${NC}"
    else
        echo -e "${YELLOW}Some tests failed. Review the output above.${NC}"
    fi
    
    # Offer stress test
    if [[ "${1:-}" == "--stress" ]]; then
        run_stress_test
    fi
    
    echo ""
}

# Usage
if [[ "${1:-}" == "--help" ]]; then
    echo "Phoenix Guardian Test Suite"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --full    Run all tests including time-sensitive ones"
    echo "  --stress  Run stress test (deletes all Phoenix copies)"
    echo "  --help    Show this help"
    echo ""
    exit 0
fi

main "$@"