#!/bin/bash

# Script to verify security tasks on VPS servers
# Usage: ./verify-security-tasks.sh [frontend|backend]

set -e

SERVER_TYPE="${1:-both}"
REPORT_FILE="security-verification-$(date +%Y%m%d_%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$REPORT_FILE"
}

check_header() {
    echo "" | tee -a "$REPORT_FILE"
    echo "========================================" | tee -a "$REPORT_FILE"
    echo "$1" | tee -a "$REPORT_FILE"
    echo "========================================" | tee -a "$REPORT_FILE"
}

check_rootkit_detection() {
    check_header "ROOTKIT DETECTION VERIFICATION"
    
    # Check if rkhunter is installed
    if command -v rkhunter &> /dev/null; then
        log "✓ rkhunter is installed"
        rkhunter --version | head -1 | tee -a "$REPORT_FILE"
    else
        log "✗ rkhunter is NOT installed"
    fi
    
    # Check if chkrootkit is installed
    if command -v chkrootkit &> /dev/null; then
        log "✓ chkrootkit is installed"
        chkrootkit -V 2>&1 | head -1 | tee -a "$REPORT_FILE"
    else
        log "✗ chkrootkit is NOT installed"
    fi
    
    # Check rkhunter cron job
    if [ -f /etc/cron.daily/rkhunter-scan ]; then
        log "✓ rkhunter daily scan cron job exists"
        ls -lh /etc/cron.daily/rkhunter-scan | tee -a "$REPORT_FILE"
    else
        log "✗ rkhunter daily scan cron job NOT found"
    fi
    
    # Check chkrootkit cron job
    if [ -f /etc/cron.weekly/chkrootkit-scan ]; then
        log "✓ chkrootkit weekly scan cron job exists"
        ls -lh /etc/cron.weekly/chkrootkit-scan | tee -a "$REPORT_FILE"
    else
        log "✗ chkrootkit weekly scan cron job NOT found"
    fi
    
    # Check log files
    if [ -f /var/log/rkhunter.log ]; then
        log "✓ rkhunter log file exists"
        log "Last scan: $(tail -20 /var/log/rkhunter.log | grep -i "scan" | tail -1 || echo 'No scans found')"
    else
        log "✗ rkhunter log file NOT found"
    fi
    
    if [ -f /var/log/chkrootkit.log ]; then
        log "✓ chkrootkit log file exists"
        log "Last scan: $(tail -20 /var/log/chkrootkit.log | grep -i "scan" | tail -1 || echo 'No scans found')"
    else
        log "✗ chkrootkit log file NOT found"
    fi
}

