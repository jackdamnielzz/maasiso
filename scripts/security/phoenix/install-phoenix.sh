#!/bin/bash
#
# Phoenix Guardian Installation Script
# =====================================
# Installs Phoenix Guardian in hidden locations on the server
# Creates encrypted backups and sets up self-healing mechanism
#
# MUST BE RUN AS ROOT
#
# Created: December 10, 2025
# Version: 1.0
#

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================

# Hidden locations for Phoenix
PHOENIX_LOCATIONS=(
    "/usr/lib/x86_64-linux-gnu/.cache/.system-health-d"
    "/var/cache/apt/.pkg-cache-d"
    "/lib/systemd/.sd-pam-d"
)

# Source Phoenix script (this directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PHOENIX_SOURCE="${SCRIPT_DIR}/phoenix-guardian.sh"

# Guardian directory
GUARDIAN_DIR="/opt/guardian"

# State directories
PHOENIX_STATE_DIR="/var/lib/.system-state"
PHOENIX_LOG="/var/log/.system-health.log"

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
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║   🔥 PHOENIX GUARDIAN INSTALLATION 🔥                             ║"
    echo "║   Self-Healing Security Meta-Script                               ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        echo "Usage: sudo $0"
        exit 1
    fi
}

get_encryption_key() {
    echo "$(hostname)-phoenix-$(cat /etc/machine-id 2>/dev/null | head -c 8)"
}

# =============================================================================
# INSTALLATION STEPS
# =============================================================================

# Step 1: Verify prerequisites
verify_prerequisites() {
    log_step "Verifying prerequisites..."
    
    # Check if Phoenix source exists
    if [[ ! -f "$PHOENIX_SOURCE" ]]; then
        log_error "Phoenix source not found: $PHOENIX_SOURCE"
        exit 1
    fi
    
    # Check for required commands
    local required_cmds=("openssl" "tar" "systemctl")
    for cmd in "${required_cmds[@]}"; do
        if ! command -v "$cmd" &>/dev/null; then
            log_error "Required command not found: $cmd"
            exit 1
        fi
    done
    
    # Check for chattr (optional but recommended)
    if ! command -v chattr &>/dev/null; then
        log_warn "chattr not found - files won't be made immutable"
        log_warn "Install with: apt install e2fsprogs"
    fi
    
    log_info "Prerequisites verified"
}

# Step 2: Create hidden directories
create_hidden_directories() {
    log_step "Creating hidden directories..."
    
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        local dir=$(dirname "$location")
        
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir" 2>/dev/null
            chmod 755 "$dir" 2>/dev/null
            log_info "Created directory: $dir"
        fi
    done
    
    # Create state directory
    if [[ ! -d "$PHOENIX_STATE_DIR" ]]; then
        mkdir -p "$PHOENIX_STATE_DIR"
        chmod 700 "$PHOENIX_STATE_DIR"
        log_info "Created state directory: $PHOENIX_STATE_DIR"
    fi
}

# Step 3: Install Phoenix to hidden locations
install_phoenix_copies() {
    log_step "Installing Phoenix to hidden locations..."
    
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        # Remove existing (including immutable flag)
        chattr -i "$location" 2>/dev/null
        rm -f "$location" 2>/dev/null
        
        # Copy Phoenix
        cp "$PHOENIX_SOURCE" "$location"
        chmod 700 "$location"
        
        # Make immutable
        if command -v chattr &>/dev/null; then
            chattr +i "$location"
            log_info "Installed (immutable): $location"
        else
            log_info "Installed: $location"
        fi
    done
}

# Step 4: Create Guardian scripts backup
create_guardian_backup() {
    log_step "Creating Guardian scripts backup..."
    
    if [[ ! -d "$GUARDIAN_DIR" ]]; then
        log_warn "Guardian directory not found: $GUARDIAN_DIR"
        log_warn "Skipping backup - run Guardian installation first"
        return 0
    fi
    
    local backup_file="${PHOENIX_STATE_DIR}/.guardian-backup.enc"
    local key=$(get_encryption_key)
    
    # Remove immutable if exists
    chattr -i "$backup_file" 2>/dev/null
    
    # Create encrypted backup
    tar czf - -C "$GUARDIAN_DIR" . 2>/dev/null | \
        openssl enc -aes-256-cbc -salt -pbkdf2 -pass "pass:$key" > "$backup_file" 2>/dev/null
    
    if [[ -f "$backup_file" ]]; then
        chmod 600 "$backup_file"
        chattr +i "$backup_file" 2>/dev/null
        log_info "Guardian backup created: $backup_file"
    else
        log_error "Failed to create Guardian backup"
    fi
}

