# MaasISO Security Hardening Guide

## Overview

This document provides additional security measures beyond the initial incident response. Based on the December 9, 2025 incident where attackers gained root access to install cryptomining malware and redirect nginx, these measures add defense-in-depth layers.

**Total Scripts Available: 19**

---

## Current Security Status ✅

Already implemented:
- [x] SSH key-only authentication
- [x] UFW firewall (ports 22, 80, 443)
- [x] Fail2ban for brute-force protection
- [x] ClamAV with daily/weekly scans
- [x] Clean nginx configuration

---

## Quick Reference: All Security Scripts

| # | Script | Purpose | Priority |
|---|--------|---------|----------|
| 01 | `01-cleanup-malware.sh` | Remove cryptomining malware | ✅ Done |
| 02 | `02-setup-backend-ssh.sh` | SSH key setup for backend | ✅ Done |
| 03 | `03-fix-backend-nginx.sh` | Fix nginx config errors | ✅ Done |
| 04 | `04-install-clamav.sh` | ClamAV antivirus | ✅ Done |
| 05 | `05-emergency-fix-redirect.sh` | Fix nginx redirects | ✅ Done |
| 06 | `06-install-rootkit-detection.sh` | rkhunter + chkrootkit | 🔴 High |
| 07 | `07-harden-nginx.sh` | Rate limiting, security headers | 🔴 High |
| 08 | `08-install-aide.sh` | File integrity monitoring | 🟡 Medium |
| 09 | `09-setup-unattended-upgrades.sh` | Automatic security updates | 🔴 High |
| 10 | `10-install-crowdsec.sh` | Collaborative IPS | 🟡 Medium |
| 11 | `11-install-modsecurity.sh` | Web Application Firewall | 🟡 Medium |
| 12 | `12-setup-logging.sh` | Centralized logging | 🟡 Medium |
| 13 | `13-kernel-hardening.sh` | Kernel/system hardening | 🟢 Low |
| 14 | `14-advanced-ssh-hardening.sh` | 2FA, advanced SSH | 🟢 Low |
| 15 | `15-encrypted-backups.sh` | 3-2-1 encrypted backups | 🔴 High |
| 16 | `16-data-leak-monitoring.sh` | Credential leak scanning | 🟡 Medium |
| 17 | `17-metadata-stripping.sh` | Remove EXIF/GPS from uploads | 🟡 Medium |
| 18 | `18-database-security.sh` | PostgreSQL/MySQL hardening | 🟡 Medium |
| 19 | `19-cloudflare-setup-guide.md` | Cloudflare DDoS protection | 🟡 Medium |

---

## Additional Security Measures

### 1. 🛡️ Rootkit Detection (HIGH PRIORITY)

ClamAV only detects known malware signatures. Rootkits can hide themselves. Add specialized rootkit scanners.

**Run Script:** `06-install-rootkit-detection.sh`

Tools installed:
- **rkhunter** - Scans for rootkits, backdoors, local exploits
- **chkrootkit** - Alternative rootkit scanner
- Daily automated scans

### 2. 🔒 Nginx Security Hardening (HIGH PRIORITY)

Your current nginx config lacks rate limiting and security headers. Attackers could brute-force or DDoS.

**Run Script:** `07-harden-nginx.sh`

Adds:
- Rate limiting (10 requests/second)
- Connection limiting
- Comprehensive security headers (CSP, HSTS, etc.)
- Hide nginx version
- Block suspicious user agents
- Size limits on uploads

### 3. 📝 File Integrity Monitoring (AIDE)

Detects unauthorized file changes. Would have caught nginx config modifications.

**Run Script:** `08-install-aide.sh`

Features:
- Baseline of all system files
- Daily integrity checks
- Email alerts on changes
- Monitors /etc, /var/www, /usr/bin

### 4. 🔄 Automatic Security Updates

Critical security patches should be applied automatically.

**Run Script:** `09-setup-unattended-upgrades.sh`

Configures:
- Automatic security updates
- Email notifications
- Automatic reboot for kernel updates (optional)
- Daily update checks

