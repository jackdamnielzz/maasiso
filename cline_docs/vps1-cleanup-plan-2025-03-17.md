# VPS1 Server Cleanup Plan
Date: March 17, 2025

## Overview

This document outlines a plan to clean up the VPS1 server (153.92.223.23) while preserving the essential Strapi build. The server currently has a total disk usage of approximately 12GB, with several areas that can be cleaned up to free space.

## Essential Components to Preserve

### Strapi Application Core
The following components are essential for the Strapi application to function and must be preserved:

1. `/var/www/strapi/dist` (14MB) - Compiled application
2. `/var/www/strapi/public` (1.4MB) - Public assets
3. `/var/www/strapi/src` (1020KB) - Source code
4. `/var/www/strapi/config` (20KB) - Configuration files
5. `/var/www/strapi/database` (8.0KB) - Database files
6. `/var/www/strapi/.strapi` (24KB) - Strapi internal files
7. `/var/www/strapi/.env` - Environment variables with database connection details
8. `/var/www/strapi/package.json` - Package information
9. `/var/www/strapi/package-lock.json` - Dependency lock file
10. `/var/www/strapi/tsconfig.json` - TypeScript configuration

### Database
The PostgreSQL database is essential and must be preserved:
- `/var/lib/postgresql/14/main` (76MB)

### PM2 Configuration
The PM2 process manager configuration for running Strapi should be preserved, but not the logs.

## Components That Can Be Cleaned Up

### High-Priority Cleanup (Largest Space Savings)

1. **PM2 Logs** (2.5GB)
   - `/root/.pm2/logs/maasiso-error.log` (2.0GB)
   - `/root/.pm2/logs/maasiso-out.log` (559MB)
   - `/root/.pm2/logs/strapi-out.log` (18MB)
   - `/root/.pm2/logs/strapi-error.log` (2.0MB)
   - Other smaller log files

2. **NPM Cache** (979MB)
   - `/root/.npm/*`

3. **Node Modules** (1.2GB)
   - `/var/www/strapi/node_modules/*`
   - These can be reinstalled with `npm install` if needed

### Medium-Priority Cleanup

1. **Next.js Application** (904MB) if it's not needed on this server
   - `/var/www/html/*`
   - Note: This should only be removed if the Next.js application is not needed on VPS1

2. **Backup Configurations**
   - `/var/www/strapi/config.bak` (84KB)
   - `/var/www/strapi/backup_config` (4.0KB)

3. **Git Repository**
   - `/var/www/strapi/.git` (748KB)
   - Only if version control is not needed locally

### Low-Priority Cleanup

1. **System Logs**
   - `/var/log/*` (405MB)
   - Consider implementing log rotation instead of complete removal

2. **APT Cache**
   - `/var/lib/apt/lists` (219MB)
   - Can be cleaned with `apt clean`

3. **Snap Packages**
   - `/var/lib/snapd` (352MB)
   - Remove unnecessary snap packages

## Cleanup Commands

Here are the commands to safely clean up the server while preserving the essential Strapi build:

### 1. Backup Essential Components First

```bash
# Create a backup directory
mkdir -p /backups/strapi-essential-$(date +%Y%m%d)

# Backup essential Strapi files
cp -r /var/www/strapi/dist /var/www/strapi/public /var/www/strapi/src /var/www/strapi/config /var/www/strapi/database /var/www/strapi/.strapi /var/www/strapi/.env /var/www/strapi/package.json /var/www/strapi/package-lock.json /var/www/strapi/tsconfig.json /backups/strapi-essential-$(date +%Y%m%d)/

# Backup PostgreSQL database
pg_dump -U strapi strapi_db > /backups/strapi-essential-$(date +%Y%m%d)/strapi_db_backup.sql
```

### 2. Clean PM2 Logs

```bash
# Stop PM2 processes
pm2 stop all

# Clear PM2 logs
pm2 flush

# Restart PM2 processes
pm2 start all
```

### 3. Clean NPM Cache

```bash
# Clean NPM cache
npm cache clean --force
```

### 4. Remove Node Modules (can be reinstalled)

```bash
# Remove node_modules directory
rm -rf /var/www/strapi/node_modules

# Optionally reinstall dependencies
cd /var/www/strapi
npm install --production
```

### 5. Clean System Packages and Caches

```bash
# Clean APT cache
apt clean
apt autoremove -y

# Remove unnecessary snap packages (be careful with this)
# First list snap packages
snap list
# Then remove unnecessary ones
# snap remove [package-name]
```

### 6. Implement Log Rotation for PM2

Create a log rotation configuration for PM2 to prevent logs from growing too large in the future:

```bash
# Install pm2-logrotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 5
pm2 set pm2-logrotate:compress true
```

## Verification Steps

After cleanup, perform these verification steps to ensure the Strapi application is still functioning correctly:

1. Check if Strapi is running:
   ```bash
   pm2 status
   ```

2. Verify Strapi API is accessible:
   ```bash
   curl http://localhost:1337/api/healthcheck
   ```

3. Check database connection:
   ```bash
   cd /var/www/strapi
   NODE_ENV=production node -e "const { createConnection } = require('@strapi/database'); createConnection({ client: 'postgres', connection: { host: process.env.DATABASE_HOST, port: process.env.DATABASE_PORT, database: process.env.DATABASE_NAME, user: process.env.DATABASE_USERNAME, password: process.env.DATABASE_PASSWORD } }).then(() => { console.log('Database connection successful'); process.exit(0); }).catch(err => { console.error('Database connection failed:', err); process.exit(1); });"
   ```

4. Verify disk space has been freed:
   ```bash
   df -h
   du -h --max-depth=1 /
   ```

## Potential Issues and Mitigations

1. **Strapi fails to start after node_modules removal**
   - Solution: Reinstall dependencies with `npm install --production`

2. **Database connection issues**
   - Solution: Verify database credentials in `.env` file and ensure PostgreSQL is running

3. **PM2 configuration lost**
   - Solution: Reconfigure PM2 with `pm2 start npm --name "strapi" -- run start`

4. **Permission issues after cleanup**
   - Solution: Ensure proper ownership with `chown -R root:root /var/www/strapi`

## Future Maintenance Recommendations

1. **Regular Log Rotation**
   - Ensure PM2 log rotation is working properly
   - Consider implementing system-wide log rotation

2. **Database Maintenance**
   - Regularly backup the PostgreSQL database
   - Consider implementing database optimization tasks

3. **Disk Space Monitoring**
   - Set up monitoring for disk space usage
   - Create alerts when disk space exceeds 80% usage

4. **Regular Cleanup Schedule**
   - Implement a monthly cleanup schedule for temporary files and caches