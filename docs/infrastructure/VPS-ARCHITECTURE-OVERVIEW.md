# MaasISO VPS Infrastructure - Comprehensive Architecture Overview

**Last Updated**: 2025-12-10  
**Author**: System Administrator  
**Version**: 1.0  
**Status**: Complete Server Exploration

---

## Executive Summary

The MaasISO infrastructure consists of two Hostinger VPS servers running Ubuntu 22.04 LTS, providing a frontend/backend separation architecture for the maasiso.nl website and Strapi CMS.

| Server | Role | IP Address | Domain |
|--------|------|------------|--------|
| VPS 1 | Frontend | 147.93.62.188 | maasiso.nl |
| VPS 2 | Backend | 153.92.223.23 | strapicms.maasiso.cloud |

---

## Table of Contents

1. [VPS 1: Frontend Server](#vps-1-frontend-server-maasisonl-website)
2. [VPS 2: Backend Server](#vps-2-backend-server-strapi-cms)
3. [Architecture Diagram](#architecture-diagram)
4. [Comparison Summary](#comparison-summary)
5. [Security Concerns](#security-concerns-identified)
6. [Quick Reference](#quick-reference)

---

## VPS 1: Frontend Server (MaasISO.nl Website)

### Server Identity

| Property | Value |
|----------|-------|
| **Hostname** | srv718842 |
| **IP Address** | 147.93.62.188 |
| **FQDN** | srv718842.hstgr.cloud |
| **Domain** | maasiso.nl |
| **SSH Access** | `ssh root@maasiso.nl` |
| **Provider** | Hostinger VPS |
| **Expires** | 2026-01-07 |

### Hardware Specifications

| Component | Details |
|-----------|---------|
| **CPU** | AMD EPYC 9354P (2 cores, 1 thread/core) |
| **Architecture** | x86_64 |
| **RAM** | 7.8 GB total, ~4.6 GB available |
| **Disk** | 97 GB total, 77 GB available (21% used) |
| **Hypervisor** | KVM |
| **BogoMIPS** | 6499.99 |

### Operating System

| Property | Value |
|----------|-------|
| **OS** | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| **Kernel** | 5.15.0-163-generic |
| **Architecture** | x86_64 |

### Network Configuration

| Interface | IP Address | Type |
|-----------|------------|------|
| lo | 127.0.0.1/8 | Loopback |
| eth0 | 147.93.62.188/24 | IPv4 |
| eth0 | 2a02:4780:41:d836::1/48 | IPv6 Global |
| eth0 | fe80::be24:11ff:fe63:b20d/64 | IPv6 Link-local |

#### Hosts File Configuration
```
127.0.0.1       localhost
127.0.1.1       ubuntu-22.localhost     ubuntu-22
127.0.1.1       srv718842.hstgr.cloud   srv718842
127.0.1.1       frontend.maasiso.cloud  frontend
```

### Listening Ports

| Port | Protocol | Service | Process |
|------|----------|---------|---------|
| 22 | TCP | SSH | sshd |
| 25 | TCP | SMTP | Postfix master |
| 53 | TCP | DNS | systemd-resolve (localhost only) |
| 80 | TCP/TCP6 | HTTP | nginx |
| 443 | TCP/TCP6 | HTTPS | nginx |
| 3000 | TCP | Next.js Frontend | next-server |
| 3001 | TCP6 | ISO Selector | next-server |
| 65529 | TCP | Monarx Agent | monarx-agent (localhost only) |

### Running Services (27 total)

#### Core Services
| Service | Description | Status |
|---------|-------------|--------|
| nginx.service | High performance web server | ✅ Active |
| pm2-root.service | PM2 process manager | ✅ Active |
| ssh.service | OpenBSD Secure Shell server | ✅ Active |
| postfix@-.service | Postfix Mail Transport Agent | ✅ Active |

#### Security Services
| Service | Description | Status |
|---------|-------------|--------|
| clamav-freshclam.service | ClamAV virus database updater | ✅ Active |
| fail2ban.service | Fail2Ban Service | ✅ Active |
| monarx-agent.service | Monarx Agent - Security Scanner | ✅ Active |
| unattended-upgrades.service | Unattended Upgrades Shutdown | ✅ Active |

#### System Services
| Service | Description | Status |
|---------|-------------|--------|
| cron.service | Regular background program processing | ✅ Active |
| dbus.service | D-Bus System Message Bus | ✅ Active |
| irqbalance.service | irqbalance daemon | ✅ Active |
| multipathd.service | Device-Mapper Multipath Device Controller | ✅ Active |
| networkd-dispatcher.service | Dispatcher daemon for systemd-networkd | ✅ Active |
| packagekit.service | PackageKit Daemon | ✅ Active |
| polkit.service | Authorization Manager | ✅ Active |
| qemu-guest-agent.service | QEMU Guest Agent | ✅ Active |
| rsyslog.service | System Logging Service | ✅ Active |
| snapd.service | Snap Daemon | ✅ Active |
| systemd-journald.service | Journal Service | ✅ Active |
| systemd-logind.service | User Login Management | ✅ Active |
| systemd-networkd.service | Network Configuration | ✅ Active |
| systemd-resolved.service | Network Name Resolution | ✅ Active |
| systemd-timesyncd.service | Network Time Synchronization | ✅ Active |
| systemd-udevd.service | Rule-based Manager for Device Events | ✅ Active |

### PM2 Applications

| ID | Name | Mode | Status | CPU | Memory | Uptime |
|----|------|------|--------|-----|--------|--------|
| 1 | frontend | fork | online | 0% | 172.8 MB | 14h |
| 0 | iso-selector | cluster | online | 0% | 57.6 MB | 14h |

### Installed Software

#### Key Packages
| Package | Version | Description |
|---------|---------|-------------|
| nginx | 1.18.0-6ubuntu14.7 | Web/proxy server |
| nginx-core | 1.18.0-6ubuntu14.7 | nginx standard version |
| nodejs | 20.19.0-1nodesource1 | Node.js runtime |
| certbot | 1.21.0-1build1 | Let's Encrypt client |
| python3 | 3.10.6-1~22.04.1 | Python interpreter |
| python3.10 | 3.10.12-1~22.04.12 | Python 3.10 |

#### nginx Modules
- libnginx-mod-http-geoip2
- libnginx-mod-http-image-filter
- libnginx-mod-http-xslt-filter
- libnginx-mod-mail
- libnginx-mod-stream
- libnginx-mod-stream-geoip2

#### Security Packages
- monarx-protect (5.1.86-master)
- monarx-protect-autodetect (5.1.86-master)
- python3-certbot (1.21.0-1build1)
- python3-certbot-nginx (1.21.0-1)

### SSL Certificates

| Certificate Name | Domains | Expiry | Status | Days Left |
|------------------|---------|--------|--------|-----------|
| maasiso.nl | maasiso.nl, www.maasiso.nl | 2026-03-07 20:13:22 UTC | ✅ Valid | 87 days |
| iso-selector.maasiso.nl | iso-selector.maasiso.nl | 2026-02-21 00:08:43 UTC | ✅ Valid | 72 days |

Certificate Paths:
- **maasiso.nl**: `/etc/letsencrypt/live/maasiso.nl/`
- **iso-selector**: `/etc/letsencrypt/live/iso-selector.maasiso.nl/`

### Nginx Configuration

```nginx
# MaasISO Frontend - Clean Configuration

server {
    listen 80;
    listen [::]:80;
    server_name maasiso.nl www.maasiso.nl;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name maasiso.nl www.maasiso.nl;

    # SSL Configuration (using Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/maasiso.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maasiso.nl/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Proxy to Next.js on port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

### Security Configuration

| Control | Status | Details |
|---------|--------|---------|
| UFW Firewall | ⚠️ Inactive | Status: inactive |
| Fail2ban | ✅ Active | 1 jail: sshd |
| SSH Root Login | ⚠️ PermitRootLogin yes | Should be prohibit-password |
| Monarx Agent | ✅ Active | Security scanning |
| ClamAV | ✅ Active | Antivirus protection |

### Cron Jobs

#### Root Crontab
```cron
*/5 * * * * /root/security_monitor.sh
@reboot /etc/de/./cX86  # ⚠️ SUSPICIOUS - INVESTIGATE
```

#### System Crontab (/etc/crontab)
```cron
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

### Application Directories

| Path | Purpose | Owner |
|------|---------|-------|
| /var/www/frontend | Next.js main site | www-data |
| /var/www/iso-selector | ISO selector tool | root |
| /var/www/maasiso.nl | Legacy/backup site | root |
| /var/www/html | Default nginx root | root |
| /var/www/backups | Backup storage | root |

#### Directory Listing: /var/www/
```
drwxr-xr-x  2 root     root         4096 Apr  9  2025 backups
drwxr-xr-x 22 www-data www-data     4096 Jul 14 21:38 frontend
drwxr-xr-x  2 root     root         4096 Mar 17  2025 html
drwxr-xr-x  7 root     root         4096 Dec 10 02:07 iso-selector
drwxr-xr-x  6 root     root         4096 May 26  2025 iso-selector-backup-
drwxr-xr-x  3 root     root         4096 May 26  2025 iso-selector_backup_20250526_142706
drwxr-xr-x  3 root     root         4096 Mar 16  2025 maasiso.nl
```

### User Accounts

| User | Home Directory | Purpose |
|------|----------------|---------|
| root | /root | System administrator |
| ubuntu | /home/ubuntu | Default system user |

---

## VPS 2: Backend Server (Strapi CMS)

### Server Identity

| Property | Value |
|----------|-------|
| **Hostname** | strapicms |
| **IP Address** | 153.92.223.23 |
| **FQDN** | strapicms.maasiso.cloud |
| **Domain** | strapicms.maasiso.cloud |
| **SSH Access** | `ssh root@153.92.223.23` |
| **Provider** | Hostinger VPS |
| **Expires** | ⚠️ **2025-12-17 (7 days - URGENT!)** |

### Hardware Specifications

| Component | Details |
|-----------|---------|
| **CPU** | AMD EPYC 7543P (4 cores, 1 thread/core) |
| **Architecture** | x86_64 |
| **RAM** | 15 GB total, ~14 GB available |
| **Disk** | 194 GB total, 186 GB available (5% used) |
| **Hypervisor** | KVM |
| **Virtualization** | AMD-V |
| **BogoMIPS** | 5589.49 |

### Operating System

| Property | Value |
|----------|-------|
| **OS** | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| **Kernel** | 5.15.0-163-generic |
| **Architecture** | x86_64 |

### Network Configuration

| Interface | IP Address | Type |
|-----------|------------|------|
| lo | 127.0.0.1/8 | Loopback |
| eth0 | 153.92.223.23/23 | IPv4 |
| eth0 | 2a02:4780:d:4c28::1/48 | IPv6 Global |
| eth0 | fe80::be24:11ff:fe49:a935/64 | IPv6 Link-local |

#### Hosts File Configuration
```
127.0.0.1       localhost
127.0.1.1       ubuntu-22.localhost     ubuntu-22
127.0.1.1       srv692111.hstgr.cloud   srv692111
127.0.1.1       strapicms.maasiso.cloud strapicms
```

### Listening Ports

| Port | Protocol | Service | Process |
|------|----------|---------|---------|
| 22 | TCP/TCP6 | SSH | sshd |
| 25 | TCP/TCP6 | SMTP | Postfix master |
| 53 | TCP | DNS | systemd-resolve (localhost only) |
| 80 | TCP/TCP6 | HTTP | nginx |
| 1337 | TCP | Strapi API | node |
| 5432 | TCP/TCP6 | PostgreSQL | postgres |
| 65529 | TCP | Monarx Agent | monarx-agent (localhost only) |

### Running Services (27 total)

#### Core Services
| Service | Description | Status |
|---------|-------------|--------|
| nginx.service | High performance web server | ✅ Active |
| pm2-root.service | PM2 process manager | ✅ Active |
| postgresql@14-main.service | PostgreSQL Cluster 14-main | ✅ Active |
| ssh.service | OpenBSD Secure Shell server | ✅ Active |
| postfix@-.service | Postfix Mail Transport Agent | ✅ Active |

#### Security Services
| Service | Description | Status |
|---------|-------------|--------|
| clamav-freshclam.service | ClamAV virus database updater | ✅ Active |
| fail2ban.service | Fail2Ban Service | ✅ Active |
| monarx-agent.service | Monarx Agent - Security Scanner | ✅ Active |
| unattended-upgrades.service | Unattended Upgrades Shutdown | ✅ Active |

#### System Services
Same as Frontend (cron, dbus, irqbalance, multipathd, networkd-dispatcher, packagekit, polkit, qemu-guest-agent, rsyslog, snapd, systemd-*)

### PM2 Applications

| ID | Name | Mode | Status | CPU | Memory | Uptime |
|----|------|------|--------|-----|--------|--------|
| 1 | strapi | fork | online | 0% | 249.3 MB | 35h |

#### PM2 Modules
| ID | Module | Version | Status | Memory |
|----|--------|---------|--------|--------|
| 0 | pm2-logrotate | 2.7.0 | online | 70.1 MB |

### Installed Software

#### Key Packages
| Package | Version | Description |
|---------|---------|-------------|
| nginx-core | 1.18.0-6ubuntu14.7 | nginx web/proxy server |
| nodejs | 20.19.0-1nodesource1 | Node.js runtime |
| postgresql-14 | 14.20-0ubuntu0.22.04.1 | PostgreSQL database |
| postgresql-client-14 | 14.20-0ubuntu0.22.04.1 | PostgreSQL client |
| postgresql-contrib | 14+238 | PostgreSQL additional facilities |
| python3 | 3.10.6-1~22.04.1 | Python interpreter |
| mysql-common | 5.8+1.0.8 | MySQL common files (library only) |

#### nginx Modules
- libnginx-mod-http-geoip2
- libnginx-mod-http-image-filter
- libnginx-mod-http-xslt-filter
- libnginx-mod-mail
- libnginx-mod-stream
- libnginx-mod-stream-geoip2

#### Security Packages
- monarx-protect (5.1.86-master)
- monarx-protect-autodetect (5.1.86-master)

### Database Configuration

#### PostgreSQL
| Property | Value |
|----------|-------|
| Version | 14.20 |
| Cluster | 14-main |
| Port | 5432 |
| Status | ✅ Active (since Dec 08 22:00:22 UTC) |
| Data Directory | /var/lib/postgresql/ |

#### Other Databases
| Database | Status |
|----------|--------|
| MySQL | Not installed (library only) |
| MariaDB | Not installed |

### SSL Certificates

⚠️ **No SSL certificates found**

The backend server operates on HTTP only (port 80). This is acceptable for internal API communication but should be considered for security if external access is required.

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name maasiso.nl www.maasiso.nl;

    location /uploads/ {
        limit_except GET OPTIONS {
            deny all;
        }

        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin '*';
            add_header Access-Control-Allow-Methods 'GET, OPTIONS';
            add_header Access-Control-Allow-Headers '*';
            add_header Content-Type text/plain;
            add_header Content-Length 0;
            return 204;
        }

        alias /var/www/strapi/public/uploads/;
        autoindex on;
        default_type text/plain;

        add_header Access-Control-Allow-Origin '*';
        add_header Access-Control-Allow-Methods 'GET, OPTIONS';
        add_header Access-Control-Allow-Headers '*';
        add_header Cache-Control 'public, max-age=31536000';
        add_header X-Content-Type-Options 'nosniff';
    }

    location /api/ {
        proxy_pass http://127.0.0.1:1337/;
    }

    location / {
        proxy_pass http://147.93.62.188:3000;
    }
}
```

### Security Configuration

| Control | Status | Details |
|---------|--------|---------|
| UFW Firewall | ⚠️ Inactive | Status: inactive |
| Fail2ban | ✅ Active | 1 jail: sshd |
| SSH Root Login | ✅ PermitRootLogin prohibit-password | Properly configured |
| SSH Password Auth | ⚠️ PasswordAuthentication yes | Should be disabled |
| Monarx Agent | ✅ Active | Security scanning |
| ClamAV | ✅ Active | Antivirus protection |

### Cron Jobs

#### Root Crontab
```cron
0 0 * * 0 journalctl --vacuum-time=7d
5 8,14,20 * * * /usr/local/bin/server_status_report.sh > /dev/null 2>&1
```

#### System Crontab (/etc/crontab)
```cron
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

### Application Directories

| Path | Purpose | Owner |
|------|---------|-------|
| /var/www/strapi | Strapi CMS application | root |
| /var/www/html | Default nginx root | root |

#### Directory Listing: /var/www/
```
drwxr-xr-x  2 root root 4096 Aug 26 06:17 html
drwxr-xr-x 11 root root 4096 Dec  8 22:00 strapi
```

### User Accounts

| User | Home Directory | Purpose |
|------|----------------|---------|
| root | /root | System administrator |
| maasadmin | /home/maasadmin | Admin user account |
| ubuntu | /home/ubuntu | Default system user |

---

## Architecture Diagram

```
                           ┌─────────────────────────────────────────────┐
                           │              INTERNET                       │
                           │         (maasiso.nl visitors)               │
                           └──────────────────┬──────────────────────────┘
                                              │
                                              │ HTTPS (443)
                                              ▼
         ┌────────────────────────────────────────────────────────────────┐
         │                    VPS 1: FRONTEND                             │
         │                    147.93.62.188                               │
         │                    maasiso.nl                                  │
         │  ┌──────────────────────────────────────────────────────────┐  │
         │  │                     NGINX                                 │  │
         │  │                   :80 / :443                              │  │
         │  │  - SSL Termination (Let's Encrypt)                       │  │
         │  │  - HTTP → HTTPS redirect                                 │  │
         │  │  - Security headers                                      │  │
         │  └──────────────────────┬───────────────────────────────────┘  │
         │                         │                                      │
         │          ┌──────────────┴──────────────┐                       │
         │          │                             │                       │
         │          ▼                             ▼                       │
         │  ┌───────────────┐            ┌───────────────┐                │
         │  │   Next.js     │            │ ISO Selector  │                │
         │  │   Frontend    │            │    Tool       │                │
         │  │    :3000      │            │    :3001      │                │
         │  │  (PM2 fork)   │            │ (PM2 cluster) │                │
         │  └───────────────┘            └───────────────┘                │
         │                                                                │
         │  Security: ClamAV, Fail2ban, Monarx, Security Monitor         │
         └────────────────────────────────┬───────────────────────────────┘
                                          │
                                          │ HTTP (80) - API Requests
                                          │ /api/* → :1337
                                          │ /uploads/* → static files
                                          ▼
         ┌────────────────────────────────────────────────────────────────┐
         │                    VPS 2: BACKEND                              │
         │                    153.92.223.23                               │
         │                    strapicms.maasiso.cloud                     │
         │  ┌──────────────────────────────────────────────────────────┐  │
         │  │                     NGINX                                 │  │
         │  │                      :80                                  │  │
         │  │  - /api/* → Strapi :1337                                 │  │
         │  │  - /uploads/* → Static files                             │  │
         │  │  - CORS headers                                          │  │
         │  └──────────────────────┬───────────────────────────────────┘  │
         │                         │                                      │
         │          ┌──────────────┴──────────────┐                       │
         │          │                             │                       │
         │          ▼                             ▼                       │
         │  ┌───────────────┐            ┌───────────────┐                │
         │  │   Strapi      │            │  PostgreSQL   │                │
         │  │   CMS API     │◄──────────►│   Database    │                │
         │  │    :1337      │            │    :5432      │                │
         │  │  (PM2 fork)   │            │   (v14.20)    │                │
         │  └───────────────┘            └───────────────┘                │
         │                                                                │
         │  Security: ClamAV, Fail2ban, Monarx, Status Reports           │
         └────────────────────────────────────────────────────────────────┘
```

---

## Comparison Summary

| Aspect | Frontend (VPS 1) | Backend (VPS 2) |
|--------|------------------|-----------------|
| **Hostname** | srv718842 | strapicms |
| **Primary Role** | Website hosting | CMS & Database |
| **IP Address** | 147.93.62.188 | 153.92.223.23 |
| **Domain** | maasiso.nl | strapicms.maasiso.cloud |
| **CPU Cores** | 2 | 4 |
| **RAM Total** | 7.8 GB | 15 GB |
| **RAM Available** | 4.6 GB | 14 GB |
| **Disk Total** | 97 GB | 194 GB |
| **Disk Used** | 21% | 5% |
| **Main App** | Next.js | Strapi |
| **Database** | None | PostgreSQL 14 |
| **SSL** | ✅ Let's Encrypt | ❌ None (HTTP) |
| **UFW Firewall** | ⚠️ Inactive | ⚠️ Inactive |
| **Fail2ban** | ✅ Active | ✅ Active |
| **SSH Root Login** | ⚠️ yes | ✅ prohibit-password |
| **Password Auth** | Unknown | ⚠️ yes |
| **Expires** | 2026-01-07 | ⚠️ 2025-12-17 |

---

## Security Concerns Identified

### 🔴 Critical

| Issue | Server | Risk | Recommendation |
|-------|--------|------|----------------|
| Backend VPS expires in 7 days | Backend | Service disruption | **Renew immediately** |
| UFW Firewall inactive | Both | Unauthorized access | Enable with proper rules |
| Suspicious cron entry | Frontend | Potential malware | Investigate `/etc/de/./cX86` |

### 🟠 High Priority

| Issue | Server | Risk | Recommendation |
|-------|--------|------|----------------|
| Password authentication enabled | Backend | Brute-force attacks | Set `PasswordAuthentication no` |
| No SSL on Backend | Backend | Data interception | Consider HTTPS for API |
| SSH root login with password | Frontend | Root compromise | Set `PermitRootLogin prohibit-password` |

### 🟡 Medium Priority

| Issue | Server | Risk | Recommendation |
|-------|--------|------|----------------|
| PostgreSQL port externally accessible | Backend | Database exposure | Restrict to localhost if possible |
| Postfix SMTP running | Both | Spam relay | Verify if needed, harden config |
| Multiple user accounts | Both | Access control | Audit and remove unused accounts |

---

## Quick Reference

### SSH Access Commands
```bash
# Frontend Server
ssh root@maasiso.nl
# OR
ssh root@147.93.62.188

# Backend Server
ssh root@153.92.223.23
```

### Service Management
```bash
# Check all services
systemctl list-units --type=service --state=running

# PM2 status
pm2 list
pm2 logs

# Nginx
nginx -t
systemctl status nginx
systemctl restart nginx

# PostgreSQL (Backend only)
systemctl status postgresql
sudo -u postgres psql
```

### Important Paths

#### Frontend Server
| Purpose | Path |
|---------|------|
| Website files | /var/www/frontend |
| ISO Selector | /var/www/iso-selector |
| Nginx config | /etc/nginx/sites-enabled/ |
| SSL certificates | /etc/letsencrypt/live/ |
| PM2 logs | /root/.pm2/logs/ |
| Security monitor | /root/security_monitor.sh |

#### Backend Server
| Purpose | Path |
|---------|------|
| Strapi app | /var/www/strapi |
| Uploads | /var/www/strapi/public/uploads/ |
| Nginx config | /etc/nginx/sites-enabled/ |
| PostgreSQL data | /var/lib/postgresql/ |
| Status reports | /usr/local/bin/server_status_report.sh |

---

## Related Documentation

- [Server Access Guide](../SERVER-ACCESS-GUIDE.md)
- [Backend Access Guide](../../scripts/security/BACKEND-ACCESS-GUIDE.md)
- [Security Incident Report](../../memory-bank/SECURITY-INCIDENT-2025-12-09.md)
- [Active Context](../../memory-bank/activeContext.md)

---

*This document was generated on 2025-12-10 based on live server exploration.*