# MaasISO Frontend Deployment System

## Overview

This document details the automated deployment system for the MaasISO frontend application to VPS2 (147.93.62.188) using GitHub Actions.

## System Components

### 1. GitHub Actions Workflow
- Located in `.github/workflows/deploy.yml`
- Triggers on:
  * Push to main branch
  * Manual workflow dispatch
- Handles:
  * Testing
  * Building
  * Deployment
  * Health verification
  * Automatic rollback on failure

### 2. SSH Key Authentication
- Uses ED25519 key pair for secure authentication
- Keys managed through GitHub Secrets:
  * VPS2_SSH_PRIVATE_KEY
  * VPS2_KNOWN_HOSTS
- Setup script: `scripts/setup-ssh.ps1`

### 3. Health Monitoring
- Endpoint: `/api/health`
- Monitoring script: `scripts/monitor-health.ps1`
- Metrics tracked:
  * Memory usage
  * CPU load
  * Application uptime
  * Node.js metrics
- Alert thresholds configurable

### 4. Backup System
- Script: `scripts/backup-site.ps1`
- Features:
  * Timestamped backups
  * Integrity verification
  * Automatic rotation
  * Latest backup symlink
- Default retention: 5 backups

## Setup Instructions

### 1. Initial Setup

1. Generate SSH keys:
```powershell
.\scripts\setup-ssh.ps1
```

2. Add GitHub Secrets:
- VPS2_SSH_PRIVATE_KEY: Private key from setup script
- VPS2_KNOWN_HOSTS: Known hosts entry from setup script

3. Configure VPS2:
- Add public key to /root/.ssh/authorized_keys
- Ensure PM2 is installed globally
- Create deployment directory with correct permissions

### 2. Monitoring Setup

1. Start monitoring service:
```powershell
.\scripts\monitor-health.ps1 -IntervalSeconds 300
```

2. Configure alert thresholds:
- Memory threshold: 85%
- CPU load threshold: 4.0
- Custom thresholds can be set via parameters

### 3. Backup Configuration

1. Initialize backup system:
```powershell
.\scripts\backup-site.ps1 -KeepBackups 5
```

2. Verify backup location permissions
3. Test backup integrity
4. Confirm backup rotation

## Deployment Process

### Standard Deployment

1. Push changes to main branch
2. GitHub Actions automatically:
   - Runs tests
   - Builds application
   - Creates backup
   - Deploys to VPS2
   - Verifies health
   - Handles any necessary rollbacks

### Manual Deployment

1. Go to GitHub Actions
2. Select "Deploy to VPS2" workflow
3. Click "Run workflow"
4. Monitor deployment progress

## Monitoring

### Health Checks

- Endpoint: http://147.93.62.188/api/health
- Frequency: Every 5 minutes
- Metrics available:
  * System status
  * Memory usage
  * CPU load
  * Uptime
  * Node.js info

### Alerts

Alerts are triggered for:
- High memory usage (>85%)
- High CPU load (>4.0)
- Application restarts
- Failed health checks
- Deployment failures

## Rollback Procedures

### Automatic Rollback

Occurs when:
- Deployment fails
- Health check fails post-deployment
- PM2 service fails to start

Process:
1. Latest backup is restored
2. Dependencies reinstalled
3. Service restarted
4. Health verified

### Manual Rollback

To manually rollback:

1. SSH into VPS2
2. Navigate to backup directory
3. Choose backup to restore
4. Run restore procedure:
```bash
cd /var/www/backups
cp -r frontend_backup_[timestamp]/* /var/www/jouw-frontend-website/
cd /var/www/jouw-frontend-website
npm ci --production
pm2 restart frontend
```

## Troubleshooting

### Common Issues

1. Deployment Failures
- Check GitHub Actions logs
- Verify SSH key authentication
- Check disk space on VPS2
- Verify PM2 status

2. Health Check Failures
- Check application logs
- Verify memory usage
- Check CPU load
- Verify network connectivity

3. Backup Issues
- Check disk space
- Verify file permissions
- Check backup integrity
- Confirm backup rotation

### Recovery Steps

1. Service Not Starting
```bash
pm2 logs frontend
pm2 delete frontend
pm2 start npm --name "frontend" -- start
```

2. Corrupted Deployment
```bash
cd /var/www/jouw-frontend-website
git reset --hard
npm ci
npm run build
pm2 restart frontend
```

3. Failed Health Checks
```bash
pm2 logs frontend
tail -f /var/log/nginx/error.log
```

## Maintenance

### Regular Tasks

1. Weekly
- Review monitoring logs
- Check backup integrity
- Verify alert system
- Clean old logs

2. Monthly
- Rotate SSH keys
- Update dependencies
- Review performance metrics
- Test rollback procedures

3. Quarterly
- Full system backup
- Security audit
- Performance optimization
- Documentation update

### Best Practices

1. Deployment
- Always test locally before deployment
- Monitor deployment logs
- Verify health post-deployment
- Keep backup before major changes

2. Security
- Rotate SSH keys regularly
- Monitor access logs
- Keep dependencies updated
- Review security alerts

3. Performance
- Monitor resource usage
- Optimize build size
- Clean old assets
- Review caching strategy