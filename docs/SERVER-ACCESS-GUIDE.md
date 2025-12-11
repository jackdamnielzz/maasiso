# Server Access Guide - MaasISO VPS Infrastructure

**Last Updated**: 2025-12-09  
**Author**: System Administrator  
**Version**: 1.0

---

## 🚀 Quick Start - SSH Access

### Frontend Server (MaasISO.nl Website)
```bash
ssh root@maasiso.nl
```

### Backend Server (Strapi CMS)
```bash
ssh root@153.92.223.23
```

---

## 📋 Server Details

### Frontend Server

| Property | Value |
|----------|-------|
| **SSH Command** | `ssh root@maasiso.nl` |
| **IP Address** | 147.93.62.188 |
| **Hostname** | srv718842 |
| **FQDN** | srv718842.hstgr.cloud |
| **Domain** | maasiso.nl |
| **Provider** | Hostinger VPS |
| **OS** | Ubuntu 22.04 LTS |
| **SSH Port** | 22 (default) |
| **Expires** | 2026-01-07 |
| **Purpose** | Next.js frontend, nginx reverse proxy |

### Backend Server

| Property | Value |
|----------|-------|
| **SSH Command** | `ssh root@153.92.223.23` |
| **IP Address** | 153.92.223.23 |
| **Hostname** | strapicms |
| **FQDN** | strapicms.maasiso.cloud |
| **Domain** | strapicms.maasiso.cloud |
| **Provider** | Hostinger VPS |
| **OS** | Ubuntu 22.04 LTS |
| **SSH Port** | 22 (default) |
| **Expires** | 2025-12-17 ⚠️ |
| **Purpose** | Strapi CMS, PostgreSQL database |

---

## 🔑 SSH Key Configuration

### Local Machine (Windows)

| Property | Value |
|----------|-------|
| **Private Key** | `C:\Users\niels\.ssh\id_rsa` |
| **Public Key** | `C:\Users\niels\.ssh\id_rsa.pub` |
| **Key Type** | RSA 4096-bit |
| **Created** | 2025-12-09 |

### On Servers

Both servers have the public key installed at:
```
/root/.ssh/authorized_keys
```

### Authentication Method
- ✅ **SSH key authentication** (enabled)
- ❌ **Password authentication** (disabled for security)

---

## 🌐 Hostinger VPS Panel Access

### Web Console (Backup Access Method)

If SSH is not working, you can access the servers via the Hostinger web console:

1. **Go to**: https://hpanel.hostinger.com
2. **Login** with your Hostinger credentials
3. **Navigate to**: VPS section
4. **Select** the server you want to access:
   - Frontend: srv718842
   - Backend: strapicms
5. **Click**: "Browser terminal" or "Console"
6. **Login** as root when prompted

### Hostinger Panel Features
- Browser-based terminal (no SSH required)
- Server restart/stop/start controls
- Resource monitoring (CPU, RAM, disk)
- Firewall settings (UFW management)
- Backup management
- DNS settings

---

## 🔧 SSH Configuration File

For easier access, add this to your SSH config file:

**Location**: `C:\Users\niels\.ssh\config` (Windows) or `~/.ssh/config` (Linux/Mac)

```ssh-config
# MaasISO Frontend Server
Host maasiso-frontend
    HostName maasiso.nl
    User root
    IdentityFile ~/.ssh/id_rsa
    Port 22

# MaasISO Backend Server (Strapi)
Host maasiso-backend
    HostName 153.92.223.23
    User root
    IdentityFile ~/.ssh/id_rsa
    Port 22
```

After adding this config, you can connect with:
```bash
ssh maasiso-frontend
ssh maasiso-backend
```

---

## 🛠️ Troubleshooting

### SSH Connection Refused

**Symptom**: `Connection refused` error

**Solutions**:
1. **Check if SSH is running on server** (via Hostinger Console):
   ```bash
   systemctl status sshd
   systemctl start sshd
   ```

2. **Check firewall** (via Hostinger Console):
   ```bash
   ufw status
   ufw allow 22/tcp
   ```

3. **Verify server is running** in Hostinger Panel

### SSH Permission Denied

**Symptom**: `Permission denied (publickey)` error

**Solutions**:
1. **Verify SSH key exists locally**:
   ```powershell
   # Windows PowerShell
   Test-Path $env:USERPROFILE\.ssh\id_rsa
   ```

