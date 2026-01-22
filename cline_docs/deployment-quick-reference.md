# Deployment Quick Reference Guide

## Common Deployment Commands

### Standard Deployment
```powershell
# Full deployment with all checks
.\scripts\direct-deploy.ps1
```

### Quick Deployment (Skip Build)
```powershell
# Use when only configuration changes are needed
.\scripts\direct-deploy.ps1 -SkipBuild
```

### Careful Deployment (More Health Checks)
```powershell
# More thorough health checking
.\scripts\direct-deploy.ps1 -HealthCheckRetries 10 -HealthCheckDelay 5
```

## Monitoring Commands

### View Logs
```powershell
# Application logs
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 logs frontend'

# Error logs
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 logs frontend --err'

# Nginx logs
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'tail -f /var/log/nginx/error.log'
```

### Check Status
```powershell
# Process status
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 status'

# Detailed process info
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 show frontend'

# Health check
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'curl http://localhost:3000/api/health'
```

## Quick Fixes

### Process Issues
```powershell
# Restart application
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 restart frontend'

# Reload Nginx
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'systemctl reload nginx'
```

### Cache Issues
```powershell
# Clear Nginx cache
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'rm -rf /tmp/nginx_cache/*'

# Restart Nginx
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'systemctl restart nginx'
```

### Quick Rollback
```powershell
# List available backups
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 "ls -l /var/www/backups"

# Rollback to specific backup
.\scripts\direct-deploy.ps1 -Rollback -BackupFile "frontend_backup_YYYYMMDD_HHMMSS.tar.gz"
```

## Common Issues & Solutions

### 1. Deployment Fails
```powershell
# Check deployment logs
Get-Content logs/deploy.log

# Verify disk space
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'df -h'

# Check process status
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 status'
```

### 2. Health Check Fails
```powershell
# Check application logs
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 logs frontend --lines 100'

# Verify Nginx configuration
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'nginx -t'
```

### 3. Performance Issues
```powershell
# Check system resources
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'top -b -n 1'

# Monitor memory usage
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'free -m'
```

## Pre-deployment Checklist

1. [ ] Verify SSH access
2. [ ] Check disk space
3. [ ] Review changes
4. [ ] Run local tests
5. [ ] Check backup space

## Post-deployment Checklist

1. [ ] Verify health check
2. [ ] Check application logs
3. [ ] Monitor performance
4. [ ] Verify functionality
5. [ ] Clean old backups

## Important Paths

- Application: `/var/www/jouw-frontend-website/`
- Backups: `/var/www/backups/`
- Logs: `/var/log/nginx/`, `~/.pm2/logs/`
- Config: `/etc/nginx/sites-available/default`

## Contact

For urgent deployment issues:
- System Administrator: [Contact Info]
- Backend Developer: [Contact Info]
- Frontend Developer: [Contact Info]