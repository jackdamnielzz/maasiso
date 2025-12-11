#!/bin/bash
#===============================================================================
#
#          FILE: guardian-self-test.sh
#
#         USAGE: ./guardian-self-test.sh [OPTIONS]
#
#   DESCRIPTION: Guardian Self-Test & Hardening Script
#                Tests Guardian detection by:
#                1. Disabling all Guardian cron jobs
#                2. Running attack simulation
#                3. Re-enabling Guardian
#                4. Verifying detection works
#                5. Applying additional hardening
#
#       OPTIONS: --test, --harden, --full, --restore, --status
#
#  REQUIREMENTS: Root privileges, attack simulation script
#
#        AUTHOR: MaasISO Security Team
#       CREATED: 2025-12-10
#       VERSION: 1.0.0
#
#===============================================================================

set -euo pipefail

#===============================================================================
# CONFIGURATION
#===============================================================================

# Directories
GUARDIAN_DIR="/opt/guardian"
LOG_DIR="/var/log/guardian"
STATE_DIR="/var/lib/guardian"
BACKUP_DIR="/root/guardian-backup"
ATTACK_SCRIPT="/root/advanced-attack-simulation.sh"

# Cron backup file
CRON_BACKUP="${BACKUP_DIR}/crontab-backup"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Test settings
TEST_WAIT_TIME=30  # Seconds to wait for Guardian to detect

#===============================================================================
# UTILITY FUNCTIONS
#===============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")    echo -e "${CYAN}[ℹ]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[✓]${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[!]${NC} $message" ;;
        "ERROR")   echo -e "${RED}[✗]${NC} $message" ;;
        "PHASE")   echo -e "${WHITE}[▶]${NC} $message" ;;
        "TEST")    echo -e "${PURPLE}[T]${NC} $message" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_DIR/self-test.log" 2>/dev/null || true
}

print_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ ██╗ █████╗ ███╗   ██╗           ║
║    ██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗██║██╔══██╗████╗  ██║           ║
║    ██║  ███╗██║   ██║███████║██████╔╝██║  ██║██║███████║██╔██╗ ██║           ║
║    ██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║██║██╔══██║██║╚██╗██║           ║
║    ╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝██║██║  ██║██║ ╚████║           ║
║     ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝           ║
║                                                                               ║
║     SELF-TEST & HARDENING SCRIPT                                              ║
║     Tests Guardian detection capabilities                                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "This script must be run as root"
        exit 1
    fi
}

#===============================================================================
# GUARDIAN CONTROL FUNCTIONS
#===============================================================================

backup_cron() {
    log "INFO" "Backing up current crontab..."
    mkdir -p "$BACKUP_DIR"
    crontab -l > "$CRON_BACKUP" 2>/dev/null || echo "# Empty crontab" > "$CRON_BACKUP"
    log "SUCCESS" "Crontab backed up to $CRON_BACKUP"
}

disable_guardian_crons() {
    log "PHASE" "Disabling all Guardian cron jobs..."
    
    # Get current crontab
    local current_cron=$(crontab -l 2>/dev/null || echo "")
    
    # Comment out Guardian lines
    local new_cron=$(echo "$current_cron" | sed 's|^\(\*.*guardian.*\)|# DISABLED_BY_SELFTEST: \1|g')
    
    # Apply new crontab
    echo "$new_cron" | crontab -
    
    # Verify
    local remaining=$(crontab -l 2>/dev/null | grep -v "^#" | grep "guardian" | wc -l)
    if [[ $remaining -eq 0 ]]; then
        log "SUCCESS" "All Guardian cron jobs disabled"
    else
        log "WARNING" "Some Guardian cron jobs may still be active"
    fi
    
    # Also stop any running Guardian processes
    pkill -f "guardian-" 2>/dev/null || true
    log "SUCCESS" "Stopped running Guardian processes"
}

