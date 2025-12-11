#!/bin/bash
# Simple Backend Security Verification

echo "=========================================="
echo "Backend Server Security Verification"
echo "Server: strapicms.maasiso.cloud"
echo "Date: $(date)"
echo "=========================================="
echo ""

# 1. Rootkit Detection
echo "1. ROOTKIT DETECTION:"
echo "--------------------"
command -v rkhunter && echo "✓ rkhunter installed" || echo "✗ rkhunter NOT installed"
command -v chkrootkit && echo "✓ chkrootkit installed" || echo "✗ chkrootkit NOT installed"
[ -f /etc/cron.daily/rkhunter-scan ] && echo "✓ rkhunter cron exists" || echo "✗ rkhunter cron missing"
[ -f /etc/cron.weekly/chkrootkit-scan ] && echo "✓ chkrootkit cron exists" || echo "✗ chkrootkit cron missing"
echo ""

# 2. Unattended Upgrades
echo "2. UNATTENDED UPGRADES:"
echo "-----------------------"
dpkg -l | grep -q unattended-upgrades && echo "✓ unattended-upgrades installed" || echo "✗ NOT installed"
systemctl is-enabled unattended-upgrades 2>/dev/null && echo "✓ Service enabled" || echo "✗ Not enabled"
systemctl is-active unattended-upgrades 2>/dev/null && echo "✓ Service running" || echo "✗ Not running"
echo ""

# 3. Encrypted Backups
echo "3. ENCRYPTED BACKUPS:"
echo "---------------------"
command -v restic && echo "✓ restic installed" || echo "✗ restic NOT installed"
command -v rclone && echo "✓ rclone installed" || echo "✗ rclone NOT installed"
[ -d /var/backups/maasiso ] && echo "✓ Backup dir exists" || echo "✗ Backup dir missing"
[ -f /root/.backup-encryption-key ] && echo "✓ Encryption key exists" || echo "✗ Key missing"
[ -f /usr/local/bin/backup-maasiso ] && echo "✓ Backup script exists" || echo "✗ Script missing"
echo ""

# 4. Nginx
echo "4. NGINX:"
echo "---------"
command -v nginx && echo "✓ nginx installed" || echo "✗ nginx NOT installed"
systemctl is-active nginx 2>/dev/null && echo "✓ nginx running" || echo "✗ nginx not running"
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="