# VPS Security Verification Guide

## Overview
This guide helps you verify if the following security measures have been implemented on your VPS servers:

1. **Rootkit Detection** (rkhunter + chkrootkit)
2. **Unattended Upgrades** (automatic security updates)
3. **Encrypted Backups**
4. **Nginx Hardening** (mainly for frontend)

## Quick Start

### Option 1: Automated Verification (Recommended)

```bash
# Make the script executable
chmod +x scripts/security/run-verification-on-servers.sh

# Run the verification
./scripts/security/run-verification-on-servers.sh
```

Follow the menu to select which server(s) to verify.

### Option 2: Manual Verification

#### Step 1: Copy the verification script to your server

```bash
# For Frontend
scp scripts/security/verify-security-tasks.sh root@185.212.47.168:/tmp/

# For Backend
scp scripts/security/verify-security-tasks.sh root@185.212.47.169:/tmp/
```

#### Step 2: SSH into the server and run the script

```bash
# Connect to server
ssh root@185.212.47.168  # or 185.212.47.169 for backend

# Run verification
chmod +x /tmp/verify-security-tasks.sh
sudo /tmp/verify-security-tasks.sh
```

#### Step 3: Review the output

The script will generate a detailed report showing:
- ✓ = Task completed successfully
- ✗ = Task NOT completed or missing

## What Each Check Verifies

### 1. Rootkit Detection
- ✓ rkhunter installed
- ✓ chkrootkit installed
- ✓ Daily rkhunter scan cron job
- ✓ Weekly chkrootkit scan cron job
- ✓ Log files exist and contain scan results

**If missing, run:**
```bash
./scripts/security/06-install-rootkit-detection.sh
```

### 2. Unattended Upgrades
- ✓ unattended-upgrades package installed
- ✓ Configuration files present
- ✓ Service enabled and running
- ✓ Automatic security updates configured

**If missing, run:**
```bash
./scripts/security/09-setup-unattended-upgrades.sh
```

### 3. Encrypted Backups
- ✓ Required tools installed (gnupg2, restic, rclone, pigz)
- ✓ Backup directories created
- ✓ Encryption key exists
- ✓ Backup script installed
- ✓ Cron job configured for daily backups

**If missing, run:**
```bash
./scripts/security/15-encrypted-backups.sh
```

### 4. Nginx Hardening (Frontend mainly)
- ✓ Security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)
- ✓ SSL/TLS properly configured
- ✓ Server tokens hidden
- ✓ Strong SSL ciphers enabled

**If missing, run:**
```bash
./scripts/security/07-harden-nginx.sh
```

## Understanding the Results

### Example Output

```
========================================
ROOTKIT DETECTION VERIFICATION
========================================
[2025-12-09 16:00:00] ✓ rkhunter is installed
[2025-12-09 16:00:00] ✓ chkrootkit is installed
[2025-12-09 16:00:00] ✓ rkhunter daily scan cron job exists
[2025-12-09 16:00:00] ✗ chkrootkit weekly scan cron job NOT found
```

In this example:
- rkhunter is properly installed ✓
- chkrootkit is installed but missing the cron job ✗
- Action needed: Re-run the rootkit detection installation script

## Troubleshooting

### Permission Denied
If you get permission errors, make sure you're running as root:
```bash
sudo /tmp/verify-security-tasks.sh
```

### Script Not Found
Make sure you copied the script to the correct location:
```bash
ls -la /tmp/verify-security-tasks.sh
```

### SSH Connection Issues
Verify your SSH configuration:
```bash
ssh -v root@185.212.47.168
```

## Next Steps After Verification

1. **Review the generated report** - Look for any ✗ marks
2. **Run missing installations** - Use the appropriate script for each missing component
3. **Re-verify** - Run the verification script again to confirm
4. **Document results** - Save the report for your records

## Report Location

Reports are saved with timestamps:
- On server: `/tmp/security-verification-YYYYMMDD_HHMMSS.log`
- Locally (if using automated script): `./logs/[server]-security-verification-YYYYMMDD_HHMMSS.log`

## Important Notes

### Backend Nginx Hardening
The nginx hardening script (07-harden-nginx.sh) is primarily for the **frontend server** where nginx serves public traffic on ports 80/443.

If your backend nginx only serves internal traffic (proxied through frontend), nginx hardening is less critical but still recommended.

### Backup Encryption Key
The encryption key at `/root/.backup-encryption-key` is critical for restoring backups. Make sure to:
1. Back it up to a secure location
2. Never commit it to version control
3. Store it separately from the backups themselves

## Server Information

- **Frontend**: 185.212.47.168
- **Backend**: 185.212.47.169
- **SSH User**: root
- **SSH Port**: 22

## Support

If you encounter issues:
1. Check the generated log file for detailed error messages
2. Verify you have root access on the servers
3. Ensure all prerequisites are met (SSH access, proper permissions)
4. Review the individual installation scripts for requirements