enable_guardian_crons() {
    log "PHASE" "Re-enabling Guardian cron jobs..."
    
    # Get current crontab
    local current_cron=$(crontab -l 2>/dev/null || echo "")
    
    # Uncomment Guardian lines
    local new_cron=$(echo "$current_cron" | sed 's|^# DISABLED_BY_SELFTEST: ||g')
    
    # Apply new crontab
    echo "$new_cron" | crontab -
    
    # Verify
    local active=$(crontab -l 2>/dev/null | grep -v "^#" | grep "guardian" | wc -l)
    log "SUCCESS" "Re-enabled $active Guardian cron jobs"
}

restore_cron_from_backup() {
    if [[ -f "$CRON_BACKUP" ]]; then
        log "INFO" "Restoring crontab from backup..."
        crontab "$CRON_BACKUP"
        log "SUCCESS" "Crontab restored"
    else
        log "ERROR" "No backup found at $CRON_BACKUP"
    fi
}

#===============================================================================
# GUARDIAN STATUS CHECK
#===============================================================================

check_guardian_status() {
    echo ""
    echo -e "${WHITE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║  GUARDIAN STATUS                                                              ║${NC}"
    echo -e "${WHITE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check Guardian scripts
    echo -e "${WHITE}Guardian Scripts:${NC}"
    if [[ -d "$GUARDIAN_DIR" ]]; then
        local script_count=$(ls "$GUARDIAN_DIR"/*.sh 2>/dev/null | wc -l)
        echo -e "  ${GREEN}[✓]${NC} Guardian directory exists with $script_count scripts"
    else
        echo -e "  ${RED}[✗]${NC} Guardian directory not found"
    fi
    
    # Check cron jobs
    echo ""
    echo -e "${WHITE}Cron Jobs:${NC}"
    local cron_count=$(crontab -l 2>/dev/null | grep -v "^#" | grep "guardian" | wc -l)
    if [[ $cron_count -gt 0 ]]; then
        echo -e "  ${GREEN}[✓]${NC} $cron_count Guardian cron jobs active"
        crontab -l 2>/dev/null | grep -v "^#" | grep "guardian" | while read line; do
            echo -e "      ${CYAN}→${NC} $line"
        done
    else
        echo -e "  ${RED}[✗]${NC} No Guardian cron jobs active"
    fi
    
    # Check log files
    echo ""
    echo -e "${WHITE}Log Files:${NC}"
    if [[ -d "$LOG_DIR" ]]; then
        ls -lh "$LOG_DIR"/*.log 2>/dev/null | while read line; do
            echo "      $line"
        done
    else
        echo -e "  ${RED}[✗]${NC} Log directory not found"
    fi
    
    # Check recent alerts
    echo ""
    echo -e "${WHITE}Recent Alerts (last 10):${NC}"
    if [[ -f "$LOG_DIR/alerts.log" ]]; then
        tail -10 "$LOG_DIR/alerts.log" 2>/dev/null | while read line; do
            echo "      $line"
        done
    else
        echo -e "  ${YELLOW}[!]${NC} No alerts log found"
    fi
}

#===============================================================================
# SELF-TEST FUNCTIONS
#===============================================================================

run_self_test() {
    print_banner
    
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  GUARDIAN SELF-TEST PROCEDURE                                                 ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "PHASE" "Starting Guardian self-test..."
    
    # Step 1: Backup crontab
    backup_cron
    
    # Step 2: Disable Guardian
    disable_guardian_crons
    
    # Step 3: Run attack simulation
    echo ""
    log "PHASE" "Running attack simulation..."
    if [[ -x "$ATTACK_SCRIPT" ]]; then
        "$ATTACK_SCRIPT" --full --execute
    else
        log "ERROR" "Attack simulation script not found at $ATTACK_SCRIPT"
        enable_guardian_crons
        return 1
    fi
    
    # Step 4: Re-enable Guardian
    echo ""
    log "PHASE" "Re-enabling Guardian monitoring..."
    enable_guardian_crons
    
    # Step 5: Wait for detection
    echo ""
    log "INFO" "Waiting ${TEST_WAIT_TIME}s for Guardian to detect attack artifacts..."
    
    local i=0
    while [[ $i -lt $TEST_WAIT_TIME ]]; do
        printf "\r  [%02d/%02d] Waiting for detection..." "$i" "$TEST_WAIT_TIME"
        sleep 1
        ((i++))
    done
    echo ""
    
    # Step 6: Manually trigger Guardian scans
    log "PHASE" "Triggering Guardian scans..."
    
    local alerts_before=$(wc -l < "$LOG_DIR/alerts.log" 2>/dev/null || echo 0)
    
    # Run each Guardian script
    for script in files services process network cron; do
        if [[ -x "$GUARDIAN_DIR/guardian-${script}.sh" ]]; then
            log "INFO" "Running guardian-${script}.sh..."
            "$GUARDIAN_DIR/guardian-${script}.sh" 2>&1 | grep -E "CRITICAL|WARNING|ERROR" || true
        fi
    done
    
    local alerts_after=$(wc -l < "$LOG_DIR/alerts.log" 2>/dev/null || echo 0)
    local new_alerts=$((alerts_after - alerts_before))
    
    # Step 7: Check detection results
    echo ""
    echo -e "${WHITE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║  TEST RESULTS                                                                 ║${NC}"
    echo -e "${WHITE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [[ $new_alerts -gt 0 ]]; then
        log "SUCCESS" "Guardian detected attack: $new_alerts new alerts generated!"
        echo ""
        echo -e "${WHITE}New alerts:${NC}"
        tail -$new_alerts "$LOG_DIR/alerts.log" 2>/dev/null | while read line; do
            echo -e "  ${GREEN}→${NC} $line"
        done
    else
        log "WARNING" "No new alerts detected - Guardian may need adjustment"
    fi
    
    # Step 8: Cleanup attack artifacts
    echo ""
    log "PHASE" "Cleaning up attack simulation artifacts..."
    "$ATTACK_SCRIPT" --cleanup --execute 2>&1 | grep -E "✓|Removed|Terminated" || true
    
    log "SUCCESS" "Self-test completed!"
    
    # Summary
    echo ""
    echo -e "${WHITE}Summary:${NC}"
    echo -e "  • Cron jobs disabled and re-enabled: ${GREEN}✓${NC}"
    echo -e "  • Attack simulation executed: ${GREEN}✓${NC}"
    echo -e "  • Guardian scans triggered: ${GREEN}✓${NC}"
    echo -e "  • New alerts generated: ${new_alerts}"
    echo -e "  • Cleanup completed: ${GREEN}✓${NC}"
}

#===============================================================================
# HARDENING FUNCTIONS
#===============================================================================

apply_hardening() {
    print_banner
    
    echo ""
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  APPLYING ADDITIONAL HARDENING                                                ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "PHASE" "Applying system hardening..."
    
    # 1. Secure Guardian scripts
    log "INFO" "Securing Guardian scripts..."
    chmod 700 "$GUARDIAN_DIR"/*.sh 2>/dev/null || true
    chown root:root "$GUARDIAN_DIR"/*.sh 2>/dev/null || true
    log "SUCCESS" "Guardian scripts secured (700, root:root)"
    
    # 2. Secure log directory
    log "INFO" "Securing log directory..."
    chmod 700 "$LOG_DIR" 2>/dev/null || true
    chown root:root "$LOG_DIR" 2>/dev/null || true
    log "SUCCESS" "Log directory secured"
    
    # 3. SSH hardening
    log "INFO" "Checking SSH configuration..."
    local ssh_config="/etc/ssh/sshd_config"
    
    # Check and apply SSH hardening
    local ssh_changes=0
    
    if ! grep -q "^PermitRootLogin prohibit-password" "$ssh_config" 2>/dev/null; then
        if ! grep -q "^PermitRootLogin no" "$ssh_config" 2>/dev/null; then
            log "WARNING" "Root login via password may be enabled"
            ((ssh_changes++))
        fi
    fi
    
    if ! grep -q "^PasswordAuthentication no" "$ssh_config" 2>/dev/null; then
        log "WARNING" "Password authentication may be enabled"
        ((ssh_changes++))
    fi
    
    if ! grep -q "^MaxAuthTries" "$ssh_config" 2>/dev/null; then
        log "WARNING" "MaxAuthTries not set"
        ((ssh_changes++))
    fi
    
    if [[ $ssh_changes -eq 0 ]]; then
        log "SUCCESS" "SSH configuration looks secure"
    else
        log "WARNING" "$ssh_changes SSH hardening recommendations"
    fi
    
    # 4. Fail2ban check
    log "INFO" "Checking Fail2ban..."
    if systemctl is-active fail2ban &>/dev/null; then
        log "SUCCESS" "Fail2ban is running"
        local banned=$(fail2ban-client status sshd 2>/dev/null | grep "Currently banned" | awk '{print $4}')
        log "INFO" "Currently banned IPs: ${banned:-0}"
    else
        log "WARNING" "Fail2ban is not running"
        log "INFO" "Starting Fail2ban..."
        systemctl enable fail2ban 2>/dev/null || true
        systemctl start fail2ban 2>/dev/null || true
    fi
    
    # 5. Firewall check
    log "INFO" "Checking firewall..."
    if command -v ufw &>/dev/null; then
        if ufw status | grep -q "Status: active"; then
            log "SUCCESS" "UFW firewall is active"
        else
            log "WARNING" "UFW firewall is not active"
        fi
    elif command -v iptables &>/dev/null; then
        local rules=$(iptables -L -n 2>/dev/null | wc -l)
        if [[ $rules -gt 10 ]]; then
            log "SUCCESS" "iptables has $rules rules configured"
        else
            log "WARNING" "iptables has minimal rules"
        fi
    fi
    
    # 6. Automatic security updates
    log "INFO" "Checking automatic updates..."
    if [[ -f /etc/apt/apt.conf.d/20auto-upgrades ]]; then
        if grep -q "Unattended-Upgrade.*1" /etc/apt/apt.conf.d/20auto-upgrades 2>/dev/null; then
            log "SUCCESS" "Automatic security updates enabled"
        else
            log "WARNING" "Automatic updates may not be enabled"
        fi
    fi
    
    # 7. Add Guardian watchdog cron (monitors Guardian itself)
    log "INFO" "Setting up Guardian watchdog..."
    
    local watchdog_cron="*/5 * * * * /opt/guardian/guardian-watchdog.sh >> /var/log/guardian/watchdog.log 2>&1"
    
    # Create watchdog script
    cat > "$GUARDIAN_DIR/guardian-watchdog.sh" << 'WATCHDOG'
#!/bin/bash
# Guardian Watchdog - Ensures Guardian is running

GUARDIAN_DIR="/opt/guardian"
LOG_DIR="/var/log/guardian"

# Check if Guardian crons are present
cron_count=$(crontab -l 2>/dev/null | grep -v "^#" | grep "guardian-" | grep -v "watchdog" | wc -l)

if [[ $cron_count -lt 3 ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [CRITICAL] Guardian crons missing! Count: $cron_count"
    
    # Send alert
    if command -v mail &>/dev/null; then
        echo "Guardian cron jobs are missing! Only $cron_count found. System may be compromised." | \
            mail -s "🚨 CRITICAL: Guardian Crons Missing!" niels.maas@maasiso.nl
    fi
fi

# Check if Guardian has logged recently (within last 10 minutes)
if [[ -f "$LOG_DIR/guardian.log" ]]; then
    last_mod=$(stat -c %Y "$LOG_DIR/guardian.log" 2>/dev/null)
    now=$(date +%s)
    diff=$((now - last_mod))
    
    if [[ $diff -gt 600 ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] Guardian log stale: ${diff}s since last update"
    fi
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Watchdog check complete"
WATCHDOG

    chmod 700 "$GUARDIAN_DIR/guardian-watchdog.sh"
    
    # Add watchdog to cron if not present
    if ! crontab -l 2>/dev/null | grep -q "guardian-watchdog"; then
        (crontab -l 2>/dev/null; echo "$watchdog_cron") | crontab -
        log "SUCCESS" "Guardian watchdog cron added"
    else
        log "INFO" "Guardian watchdog already in crontab"
    fi
    
    # 8. Protect critical directories
    log "INFO" "Setting immutable flag on critical configs..."
    
    # Make critical files immutable (prevent modification)
    for file in /etc/passwd /etc/shadow /etc/sudoers; do
        if [[ -f "$file" ]]; then
            chattr +i "$file" 2>/dev/null || true
        fi
    done
    log "SUCCESS" "Critical files protected with immutable flag"
    log "INFO" "Note: Use 'chattr -i' to modify these files later"
    
    # 9. Disable unused services
    log "INFO" "Checking for unnecessary services..."
    local services_to_check=("cups" "avahi-daemon" "bluetooth")
    for svc in "${services_to_check[@]}"; do
        if systemctl is-active "$svc" &>/dev/null; then
            log "WARNING" "Service '$svc' is running - consider disabling"
        fi
    done
    
    # Summary
    echo ""
    echo -e "${WHITE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║  HARDENING SUMMARY                                                            ║${NC}"
    echo -e "${WHITE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${WHITE}Applied:${NC}"
    echo "  ✓ Guardian scripts secured (700 permissions)"
    echo "  ✓ Log directory secured"
    echo "  ✓ Guardian watchdog cron added"
    echo "  ✓ Critical files protected (immutable)"
    echo ""
    echo -e "${WHITE}Recommendations:${NC}"
    echo "  • Review SSH configuration for password auth"
    echo "  • Ensure Fail2ban is active and configured"
    echo "  • Verify firewall rules are appropriate"
    echo "  • Enable automatic security updates"
    
    log "SUCCESS" "Hardening completed!"
}

#===============================================================================
# FULL TEST + HARDEN
#===============================================================================

run_full() {
    run_self_test
    echo ""
    echo ""
    apply_hardening
}

#===============================================================================
# HELP
#===============================================================================

show_help() {
    print_banner
    
    cat << EOF
${WHITE}USAGE:${NC}
    $(basename "$0") [OPTIONS]

${WHITE}OPTIONS:${NC}
    --test      Run Guardian self-test only
    --harden    Apply additional hardening only
    --full      Run self-test AND apply hardening
    --restore   Restore crontab from backup
    --status    Show Guardian status
    --help      Show this help message

${WHITE}DESCRIPTION:${NC}
    This script tests Guardian's detection capabilities by:
    
    1. Disabling all Guardian cron jobs temporarily
    2. Running the attack simulation script
    3. Re-enabling Guardian monitoring
    4. Triggering Guardian scans
    5. Verifying alerts were generated
    6. Cleaning up test artifacts
    
    The --harden option applies additional security measures:
    - Secures Guardian files and directories
    - Sets up Guardian watchdog (monitors Guardian itself)
    - Protects critical system files
    - Checks SSH, Fail2ban, and firewall configuration

${WHITE}EXAMPLES:${NC}
    # Run full test and hardening
    $(basename "$0") --full

    # Just run the self-test
    $(basename "$0") --test

    # Just apply hardening
    $(basename "$0") --harden

    # Check current status
    $(basename "$0") --status

EOF
}

#===============================================================================
# MAIN
#===============================================================================

main() {
    check_root
    mkdir -p "$LOG_DIR" "$BACKUP_DIR"
    
    case "${1:-}" in
        --test)
            run_self_test
            ;;
        --harden)
            apply_hardening
            ;;
        --full)
            run_full
            ;;
        --restore)
            restore_cron_from_backup
            ;;
        --status)
            check_guardian_status
            ;;
        --help|-h)
            show_help
            ;;
        *)
            show_help
            ;;
    esac
}

main "$@"