# Enhanced Security Monitoring Setup Guide

## Overview

This guide provides complete instructions for setting up the enhanced security monitoring system on MaasISO VPS infrastructure following the December 9, 2025 security incident.

**Files included:**
- `security-monitor-config.sh` - Configuration with alert credentials and whitelists
- `20-enhanced-security-monitor.sh` - Main monitoring script

**Servers:**
- Frontend VPS: 147.93.62.188
- Backend VPS: 153.92.223.23

---

## Quick Start

### 1. Deploy Scripts to Server

```bash
# From your local machine, copy scripts to server
scp scripts/security/security-monitor-config.sh root@147.93.62.188:/root/
scp scripts/security/20-enhanced-security-monitor.sh root@147.93.62.188:/root/

# Or for backend
scp scripts/security/security-monitor-config.sh root@153.92.223.23:/root/
scp scripts/security/20-enhanced-security-monitor.sh root@153.92.223.23:/root/
```

### 2. Set Permissions

```bash
# On the server
chmod 700 /root/security-monitor-config.sh
chmod 700 /root/20-enhanced-security-monitor.sh

# Create symlink for easier cron
ln -sf /root/20-enhanced-security-monitor.sh /root/security_monitor.sh
```

### 3. Test in Dry-Run Mode

```bash
/root/security_monitor.sh --dry-run --verbose
```

### 4. Install Cron Jobs

```bash
# Edit crontab
crontab -e

# Add these lines:
# Security monitoring every 5 minutes
*/5 * * * * /root/security_monitor.sh >> /var/log/security-monitor/cron.log 2>&1

# Hourly status report
0 * * * * /root/security_monitor.sh --hourly-report >> /var/log/security-monitor/cron.log 2>&1
```

---

## Detailed Configuration

### Email Setup

The script uses standard Linux mail utilities. Install one of:

```bash
# Option 1: mailutils (recommended for simple setup)
apt-get install mailutils

# Option 2: msmtp (for Gmail/external SMTP)
apt-get install msmtp msmtp-mta
```

#### Configure msmtp for External SMTP

Create `/root/.msmtprc`:

```
account default
host smtp.gmail.com
port 587
auth on
user your-email@gmail.com
password your-app-password
from your-email@gmail.com
tls on
tls_starttls on
```

```bash
chmod 600 /root/.msmtprc
```

### SMS Alerts via Pushover