### 5. 🛡️ CrowdSec - Collaborative IPS

Modern, community-driven intrusion prevention. Superior to fail2ban.

**Run Script:** `10-install-crowdsec.sh`

Features:
- Community blocklists
- Real-time threat sharing
- Nginx bouncer for blocking
- Dashboard for monitoring

### 6. 🔐 ModSecurity Web Application Firewall

Blocks SQL injection, XSS, and other web attacks at nginx level.

**Run Script:** `11-install-modsecurity.sh`

Protects against:
- SQL Injection
- Cross-Site Scripting (XSS)
- Path traversal
- Remote file inclusion
- OWASP Top 10 attacks

### 7. 📊 Centralized Logging & Monitoring

Better visibility into what's happening on servers.

**Run Script:** `12-setup-logging.sh`

Includes:
- Logwatch for daily email summaries
- GoAccess for real-time nginx monitoring
- Structured logging
- Log rotation configuration

### 8. 🔒 Kernel & System Hardening

Restrict system capabilities to limit attack surface.

**Run Script:** `13-kernel-hardening.sh`

Hardens:
- Disable unused kernel modules
- Restrict core dumps
- Enable ASLR
- Protect symlinks
- Restrict dmesg access

### 9. 🌐 Cloudflare Protection (Recommended)

Free CDN with built-in WAF, DDoS protection, and SSL.

**No script needed - DNS configuration**

Benefits:
- Hide origin server IP
- DDoS protection
- Free SSL
- Web Application Firewall
- Bot protection
- Page rules for security

### 10. 🔑 SSH Further Hardening

Additional SSH restrictions beyond current config.

**Run Script:** `14-advanced-ssh-hardening.sh`

Adds:
- 2FA with Google Authenticator
- SSH session timeouts
- Restrict SSH to specific IPs
- Port knocking (optional)

---

## Priority Implementation Order

### Phase 1 - Immediate (Today)
1. ✅ `06-install-rootkit-detection.sh`
2. ✅ `07-harden-nginx.sh`
3. ✅ `09-setup-unattended-upgrades.sh`

### Phase 2 - This Week
4. `08-install-aide.sh`
5. `10-install-crowdsec.sh`
6. `12-setup-logging.sh`

### Phase 3 - This Month
7. `11-install-modsecurity.sh`
8. `13-kernel-hardening.sh`
9. `14-advanced-ssh-hardening.sh`
10. Cloudflare setup

---

## Quick Security Checklist

Run these commands regularly:

```bash
# Check for rootkits
sudo rkhunter --check

# Full malware scan
sudo clamscan-maasiso full

# Check for failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20

# Check listening ports
sudo ss -tulpn

# Check running services
sudo systemctl list-units --type=service --state=running

# Check for unauthorized SSH keys
cat ~/.ssh/authorized_keys

# Check system integrity
sudo aide --check

# View recent security logs
sudo tail -100 /var/log/auth.log
```

---

## Monitoring Dashboard

After setup, access:
- **CrowdSec Dashboard:** https://app.crowdsec.net
- **GoAccess Report:** /var/www/html/goaccess/index.html
- **Logwatch Reports:** Email daily

---

## Emergency Response Plan

If compromised again:

1. **Isolate:** Disconnect from network if possible
2. **Document:** Save logs before changes
3. **Run cleanup:** `sudo bash 01-cleanup-malware.sh`
4. **Check integrity:** `sudo aide --check`
5. **Rootkit scan:** `sudo rkhunter --check`
6. **ClamAV scan:** `sudo clamscan-maasiso full`
7. **Review logs:** `/var/log/auth.log`, `/var/log/nginx/`
8. **Reset credentials:** All passwords, API tokens, SSH keys
9. **Report:** Document in `/memory-bank/SECURITY-INCIDENT-*.md`

---

## Contact for Security Issues

If you suspect a breach:
1. Check logs immediately
2. Run all security scans
3. Consider professional incident response
4. Report to hosting provider if needed

---

*Document created: December 9, 2025*
*Last updated: December 9, 2025*