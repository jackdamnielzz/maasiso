# VPS1 Server Disk Usage Analysis
Date: March 17, 2025

## Overview

This document provides an analysis of the disk usage on the VPS1 server (153.92.223.23) based on the data collected during our investigation. The server hosts the Strapi CMS for the MaasISO project.

## Current Disk Usage

### Overall Disk Usage
- Total disk size: 194GB
- Used space: 11GB (6%)
- Available space: 183GB (94%)

### Top-Level Directory Usage
- `/root`: 4.2GB
- `/var`: 3.5GB
- `/usr`: 3.2GB
- `/snap`: 995MB
- `/boot`: 109MB
- `/etc`: 12MB
- Other directories with smaller usage

### Detailed Breakdown

#### /root Directory (4.2GB)
- `/root/.pm2`: 3.3GB
- `/root/.npm`: 979MB
- Other smaller directories (< 100MB combined)

#### /root/.pm2 Directory (3.3GB)
- `/root/.pm2/logs`: 2.5GB
- Other PM2 files: 0.8GB

#### /root/.pm2/logs Directory (2.5GB)
- `maasiso-error.log`: 2.0GB
- `maasiso-out.log`: 559MB
- `strapi-out.log`: 18MB
- `strapi-error.log`: 2.0MB
- Other smaller log files

#### /var Directory (3.5GB)
- `/var/www`: 2.1GB
- `/var/lib`: 703MB
- `/var/log`: 415MB
- `/var/cache`: 240MB
- Other smaller directories

#### /var/www Directory (2.1GB)
- `/var/www/strapi`: 1.3GB
- `/var/www/html`: 904MB

## Connection Issues

During the analysis, we encountered SSH connection issues with the VPS1 server. The server was responding to ping requests (ICMP) but not accepting SSH connections on port 22. This could indicate:

1. The SSH service is not running on the server
2. A firewall is blocking SSH connections
3. The server is under high load or experiencing issues

We were able to gather partial disk usage information before the connection was lost, but could not complete a full analysis of all directories.

## Cleanup Recommendations

Based on the data collected and the cleanup plan in `vps1-cleanup-plan-2025-03-17.md`, the following cleanup actions are recommended once SSH access is restored:

### High Priority (4.7GB potential savings)
1. **Clear PM2 logs** (2.5GB)
   ```bash
   pm2 flush
   ```

2. **Clean NPM cache** (979MB)
   ```bash
   npm cache clean --force
   ```

3. **Remove node_modules in Strapi** (estimated 1.2GB)
   ```bash
   rm -rf /var/www/strapi/node_modules
   ```

### Medium Priority (1.5GB potential savings)
1. **Consider removing the Next.js application** if not needed (904MB)
   ```bash
   rm -rf /var/www/html
   ```

2. **Clean system logs** (415MB)
   ```bash
   # Rotate and compress logs
   logrotate -f /etc/logrotate.conf
   ```

3. **Clean APT cache** (estimated 200MB)
   ```bash
   apt clean
   apt autoremove -y
   ```

### Future Prevention
1. **Implement PM2 log rotation**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 5
   pm2 set pm2-logrotate:compress true
   ```

2. **Set up system log rotation**
   ```bash
   # Ensure logrotate is configured properly
   nano /etc/logrotate.d/rsyslog
   ```

## Next Steps

1. **Resolve SSH Connection Issues**
   - Check if the SSH service is running on the server
   - Verify firewall settings
   - Ensure the server is operational

2. **Complete Disk Usage Analysis**
   - Once SSH access is restored, examine the Strapi directory structure in detail
   - Check PostgreSQL database size and growth

3. **Implement Cleanup Plan**
   - Follow the backup steps in the cleanup plan before removing any files
   - Execute cleanup commands in order of priority
   - Verify system functionality after each cleanup step

## Conclusion

The VPS1 server currently has plenty of free space (183GB available), so this is not an urgent situation. However, implementing the cleanup recommendations would improve system maintenance and prevent potential issues in the future.

The largest consumers of disk space are:
1. PM2 logs (2.5GB)
2. NPM cache (979MB)
3. Strapi node_modules (estimated 1.2GB)
4. Next.js application (904MB)
5. System logs (415MB)

These areas should be the focus of cleanup efforts once SSH access is restored.