2. **Check key permissions** (Linux/Mac):
   ```bash
   chmod 600 ~/.ssh/id_rsa
   chmod 644 ~/.ssh/id_rsa.pub
   ```

3. **Re-add public key to server** (via Hostinger Console):
   ```bash
   # Get your public key
   cat /path/to/id_rsa.pub
   
   # Add to server
   echo "YOUR_PUBLIC_KEY_HERE" >> /root/.ssh/authorized_keys
   ```

### SSH Connection Timeout

**Symptom**: Connection hangs or times out

**Solutions**:
1. **Check server IP is correct**
2. **Verify server is online** in Hostinger Panel
3. **Check your internet connection**
4. **Try with verbose mode**:
   ```bash
   ssh -vvv root@maasiso.nl
   ```

### Host Key Verification Failed

**Symptom**: `Host key verification failed` or `REMOTE HOST IDENTIFICATION HAS CHANGED`

**Solution**: Remove old host key and reconnect:
```powershell
# Windows PowerShell
ssh-keygen -R maasiso.nl
ssh-keygen -R 147.93.62.188
ssh-keygen -R 153.92.223.23
```

Then reconnect - you'll be prompted to accept the new host key.

---

## 📁 Important Server Paths

### Frontend Server (maasiso.nl)

| Purpose | Path |
|---------|------|
| Website files | `/var/www/maasiso.nl` |
| Nginx config | `/etc/nginx/sites-available/maasiso.nl` |
| SSL certificates | `/etc/letsencrypt/live/maasiso.nl/` |
| Nginx logs | `/var/log/nginx/` |
| PM2 logs | `/root/.pm2/logs/` |
| Backup encryption key | `/root/.backup-encryption-key` |
| Encrypted backups | `/var/backups/encrypted/` |

### Backend Server (strapicms)

| Purpose | Path |
|---------|------|
| Strapi application | `/var/www/strapi` or `/root/strapi` |
| Nginx config | `/etc/nginx/sites-available/strapicms` |
| SSL certificates | `/etc/letsencrypt/live/strapicms.maasiso.cloud/` |
| PostgreSQL data | `/var/lib/postgresql/` |
| Strapi logs | Application directory + PM2 logs |
| Backup encryption key | `/root/.backup-encryption-key` |

---

## 🔐 Security Notes

### SSH Security Measures
- ✅ Key-based authentication only (password disabled)
- ✅ Root login allowed via key only
- ✅ Fail2ban installed (blocks brute force attempts)
- ✅ UFW firewall configured

### Important Security Reminders
1. **Never share your private SSH key** (`id_rsa`)
2. **Keep encryption keys secure** (stored in `logs/` directory locally)
3. **Monitor SSH logs** for unauthorized access attempts:
   ```bash
   tail -f /var/log/auth.log
   ```

---

## 📞 Emergency Contacts

### If You Cannot Access Servers

1. **Use Hostinger Web Console** (see above)
2. **Contact Hostinger Support**:
   - Live chat: https://www.hostinger.com/contact
   - Help center: https://support.hostinger.com

### Critical Dates

| Server | Expiration | Action Required |
|--------|------------|-----------------|
| Frontend | 2026-01-07 | Renewal reminder set |
| Backend | **2025-12-17** | ⚠️ **Renew ASAP!** |

---

## 📝 Quick Commands Reference

### Server Status Checks
```bash
# Check system uptime
uptime

# Check disk space
df -h

# Check memory usage
free -m

# Check running services
systemctl list-units --type=service --state=running

# Check nginx status
systemctl status nginx

# Check PM2 processes
pm2 list

# Check recent security events
tail -100 /var/log/auth.log
```

### Service Management
```bash
# Restart nginx
systemctl restart nginx

# Restart PM2 application
pm2 restart all

# View application logs
pm2 logs

# Check SSL certificate expiry
certbot certificates
```

---

## 📚 Related Documentation

- [`memory-bank/activeContext.md`](../memory-bank/activeContext.md) - Current status and quick reference
- [`memory-bank/progress.md`](../memory-bank/progress.md) - Project milestones
- [`memory-bank/SECURITY-INCIDENT-2025-12-09.md`](../memory-bank/SECURITY-INCIDENT-2025-12-09.md) - Security incident report
- [`scripts/security/`](../scripts/security/) - Security scripts and guides

---

*This document was created on 2025-12-09 after successfully configuring SSH key authentication for both VPS servers.*