# Step 5: Create systemd service (with innocent name)
create_systemd_service() {
    log_step "Creating systemd service..."
    
    # Service with innocent name
    cat > /etc/systemd/system/system-health-monitor.service << 'SYSTEMD_SERVICE'
[Unit]
Description=System Health Monitor Daemon
Documentation=man:systemd(1)
After=network.target local-fs.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/lib/x86_64-linux-gnu/.cache/.system-health-d
Restart=always
RestartSec=10
StartLimitBurst=5
StartLimitInterval=60

# Security settings (looks more legitimate)
NoNewPrivileges=no
ProtectSystem=false
PrivateTmp=false

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
SYSTEMD_SERVICE

    log_info "Created: /etc/systemd/system/system-health-monitor.service"
    
    # Enable and start
    systemctl daemon-reload
    systemctl enable system-health-monitor.service 2>/dev/null
    systemctl start system-health-monitor.service 2>/dev/null
    
    if systemctl is-active --quiet system-health-monitor.service; then
        log_info "Service started successfully"
    else
        log_warn "Service may not have started - check manually"
    fi
}

# Step 6: Create cron fallback (in case systemd fails)
create_cron_fallback() {
    log_step "Creating cron fallback..."
    
    # Add to root crontab as fallback
    local cron_entry="*/5 * * * * /usr/lib/x86_64-linux-gnu/.cache/.system-health-d check >/dev/null 2>&1"
    
    # Check if entry exists
    if crontab -l 2>/dev/null | grep -q ".system-health-d"; then
        log_info "Cron fallback already exists"
    else
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log_info "Added cron fallback"
    fi
    
    # Also add to /etc/cron.d (another fallback)
    cat > /etc/cron.d/system-health << 'CRON_FILE'
# System Health Monitor - Fallback
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

*/5 * * * * root /usr/lib/x86_64-linux-gnu/.cache/.system-health-d check >/dev/null 2>&1
CRON_FILE

    chmod 644 /etc/cron.d/system-health
    log_info "Created: /etc/cron.d/system-health"
}

# Step 7: Hide from locate/find databases
hide_from_locate() {
    log_step "Hiding from locate database..."
    
    local updatedb_conf="/etc/updatedb.conf"
    
    if [[ -f "$updatedb_conf" ]]; then
        # Add hidden paths to PRUNEPATHS if not already there
        local paths_to_hide=(
            "/usr/lib/x86_64-linux-gnu/.cache"
            "/var/lib/.system-state"
            "/var/cache/apt/.pkg-cache-d"
            "/lib/systemd/.sd-pam-d"
        )
        
        for path in "${paths_to_hide[@]}"; do
            if ! grep -q "$path" "$updatedb_conf" 2>/dev/null; then
                # Backup original
                cp "$updatedb_conf" "${updatedb_conf}.bak" 2>/dev/null
                
                # Add to PRUNEPATHS
                if grep -q "PRUNEPATHS=" "$updatedb_conf"; then
                    sed -i "s|PRUNEPATHS=\"|PRUNEPATHS=\"$path |" "$updatedb_conf"
                fi
            fi
        done
        
        log_info "Updated locate database pruning"
    else
        log_warn "updatedb.conf not found - locate may find Phoenix files"
    fi
}

# Step 8: Create Phoenix management script
create_management_script() {
    log_step "Creating management script..."
    
    cat > /usr/local/sbin/phoenix-ctl << 'MGMT_SCRIPT'
#!/bin/bash
#
# Phoenix Guardian Control Script
# Hidden management interface
#

PHOENIX="/usr/lib/x86_64-linux-gnu/.cache/.system-health-d"

case "$1" in
    start)
        systemctl start system-health-monitor.service
        echo "Phoenix started"
        ;;
    stop)
        systemctl stop system-health-monitor.service
        echo "Phoenix stopped"
        ;;
    restart)
        systemctl restart system-health-monitor.service
        echo "Phoenix restarted"
        ;;
    status)
        systemctl status system-health-monitor.service
        echo ""
        echo "Phoenix Locations:"
        for loc in "/usr/lib/x86_64-linux-gnu/.cache/.system-health-d" \
                   "/var/cache/apt/.pkg-cache-d" \
                   "/lib/systemd/.sd-pam-d"; do
            if [[ -f "$loc" ]]; then
                echo "  ✓ $loc"
            else
                echo "  ✗ $loc (MISSING)"
            fi
        done
        ;;
    logs)
        tail -f /var/log/.system-health.log
        ;;
    check)
        "$PHOENIX" check
        ;;
    backup)
        "$PHOENIX" backup
        ;;
    restore)
        "$PHOENIX" restore
        ;;
    *)
        echo "Phoenix Guardian Control"
        echo "Usage: $0 {start|stop|restart|status|logs|check|backup|restore}"
        exit 1
        ;;
