# Quick Commands for VPS Security Verification

## 🚀 Fastest Method (Copy-Paste Ready)

### Frontend Server (185.212.47.168)

```bash
# Connect and verify in one command
ssh root@185.212.47.168 'bash -s' < scripts/security/verify-security-tasks.sh
```

### Backend Server (185.212.47.169)

```bash
# Connect and verify in one command
ssh root@185.212.47.169 'bash -s' < scripts/security/verify-security-tasks.sh
```

---

## 📋 Manual Step-by-Step

### Frontend Server

```bash
# 1. Copy script to server
scp scripts/security/verify-security-tasks.sh root@185.212.47.168:/tmp/

# 2. Connect to server
ssh root@185.212.47.168

# 3. Run verification (on server)
chmod +x /tmp/verify-security-tasks.sh
sudo /tmp/verify-security-tasks.sh

# 4. View report (on server)
cat /tmp/security-verification-*.log
```

### Backend Server

```bash
# 1. Copy script to server
scp scripts/security/verify-security-tasks.sh root@185.212.47.169:/tmp/

# 2. Connect to server
ssh root@185.212.47.169

# 3. Run verification (on server)
chmod +x /tmp/verify-security-tasks.sh
sudo /tmp/verify-security-tasks.sh

# 4. View report (on server)
cat /tmp/security-verification-*.log
```

---

## 🔧 If Tasks Are Missing - Installation Commands

### Rootkit Detection Missing

```bash
# Frontend
ssh root@185.212.47.168 'bash -s' < scripts/security/06-install-rootkit-detection.sh

# Backend
ssh root@185.212.47.169 'bash -s' < scripts/security/06-install-rootkit-detection.sh
```

### Unattended Upgrades Missing

```bash
# Frontend
ssh root@185.212.47.168 'bash -s' < scripts/security/09-setup-unattended-upgrades.sh

# Backend
ssh root@185.212.47.169 'bash -s' < scripts/security/09-setup-unattended-upgrades.sh
```

### Encrypted Backups Missing

```bash
# Frontend
ssh root@185.212.47.168 'bash -s' < scripts/security/15-encrypted-backups.sh

# Backend
ssh root@185.212.47.169 'bash -s' < scripts/security/15-encrypted-backups.sh
```

### Nginx Hardening Missing (Frontend Only)

```bash
# Frontend only (public-facing nginx)
ssh root@185.212.47.168 'bash -s' < scripts/security/07-harden-nginx.sh
```

---

## 📊 Quick Status Checks

### Check if Rootkit Detection is Running

```bash
# Frontend
ssh root@185.212.47.168 "command -v rkhunter && command -v chkrootkit && ls -la /etc/cron.daily/rkhunter-scan /etc/cron.weekly/chkrootkit-scan"

# Backend
ssh root@185.212.47.169 "command -v rkhunter && command -v chkrootkit && ls -la /etc/cron.daily/rkhunter-scan /etc/cron.weekly/chkrootkit-scan"
```

### Check if Unattended Upgrades is Active

```bash
# Frontend
ssh root@185.212.47.168 "systemctl status unattended-upgrades && cat /etc/apt/apt.conf.d/20auto-upgrades"

# Backend
ssh root@185.212.47.169 "systemctl status unattended-upgrades && cat /etc/apt/apt.conf.d/20auto-upgrades"
```

### Check if Backups are Configured

```bash
# Frontend
ssh root@185.212.47.168 "ls -lh /var/backups/maasiso/ && cat /etc/cron.d/maasiso-backup"

# Backend
ssh root@185.212.47.169 "ls -lh /var/backups/maasiso/ && cat /etc/cron.d/maasiso-backup"
```

### Check Nginx Security Headers (Frontend)

```bash
# Frontend
ssh root@185.212.47.168 "nginx -T 2>/dev/null | grep -E 'add_header (X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)'"
```

---

## 🔍 View Recent Logs

### Rootkit Scan Logs

```bash
# Frontend
ssh root@185.212.47.168 "tail -50 /var/log/rkhunter.log"

# Backend
ssh root@185.212.47.169 "tail -50 /var/log/rkhunter.log"
```

### Backup Logs

```bash
# Frontend
ssh root@185.212.47.168 "ls -lht /var/log/backups/ | head -10"

# Backend
ssh root@185.212.47.169 "ls -lht /var/log/backups/ | head -10"
```

### Unattended Upgrades Logs

```bash
# Frontend
ssh root@185.212.47.168 "tail -50 /var/log/unattended-upgrades/unattended-upgrades.log"

# Backend
ssh root@185.212.47.169 "tail -50 /var/log/unattended-upgrades/unattended-upgrades.log"
```

---

## 🆘 Emergency Commands

### Force Immediate Rootkit Scan

```bash
# Frontend
ssh root@185.212.47.168 "sudo rkhunter --check --skip-keypress --report-warnings-only"

# Backend
ssh root@185.212.47.169 "sudo rkhunter --check --skip-keypress --report-warnings-only"
```

### Force Immediate Backup

```bash
# Frontend
ssh root@185.212.47.168 "sudo /usr/local/bin/backup-maasiso full"

# Backend
ssh root@185.212.47.169 "sudo /usr/local/bin/backup-maasiso full"
```

### Test Unattended Upgrades

```bash
# Frontend
ssh root@185.212.47.168 "sudo unattended-upgrade --dry-run --debug"

# Backend
ssh root@185.212.47.169 "sudo unattended-upgrade --dry-run --debug"
```

---

## 📝 Notes

- All commands assume you have SSH key authentication set up
- Replace `root` with your actual SSH user if different
- Commands use default SSH port 22
- For custom SSH ports, add `-p PORT_NUMBER` to ssh/scp commands
- Always review script contents before running on production servers