Pushover (https://pushover.net/) provides reliable push notifications that can also send SMS.

#### Setup Steps:

1. **Create Pushover Account**
   - Go to https://pushover.net/
   - Create account and install app on phone

2. **Create Application**
   - Go to https://pushover.net/apps/build
   - Name: "MaasISO Security Monitor"
   - Type: Script/Application
   - Copy the **API Token/Key**

3. **Get Your User Key**
   - On dashboard, copy your **User Key**

4. **Update Configuration**
   
   Edit `/root/security-monitor-config.sh`:
   ```bash
   PUSHOVER_TOKEN="axxxxxxxxxxxxxxxxxxxxxxxxx"  # Your API Token
   PUSHOVER_USER="uxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Your User Key
   ```

5. **Test**
   ```bash
   curl -s \
     --form-string "token=YOUR_TOKEN" \
     --form-string "user=YOUR_USER" \
     --form-string "message=Test alert from MaasISO" \
     https://api.pushover.net/1/messages.json
   ```

### Slack Integration (Optional)

1. **Create Incoming Webhook**
   - Go to your Slack workspace settings
   - Apps → Incoming Webhooks → Add New Webhook
   - Choose channel for alerts

2. **Update Configuration**
   ```bash
   SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL_HERE"
   ```

---

## Configure Known-Good Hashes

After verifying your server is clean, record the nginx config hashes:

### Frontend Server

```bash
# SSH to frontend
ssh root@147.93.62.188

# Get hash of nginx config
sha256sum /etc/nginx/nginx.conf
# Example output: abc123def456... /etc/nginx/nginx.conf

# Also hash sites-enabled if applicable
sha256sum /etc/nginx/sites-enabled/*
```

Update `security-monitor-config.sh`:
```bash
FRONTEND_NGINX_HASH="abc123def456789..."
```

### Backend Server

```bash
# SSH to backend
ssh root@153.92.223.23

# Get hash
sha256sum /etc/nginx/nginx.conf
```

Update:
```bash
BACKEND_NGINX_HASH="xyz789abc123..."
```

**Important:** Update these hashes any time you legitimately modify nginx configuration!

---

## Alert Types & Recipients

| Alert Type | Recipients | Delivery Method |
|------------|------------|-----------------|
| CRITICAL | niels.maas@maasiso.nl, niels_maas@hotmail.com | Email + SMS + Slack |
| WARNING | niels.maas@maasiso.nl, niels_maas@hotmail.com | Email + Slack |
| INFO | Log file only | Local logging |
| HOURLY_REPORT | niels.maas@maasiso.nl | Email only |

### Critical Alerts Trigger On:
- Reinfection detected (malware directories found)
- Nginx config tampered
- Unauthorized SSH keys
- C2 connections detected
- Crypto miner processes
- Malicious cron jobs
- Suspicious systemd services

### Warning Alerts Trigger On:
- High CPU processes (>80%)
- Recently created systemd services
- Unusual files in system directories

---

## Testing Procedures

### 1. Dry-Run Test (No Alerts Sent)

```bash
/root/security_monitor.sh --dry-run --verbose
```

This will:
- Run all checks
- Print what alerts WOULD be sent
- Not actually send any emails/SMS

### 2. Test Individual Alert Channels

```bash
# Test email
echo "Test email body" | mail -s "Test Alert" niels.maas@maasiso.nl

# Test Pushover (SMS)
curl -s \
  --form-string "token=$PUSHOVER_TOKEN" \
  --form-string "user=$PUSHOVER_USER" \
  --form-string "message=Test SMS from security monitor" \
  https://api.pushover.net/1/messages.json

# Test Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test alert from security monitor"}' \
  "$SLACK_WEBHOOK"
```

### 3. Simulate Detection (Careful!)

```bash
# Create test malware directory (will trigger CRITICAL)
mkdir /root/.sshds-test

# Run monitor
/root/security_monitor.sh --verbose

# Clean up
rmdir /root/.sshds-test
```

### 4. Test Hourly Report

```bash
/root/security_monitor.sh --hourly-report --verbose
```

---

## Cron Schedule

### Recommended Setup

```cron
# Security monitoring every 5 minutes
*/5 * * * * /root/security_monitor.sh >> /var/log/security-monitor/cron.log 2>&1

# Hourly status report at minute 0
0 * * * * /root/security_monitor.sh --hourly-report >> /var/log/security-monitor/cron.log 2>&1
```

### Verify Cron is Running

```bash
# Check cron status
systemctl status cron

# View cron logs
grep CRON /var/log/syslog | tail -20

# Check our log
tail -f /var/log/security-monitor/cron.log
```

---

## Log Files

| Log File | Purpose |
|----------|---------|
| `/var/log/security-monitor/monitor.log` | Main activity log |
| `/var/log/security-monitor/alerts.log` | Alert history |
| `/var/log/security-monitor/hourly-reports.log` | Hourly report archive |
| `/var/log/security-monitor/cron.log` | Cron execution log |

### Log Rotation

Create `/etc/logrotate.d/security-monitor`:

```
/var/log/security-monitor/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 root root
}
```

---

## Troubleshooting

### Emails Not Sending

1. Check if mail is installed:
   ```bash
   which mail || which sendmail || which msmtp
   ```

2. Test mail directly:
   ```bash
   echo "Test" | mail -s "Test" your@email.com
   ```

3. Check mail logs:
   ```bash
   tail -50 /var/log/mail.log
   ```

### Pushover Not Working

1. Verify tokens are set:
   ```bash
   source /root/security-monitor-config.sh
   echo "Token: $PUSHOVER_TOKEN"
   echo "User: $PUSHOVER_USER"
   ```

2. Test curl connectivity:
   ```bash
   curl -v https://api.pushover.net/1/messages.json
   ```

### Script Not Running from Cron

1. Check cron syntax:
   ```bash
   crontab -l
   ```

2. Check if script is executable:
   ```bash
   ls -la /root/security_monitor.sh
   ```

3. Run manually with full path:
   ```bash
   /bin/bash /root/security_monitor.sh --verbose
   ```

### False Positives

If you get alerts for legitimate items:

1. **For hidden directories**: Add to `ALLOWED_HIDDEN_DIRS` in config
2. **For SSH keys**: Add key comment to appropriate whitelist
3. **For nginx hash changes**: Update `FRONTEND_NGINX_HASH` or `BACKEND_NGINX_HASH`

---

## Security Considerations

1. **Protect the config file**
   ```bash
   chmod 600 /root/security-monitor-config.sh
   chown root:root /root/security-monitor-config.sh
   ```

2. **Don't commit tokens to git**
   - Keep config file server-side only
   - Use placeholder values in repository

3. **Rotate Pushover tokens periodically**
   - Regenerate app token quarterly

4. **Monitor the monitor**
   - Set up external uptime check for hourly reports
   - If you stop receiving hourly reports, investigate!

---

## Checklist

### Per Server Setup

- [ ] Scripts deployed to `/root/`
- [ ] Permissions set (chmod 700)
- [ ] Symlink created (`/root/security_monitor.sh`)
- [ ] Mail utility installed and tested
- [ ] Pushover configured (if using SMS)
- [ ] Slack webhook configured (optional)
- [ ] Known-good nginx hash recorded
- [ ] Dry-run test completed successfully
- [ ] Cron jobs installed
- [ ] Log rotation configured
- [ ] Alert test completed (received email/SMS)

### Frontend (147.93.62.188)
- [ ] All above completed
- [ ] SSH whitelist verified (niels_maas@hotmail.com, #hostinger-managed-key)

### Backend (153.92.223.23)
- [ ] All above completed
- [ ] SSH whitelist verified (niels@PCNiels, maasiso_vps, etc.)

---

## Contact

**Alert Recipients:**
- Primary: niels.maas@maasiso.nl
- Secondary: niels_maas@hotmail.com
- SMS: +31 6 23578344

**Hourly Reports:**
- niels.maas@maasiso.nl only

---

*Document created: December 9, 2025*
*Post-incident security enhancement following cryptominer/redirect attack*