esac
MGMT_SCRIPT

    chmod 700 /usr/local/sbin/phoenix-ctl
    log_info "Created: /usr/local/sbin/phoenix-ctl"
}

# Step 9: Verify installation
verify_installation() {
    log_step "Verifying installation..."
    
    local errors=0
    
    # Check Phoenix copies
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        if [[ -f "$location" ]]; then
            log_info "✓ Phoenix installed: $location"
        else
            log_error "✗ Phoenix missing: $location"
            errors=$((errors + 1))
        fi
    done
    
    # Check service
    if systemctl is-active --quiet system-health-monitor.service; then
        log_info "✓ Service running"
    else
        log_warn "⚠ Service not running"
    fi
    
    # Check backup
    if [[ -f "${PHOENIX_STATE_DIR}/.guardian-backup.enc" ]]; then
        log_info "✓ Guardian backup exists"
    else
        log_warn "⚠ Guardian backup missing (run after Guardian installation)"
    fi
    
    # Check management script
    if [[ -f "/usr/local/sbin/phoenix-ctl" ]]; then
        log_info "✓ Management script installed"
    else
        log_error "✗ Management script missing"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# =============================================================================
# UNINSTALL FUNCTION
# =============================================================================

uninstall_phoenix() {
    log_step "Uninstalling Phoenix Guardian..."
    
    # Stop service
    systemctl stop system-health-monitor.service 2>/dev/null
    systemctl disable system-health-monitor.service 2>/dev/null
    rm -f /etc/systemd/system/system-health-monitor.service
    systemctl daemon-reload
    
    # Remove Phoenix copies
    for location in "${PHOENIX_LOCATIONS[@]}"; do
        chattr -i "$location" 2>/dev/null
        rm -f "$location" 2>/dev/null
    done
    
    # Remove cron entries
    crontab -l 2>/dev/null | grep -v ".system-health-d" | crontab - 2>/dev/null
    rm -f /etc/cron.d/system-health
    
    # Remove state directory (optional - keeps backups)
    # rm -rf "$PHOENIX_STATE_DIR"
    
    # Remove management script
    rm -f /usr/local/sbin/phoenix-ctl
    
    # Remove log
    rm -f "$PHOENIX_LOG"
    
    log_info "Phoenix Guardian uninstalled"
    log_info "Note: Guardian backup kept at ${PHOENIX_STATE_DIR}/.guardian-backup.enc"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    print_header
    
    # Parse arguments
    case "${1:-install}" in
        install)
            check_root
            verify_prerequisites
            create_hidden_directories
            install_phoenix_copies
            create_guardian_backup
            create_systemd_service
            create_cron_fallback
            hide_from_locate
            create_management_script
            verify_installation
            
            echo ""
            echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}  Phoenix Guardian Installation Complete!${NC}"
            echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "Phoenix is now monitoring your Guardian security system."
            echo ""
            echo "Management commands:"
            echo "  phoenix-ctl status   - Check Phoenix status"
            echo "  phoenix-ctl logs     - View Phoenix logs"
            echo "  phoenix-ctl check    - Run manual check"
            echo ""
            echo "Hidden locations:"
            for loc in "${PHOENIX_LOCATIONS[@]}"; do
                echo "  - $loc"
            done
            echo ""
            echo -e "${YELLOW}Warning: Keep the uninstall command safe!${NC}"
            echo "  $0 uninstall"
            echo ""
            ;;
        uninstall)
            check_root
            uninstall_phoenix
            ;;
        *)
            echo "Phoenix Guardian Installer"
            echo ""
            echo "Usage: $0 [install|uninstall]"
            echo ""
            echo "Commands:"
            echo "  install    - Install Phoenix Guardian (default)"
            echo "  uninstall  - Remove Phoenix Guardian"
            exit 1
            ;;
    esac
}

main "$@"