check_unattended_upgrades() {
    check_header "UNATTENDED UPGRADES VERIFICATION"
    
    # Check if unattended-upgrades is installed
    if dpkg -l | grep -q unattended-upgrades; then
        log "✓ unattended-upgrades is installed"
        dpkg -l | grep unattended-upgrades | tee -a "$REPORT_FILE"
    else
        log "✗ unattended-upgrades is NOT installed"
    fi
    
    # Check configuration files
    if [ -f /etc/apt/apt.conf.d/50unattended-upgrades ]; then
        log "✓ Main configuration file exists"
        log "Configuration preview:"
        head -20 /etc/apt/apt.conf.d/50unattended-upgrades | tee -a "$REPORT_FILE"
    else
        log "✗ Main configuration file NOT found"
    fi
    
    if [ -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
        log "✓ Auto-upgrades schedule file exists"
        cat /etc/apt/apt.conf.d/20auto-upgrades | tee -a "$REPORT_FILE"
    else
        log "✗ Auto-upgrades schedule file NOT found"
    fi
    
    # Check service status
    if systemctl is-enabled unattended-upgrades &> /dev/null; then
        log "✓ unattended-upgrades service is enabled"
    else
        log "✗ unattended-upgrades service is NOT enabled"
    fi
    
    if systemctl is-active unattended-upgrades &> /dev/null; then
        log "✓ unattended-upgrades service is running"
    else
        log "✗ unattended-upgrades service is NOT running"
    fi
    
    # Check logs
    if [ -f /var/log/unattended-upgrades/unattended-upgrades.log ]; then
        log "✓ Unattended upgrades log exists"
        log "Recent activity:"
        tail -10 /var/log/unattended-upgrades/unattended-upgrades.log | tee -a "$REPORT_FILE"
    else
        log "✗ Unattended upgrades log NOT found"
    fi
}

check_encrypted_backups() {
    check_header "ENCRYPTED BACKUPS VERIFICATION"
    
    # Check required tools
    if command -v gpg &> /dev/null; then
        log "✓ gnupg2 is installed"
    else
        log "✗ gnupg2 is NOT installed"
    fi
    
    if command -v restic &> /dev/null; then
        log "✓ restic is installed"
        restic version | tee -a "$REPORT_FILE"
    else
        log "✗ restic is NOT installed"
    fi
    
    if command -v rclone &> /dev/null; then
        log "✓ rclone is installed"
        rclone version | head -1 | tee -a "$REPORT_FILE"
    else
        log "✗ rclone is NOT installed"
    fi
    
    if command -v pigz &> /dev/null; then
        log "✓ pigz is installed"
    else
        log "✗ pigz is NOT installed"
    fi
    
    # Check backup directories
    if [ -d /var/backups/maasiso ]; then
        log "✓ Backup directory exists"
        ls -lh /var/backups/maasiso/ | tee -a "$REPORT_FILE"
        
        # Check subdirectories
        for subdir in daily weekly monthly encrypted; do
            if [ -d "/var/backups/maasiso/$subdir" ]; then
                log "  ✓ $subdir directory exists"
                file_count=$(ls -1 /var/backups/maasiso/$subdir 2>/dev/null | wc -l)
                log "    Files: $file_count"
            else
                log "  ✗ $subdir directory NOT found"
            fi
        done
    else
        log "✗ Backup directory NOT found"
    fi
    
    # Check encryption key
    if [ -f /root/.backup-encryption-key ]; then
        log "✓ Encryption key exists"
        ls -lh /root/.backup-encryption-key | tee -a "$REPORT_FILE"
    else
        log "✗ Encryption key NOT found"
    fi
    
    # Check backup script
    if [ -f /usr/local/bin/backup-maasiso ]; then
        log "✓ Backup script exists"
        ls -lh /usr/local/bin/backup-maasiso | tee -a "$REPORT_FILE"
    else
        log "✗ Backup script NOT found"
    fi
    
    # Check cron job
    if [ -f /etc/cron.d/maasiso-backup ]; then
        log "✓ Backup cron job exists"
        cat /etc/cron.d/maasiso-backup | tee -a "$REPORT_FILE"
    else
        log "✗ Backup cron job NOT found"
    fi
    
    # Check backup logs
    if [ -d /var/log/backups ]; then
        log "✓ Backup log directory exists"
        log "Recent backup logs:"
        ls -lht /var/log/backups/ | head -5 | tee -a "$REPORT_FILE"
    else
        log "✗ Backup log directory NOT found"
    fi
}

check_nginx_hardening() {
    check_header "NGINX HARDENING VERIFICATION"
    
    # Check if nginx is installed
    if command -v nginx &> /dev/null; then
        log "✓ nginx is installed"
        nginx -v 2>&1 | tee -a "$REPORT_FILE"
    else
        log "✗ nginx is NOT installed"
        return
    fi
    
    # Check if nginx is running
    if systemctl is-active nginx &> /dev/null; then
        log "✓ nginx is running"
    else
        log "✗ nginx is NOT running"
    fi
    
    # Check nginx configuration for security headers
    log "Checking nginx configuration for security headers..."
    
    if nginx -T 2>/dev/null | grep -q "add_header X-Frame-Options"; then
        log "✓ X-Frame-Options header configured"
    else
        log "✗ X-Frame-Options header NOT found"
    fi
    
    if nginx -T 2>/dev/null | grep -q "add_header X-Content-Type-Options"; then
        log "✓ X-Content-Type-Options header configured"
    else
        log "✗ X-Content-Type-Options header NOT found"
    fi
    
    if nginx -T 2>/dev/null | grep -q "add_header X-XSS-Protection"; then
        log "✓ X-XSS-Protection header configured"
    else
        log "✗ X-XSS-Protection header NOT found"
    fi
    
    if nginx -T 2>/dev/null | grep -q "add_header Strict-Transport-Security"; then
        log "✓ HSTS header configured"
    else
        log "✗ HSTS header NOT found"
    fi
    
    # Check SSL configuration
    if nginx -T 2>/dev/null | grep -q "ssl_protocols"; then
        log "✓ SSL protocols configured"
        nginx -T 2>/dev/null | grep "ssl_protocols" | head -1 | tee -a "$REPORT_FILE"
    else
        log "✗ SSL protocols NOT configured"
    fi
    
    if nginx -T 2>/dev/null | grep -q "ssl_ciphers"; then
        log "✓ SSL ciphers configured"
    else
        log "✗ SSL ciphers NOT configured"
    fi
    
    # Check if server tokens are hidden
    if nginx -T 2>/dev/null | grep -q "server_tokens off"; then
        log "✓ Server tokens are hidden"
    else
        log "✗ Server tokens are NOT hidden"
    fi
    
    # Check listening ports
    log "Nginx listening on:"
    ss -tlnp | grep nginx | tee -a "$REPORT_FILE" || log "No nginx ports found"
}

generate_summary() {
    check_header "SUMMARY"
    
    log "Verification completed at: $(date)"
    log "Full report saved to: $REPORT_FILE"
    log ""
    log "Next steps:"
    log "1. Review the report above"
    log "2. For any missing components (marked with ✗), run the corresponding installation script"
    log "3. Verify that all services are running correctly"
    log ""
    log "Installation scripts location: scripts/security/"
    log "- 06-install-rootkit-detection.sh"
    log "- 09-setup-unattended-upgrades.sh"
    log "- 15-encrypted-backups.sh"
    log "- 07-harden-nginx.sh"
}

# Main execution
main() {
    log "Starting security verification on $(hostname)"
    log "Server type: $SERVER_TYPE"
    log "User: $(whoami)"
    log ""
    
    check_rootkit_detection
    check_unattended_upgrades
    check_encrypted_backups
    check_nginx_hardening
    generate_summary
    
    echo ""
    echo "Report saved to: $REPORT_FILE"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "This script should be run as root for complete verification"
    echo "Some checks may fail without root privileges"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

main