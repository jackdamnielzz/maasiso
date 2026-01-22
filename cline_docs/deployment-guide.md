# MaasISO Deployment Guide

## Overview

This guide provides comprehensive documentation for deploying the MaasISO application. The deployment system consists of several integrated components that work together to ensure reliable, fast, and error-free deployments.

## Prerequisites

### Required Software
- Node.js 20.x
- PowerShell 5.1 or later
- SSH client
- SCP client
- tar utility

### Required Access
- SSH access to VPS (147.93.62.188)
- SSH key at `~/.ssh/maasiso_vps`
- Sudo privileges on VPS

### Environment Setup
1. Ensure SSH key is properly configured:
```bash
# Test SSH access
ssh -i ~/.ssh/maasiso_vps root@147.93.62.188
```

2. Verify Node.js version:
```bash
node --version  # Should be 20.x
```

## Deployment Components

### 1. Deployment Script (direct-deploy.ps1)
The main deployment script with enhanced features:

```powershell
# Basic deployment
.\scripts\direct-deploy.ps1

# Skip build phase
.\scripts\direct-deploy.ps1 -SkipBuild

# Configure health checks
.\scripts\direct-deploy.ps1 -HealthCheckRetries 10 -HealthCheckDelay 5
```

Parameters:
- `-SkipBuild`: Skip the build phase (useful for quick deployments)
- `-HealthCheckRetries`: Number of health check attempts (default: 5)
- `-HealthCheckDelay`: Delay between health checks in seconds (default: 10)
- `-BackupDir`: Custom backup directory (default: /var/www/backups)

### 2. Process Manager (ecosystem.config.js)
PM2 configuration for process management:

```javascript
// Key settings
{
  wait_ready: true,
  listen_timeout: 10000,
  kill_timeout: 5000,
  shutdown_with_message: true
}
```

### 3. Server Implementation (server.js)
Enhanced server with proper process management:

```javascript
// Key features
- PM2 ready signal integration
- Graceful shutdown handling
- External connection support
- Comprehensive error handling
```

### 4. Nginx Configuration (nginx.conf)
Optimized for performance and reliability:

```nginx
# Key features
- Intelligent caching
- Proper proxy settings
- Static asset optimization
- Health check endpoints
```

## Next.js Standalone Mode Deployment

### Directory Structure
The standalone output requires a specific directory structure for proper functionality:

```bash
.next/
└── standalone/
    ├── server.js             # Main server file
    ├── app/
    │   └── critical.css      # Critical CSS
    ├── .next/
    │   └── static/          # Static assets
    ├── node_modules/        # Dependencies
    └── package.json         # Project configuration
```

Key considerations:
- `server.js` must be at the root of standalone directory
- Static assets must maintain the `.next/static` structure
- Dependencies must be copied to standalone directory
- Proper file permissions are critical:
  ```bash
  chmod 644 .next/standalone/app/critical.css
  chmod -R 755 .next/standalone/.next/static
  chown -R www-data:www-data /var/www/frontend
  ```

### PM2 Configuration Requirements
PM2 must be configured correctly for standalone mode:

```javascript
module.exports = {
  apps: [{
    name: 'frontend',
    script: 'server.js',
    cwd: '.next/standalone', // Critical for standalone mode
    env: {
      PORT: 3000,
      NODE_ENV: 'production'
    },
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    shutdown_with_message: true,
    post_update: [
      "npm install --legacy-peer-deps",
      "npm run build:prod",
      "cp -r node_modules .next/standalone/"
    ]
  }]
}
```

Key settings:
- `cwd` must point to standalone directory
- `wait_ready` ensures proper startup
- `post_update` handles dependency management
- Environment variables must be properly configured

### Deployment Script Changes
Recent updates to deployment scripts handle standalone mode:

```bash
# Directory setup
mkdir -p .next/standalone/app
mkdir -p .next/standalone/.next

# Copy critical files
cp app/critical.css .next/standalone/app/
cp -r .next/static .next/standalone/.next/

# Set permissions
chmod 644 .next/standalone/app/critical.css
chmod -R 755 .next/standalone/.next/static
chown -R www-data:www-data /var/www/frontend

# Start application
cd .next/standalone
NODE_ENV=production pm2 start server.js --name frontend
```

## RSC Troubleshooting

### Module Resolution Problems
Common RSC module resolution issues:

1. **Missing Dependencies**
   ```bash
   Error: Cannot find module '@/components/feature'
   ```
   Solution: Ensure dependencies are copied to standalone:
   ```bash
   cp -r node_modules .next/standalone/
   ```

2. **Path Resolution**
   ```bash
   Error: Cannot find module './Feature'
   ```
   Solution: Use absolute imports or verify path structure:
   ```typescript
   // Use absolute imports
   import { Feature } from '@/components/Feature'
   ```

3. **Dynamic Imports**
   ```typescript
   // Problematic
   const Component = dynamic(() => import(`./components/${name}`))
   
   // Correct
   const Component = dynamic(() => import('@/components/' + name))
   ```

### Directory Structure Issues
Common directory-related RSC problems:

1. **Static Asset Loading**
   - Issue: 404 errors for static files
   - Solution: Verify `.next/static` in standalone directory
   ```bash
   ls -la .next/standalone/.next/static
   ```

2. **Server Component Location**
   - Issue: Components not found during SSR
   - Solution: Verify component placement:
   ```bash
   # Correct structure
   app/
   ├── layout.tsx
   ├── page.tsx
   └── components/
       └── ServerComponent.tsx
   ```

3. **Client Component Separation**
   - Issue: Hydration errors
   - Solution: Proper component organization:
   ```typescript
   // pages/example.tsx
   import { ClientComponent } from '@/components/client'
   ```

