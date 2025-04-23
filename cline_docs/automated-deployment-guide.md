# Automated Deployment Guide

This document describes the new automated deployment process for the MaasISO project. The deployment system has been redesigned to be fully automated, reliable, and includes safety measures like health checks and automatic rollbacks.

## Deployment Methods

There are two ways to deploy the application:

1. **GitHub Actions (Recommended)**
   - Automatically triggers on push to main branch
   - Can be manually triggered from GitHub interface
   - Handles all deployment steps automatically
   - Includes comprehensive error handling and rollback

2. **PowerShell Script (Backup Method)**
   - Local deployment script for manual deployments
   - Useful for situations where GitHub Actions isn't available
   - Provides the same safety features as GitHub Actions

## Setup Instructions

### 1. GitHub Actions Setup

1. Add the following secrets to your GitHub repository:
```
VPS_IP=147.93.62.188
SSH_PRIVATE_KEY=(your SSH private key)
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337
NEXT_PUBLIC_STRAPI_API_URL=http://153.92.223.23:1337
NEXT_PUBLIC_STRAPI_TOKEN=(your Strapi token)
```

2. Ensure the repository has the following structure:
```
.github/
  workflows/
    deploy.yml      # Deployment workflow
scripts/
  automated-deploy.ps1  # Backup deployment script
```

3. Configure branch protection rules:
   - Require status checks to pass before merging
   - Require review for pull requests
   - Protect the main branch

### 2. VPS Configuration

1. Set up the required directories:
```bash
mkdir -p /var/www/jouw-frontend-website
mkdir -p /var/www/backups
```

2. Configure SSH access:
```bash
# Add deployment key to authorized_keys
echo "ssh-ed25519 AAAA..." >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

3. Install required software:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx
```

## Deployment Process

### Automated Deployment (GitHub Actions)

1. **Triggering Deployment**
   - Push to main branch, or
   - Go to Actions → Automated Deployment → Run workflow

2. **Process Steps**
   - Code checkout
   - Node.js setup
   - Dependencies installation
   - Testing
   - Building
   - Backup creation
   - File transfer
   - Service updates
   - Health checks
   - Cleanup

3. **Monitoring Deployment**
   - Watch the Actions tab in GitHub
   - Check deployment logs
   - Verify health endpoint
   - Monitor PM2 logs

### Manual Deployment (PowerShell Script)

1. **Running the Script**
```powershell
.\scripts\automated-deploy.ps1 -Environment production -VpsIp 147.93.62.188
```

2. **Script Parameters**
```powershell
-Environment   # Deployment environment (default: production)
-VpsIp         # VPS IP address
-RemotePath    # Remote deployment path
-BackupDir     # Backup directory path
```

## Health Checks

The deployment process includes multiple health checks:

1. **Pre-deployment Checks**
   - Build verification
   - Test execution
   - Dependency validation

2. **Post-deployment Checks**
   - Service status verification
   - API endpoint testing
   - Resource availability
   - Performance metrics

3. **Continuous Monitoring**
   - PM2 process status
   - Nginx status
   - System resources
   - Application logs

## Rollback Procedure

Automatic rollback triggers if:
- Health checks fail
- Deployment process errors
- Service fails to start

The rollback process:
1. Restores the last known good backup
2. Restarts services
3. Verifies system health
4. Notifies of rollback status

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify VPS connectivity
   - Check disk space
   - Review application logs

2. **Health Checks Fail**
   - Check application logs
   - Verify environment variables
   - Check service status
   - Review nginx configuration

3. **Rollback Issues**
   - Verify backup integrity
   - Check file permissions
   - Review service logs
   - Check system resources

### Log Locations

```bash
# Application Logs
pm2 logs frontend

# Nginx Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System Logs
journalctl -u nginx
journalctl -u pm2-root
```

## Best Practices

1. **Before Deployment**
   - Run tests locally
   - Review changes
   - Check system resources
   - Verify backup integrity

2. **During Deployment**
   - Monitor deployment progress
   - Watch for errors
   - Check service status
   - Verify health endpoints

3. **After Deployment**
   - Verify application functionality
   - Check logs for errors
   - Monitor performance
   - Clean up old backups

## Security Considerations

1. **Access Control**
   - Use SSH keys only
   - Restrict server access
   - Implement proper firewalls
   - Regular security updates

2. **Environment Variables**
   - Use GitHub secrets
   - Encrypt sensitive data
   - Regular token rotation
   - Proper permission settings

3. **Backup Security**
   - Encrypted backups
   - Secure storage
   - Regular cleanup
   - Access logging

## Maintenance

1. **Regular Tasks**
   - Backup verification
   - Log rotation
   - Security updates
   - Performance monitoring

2. **Monthly Tasks**
   - SSL certificate renewal
   - Dependency updates
   - Security audit
   - Backup cleanup

3. **Quarterly Tasks**
   - Full system backup
   - Performance review
   - Security assessment
   - Documentation update