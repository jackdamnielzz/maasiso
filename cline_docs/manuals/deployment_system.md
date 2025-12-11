# Deployment System Documentation

## Overview

This document describes the automated deployment system for the Maasiso website. The system uses GitHub Actions for continuous deployment to VPS2 (147.93.62.188) with PM2 process management.

## Components

### 1. GitHub Actions Workflow
- Triggered on:
  - Push to main branch
  - Manual workflow dispatch
- Features:
  - Build caching for faster deployments
  - Automated backup creation
  - Health check verification
  - Slack notifications
  - Automatic rollback on failure

### 2. PM2 Process Management
- Cluster mode for better performance
- Auto-restart on failure
- Memory limit: 1GB per instance
- Log rotation enabled
- Performance monitoring
- Resource usage tracking

### 3. Health Check System
- Endpoint: `/api/health`
- Monitors:
  - System resources (CPU, memory, disk)
  - External service connectivity
  - Response times
  - Process metrics
  - Node.js runtime stats

## Deployment Process

### Normal Deployment Flow
1. Code pushed to main branch
2. GitHub Actions workflow triggered
3. Build with cached dependencies
4. Backup of current deployment created
5. New code deployed to VPS2
6. PM2 service restarted
7. Health check verification
8. Slack notification sent

### Rollback Procedure
Automatic rollback occurs if:
- Deployment fails
- Health check fails
- PM2 restart fails

Manual rollback steps:
1. Access VPS2: `ssh root@147.93.62.188`
2. List backups: `ls -l /root/backups/`
3. Choose backup timestamp
4. Execute: `cd /var/www/jouw-frontend-website && cp -r /root/backups/[TIMESTAMP]/* .`
5. Restart PM2: `pm2 reload ecosystem.config.js`

## Monitoring

### Health Check Endpoint
- URL: `http://147.93.62.188/api/health`
- Response includes:
  - System status
  - Resource usage
  - External service status
  - Performance metrics

### PM2 Monitoring
```bash
# View process list
pm2 list

# Monitor processes
pm2 monit

# View logs
pm2 logs

# View metrics
pm2 show maasiso
```

### Performance Requirements
- Response time: < 500ms
- Uptime: > 99.9%
- Memory usage: < 1GB per instance
- CPU usage: < 80%

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check GitHub Actions logs
   - Verify SSH access
   - Check disk space
   - Review health check response

2. **Performance Issues**
   - Monitor PM2 metrics
   - Check system resources
   - Review application logs
   - Analyze health check data

3. **Rollback Failures**
   - Verify backup existence
   - Check file permissions
   - Review PM2 logs

### Debug Commands
```bash
# Check system resources
htop

# View application logs
pm2 logs maasiso

# Check nginx logs
tail -f /var/log/nginx/error.log

# Verify disk space
df -h

# Test health endpoint
curl http://147.93.62.188/api/health
```

## Maintenance Procedures

### Regular Maintenance
1. Review PM2 logs weekly
2. Check system resources daily
3. Test health endpoint hourly
4. Rotate logs weekly
5. Clean old backups monthly

### Security Updates
1. Update Node.js version
2. Update PM2 version
3. Review SSH keys
4. Update SSL certificates
5. Check security dependencies

### Backup Management
- Location: `/root/backups/`
- Retention: 5 most recent
- Automatic cleanup
- Manual backup command:
```bash
ssh root@147.93.62.188 'cd /var/www && tar -czf /root/backups/manual_$(date +%Y%m%d_%H%M%S).tar.gz jouw-frontend-website/'
```

## Emergency Procedures

### Complete System Failure
1. SSH into VPS2
2. Check system logs
3. Restore latest backup
4. Restart PM2
5. Verify health endpoint
6. Check external services

### Performance Degradation
1. Monitor system resources
2. Check PM2 metrics
3. Review application logs
4. Scale PM2 instances if needed
5. Clear application caches

## Contact Information

For deployment issues:
- System Administrator: [Contact Info]
- DevOps Team: [Contact Info]
- Emergency Contact: [Contact Info]