### PM2 Configuration Problems
Common PM2 issues with RSC:

1. **Working Directory**
   ```bash
   Error: Cannot find .next/server/app/page.js
   ```
   Solution: Verify PM2 working directory:
   ```javascript
   // ecosystem.config.js
   cwd: '.next/standalone'
   ```

2. **Environment Variables**
   ```bash
   Error: Missing runtime environment variables
   ```
   Solution: Configure environment in PM2:
   ```javascript
   env: {
     NODE_ENV: 'production',
     NEXT_RUNTIME: 'nodejs'
   }
   ```

3. **Process Management**
   ```bash
   Error: Application did not start within timeout
   ```
   Solution: Adjust PM2 timeouts:
   ```javascript
   wait_ready: true,
   listen_timeout: 10000,
   kill_timeout: 5000
   ```

## Deployment Process

### 1. Pre-deployment Checks
The script automatically verifies:
- Required software availability
- SSH connectivity
- Disk space
- Current process status

### 2. Deployment Steps
1. **Environment Setup**
   - Configures production environment variables
   - Validates configuration

2. **Build Process**
   - Runs in parallel where possible
   - Validates build output
   - Optimizes assets

3. **Backup Creation**
   - Creates timestamped backup
   - Verifies backup integrity
   - Manages backup retention

4. **File Transfer**
   - Optimized package creation
   - Efficient file transfer
   - Verification of transferred files

5. **Deployment**
   - Graceful process shutdown
   - Configuration updates
   - Process restart
   - Health verification

### 3. Post-deployment Verification
- Health checks
- Process status verification
- Log inspection
- Backup cleanup

## Monitoring and Maintenance

### 1. Monitoring Commands
```powershell
# View application logs
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 logs frontend'

# Check process status
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 'pm2 show frontend'

# Monitor health
./scripts/monitor-health.ps1
```

### 2. Log Locations
```bash
# Application logs
/var/www/jouw-frontend-website/logs/

# PM2 logs
~/.pm2/logs/

# Nginx logs
/var/log/nginx/
```

### 3. Backup Management
```bash
# List backups
ls -l /var/www/backups/

# Restore specific backup
tar -xzf /var/www/backups/frontend_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/jouw-frontend-website/
```

## Troubleshooting

### 1. Common Issues

#### Build Failures
```powershell
# Check build logs
npm run build --verbose

# Clear cache and retry
rm -rf .next
npm run build
```

#### Deployment Failures
1. Check deployment logs:
```powershell
# Last deployment log
Get-Content logs/deploy.log
```

2. Verify process status:
```bash
pm2 status
pm2 logs frontend --lines 100
```

3. Check system resources:
```bash
df -h  # Disk space
free -m  # Memory usage
top  # CPU usage
```

#### Health Check Failures
1. Verify application health:
```bash
curl http://localhost:3000/api/health
```

2. Check Nginx status:
```bash
systemctl status nginx
nginx -t
```

### 2. Recovery Procedures

#### Manual Rollback
```powershell
# List available backups
ssh -i "~/.ssh/maasiso_vps" root@147.93.62.188 "ls -l /var/www/backups"

# Execute rollback
.\scripts\direct-deploy.ps1 -Rollback -BackupFile "frontend_backup_YYYYMMDD_HHMMSS.tar.gz"
```

#### Process Recovery
```bash
# Restart application
pm2 restart frontend

# Reload Nginx
systemctl reload nginx
```

## Best Practices

### 1. Before Deployment
- Review changes
- Run local tests
- Check disk space
- Verify backup space

### 2. During Deployment
- Monitor logs
- Watch for errors
- Check process status
- Verify health endpoints

### 3. After Deployment
- Verify functionality
- Check logs for errors
- Monitor performance
- Clean old backups

## Security Considerations

### 1. Access Control
- Use SSH keys only
- Regular key rotation
- Proper file permissions
- Limited sudo access

### 2. Environment Variables
- Secure storage
- Regular rotation
- Proper encryption
- Access logging

### 3. Backup Security
- Encrypted backups
- Secure storage
- Regular cleanup
- Access control

## Maintenance Schedule

### 1. Daily Tasks
- Monitor logs
- Check process status
- Verify backups
- Health checks

### 2. Weekly Tasks
- Log rotation
- Backup cleanup
- Performance check
- Security updates

### 3. Monthly Tasks
- Full system backup
- SSL renewal
- Dependency updates
- Security audit

## Deployment Checklist

### Pre-deployment
- [ ] Review changes
- [ ] Run local tests
- [ ] Check disk space
- [ ] Verify backup space
- [ ] Verify standalone output structure:
  - [ ] Check .next/standalone directory exists
  - [ ] Verify server.js location
  - [ ] Check static assets structure
  - [ ] Validate critical.css placement

### Deployment
- [ ] Execute deployment script
- [ ] Monitor logs
- [ ] Watch for errors
- [ ] Verify health checks
- [ ] Check PM2 configuration:
  - [ ] Verify working directory setting
  - [ ] Validate environment variables
  - [ ] Check process timeouts
  - [ ] Confirm post-update hooks

### Post-deployment
- [ ] Verify functionality
- [ ] Check logs
- [ ] Monitor performance
- [ ] Clean old backups
- [ ] Validate server.js location and permissions
- [ ] Verify static asset serving
- [ ] Check RSC functionality
- [ ] Monitor for hydration warnings

## Contact Information

For deployment issues:
- System Administrator: [Contact Info]
- Backend Developer: [Contact Info]
- Frontend Developer: [Contact Info]