# Deployment Workflow Manual

## Overview

This document outlines the deployment workflow for the Maasiso website using SFTP deployment through VS Code to Hostinger VPS2.

## SSH Access and Authentication

### Initial SSH Setup
```bash
# Connect to VPS with password
ssh root@147.93.62.188
# Password: [REDACTED_PASSWORD]

# Generate SSH key on your local machine (if not exists)
ssh-keygen -t ed25519 -f ~/.ssh/maasiso_vps

# Copy your public key to VPS
ssh-copy-id -i ~/.ssh/maasiso_vps.pub root@147.93.62.188
```

### SSH Configuration
Add this to your `~/.ssh/config`:
```
Host maasiso-vps
    HostName 147.93.62.188
    User root
    IdentityFile ~/.ssh/maasiso_vps
    StrictHostKeyChecking yes
```

## VPS Information

### Server Details
- Ubuntu 22.04 VPS (VPS2)
- Root access
- Domain/hostname: srv718842.hstgr.cloud
- IP: 147.93.62.188

## VS Code SFTP Setup

### Extension Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "SFTP" by liximomo
4. Install the extension
5. Reload VS Code if prompted

### Project Configuration
1. Open Command Palette (Ctrl+Shift+P)
2. Type "SFTP: Config"
3. Select it to create `.vscode/sftp.json`
4. Configure with:

```json
{
    "name": "Deploy to VPS2 (Hostinger SFTP)",
    "host": "147.93.62.188",
    "protocol": "sftp",
    "port": 22,
    "username": "root",
    "remotePath": "/var/www/jouw-frontend-website/",
    "uploadOnSave": false,
    "syncOption": {
        "delete": false
    },
    "privateKeyPath": "~/.ssh/maasiso_vps"
}
```

## Deployment Process

### Initial Deployment
1. Open project in VS Code
2. Command Palette → "SFTP: List Remote Directory"
3. Right-click project folder
4. Select "SFTP: Upload Folder"
5. Choose remote directory

### Regular Updates
1. Make and test changes locally
2. Right-click changed files/folders
3. Select "SFTP: Upload"
4. Verify changes on the server

### Development Mode (Optional)
For rapid development:
1. Set "uploadOnSave": true in sftp.json
2. Files automatically upload on save
3. **Note**: Use with caution, not recommended for production

## Monitoring and Maintenance

### Server Status
```bash
# Connect to VPS
ssh root@147.93.62.188

# Check system resources
htop

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### SSL Certificate Management
```bash
# Check certificate status
ssh root@147.93.62.188 'certbot certificates'

# Force certificate renewal
ssh root@147.93.62.188 'certbot renew --force-renewal'
```

## Troubleshooting

### Common Issues

1. **SFTP Connection Issues**
   - Verify VPS IP and credentials
   - Check SSH service: `systemctl status sshd`
   - Review SSH logs: `tail -f /var/log/auth.log`
   - Verify SSH key permissions

2. **Upload Failures**
   - Check VS Code SFTP output panel
   - Verify remote directory exists and permissions
   - Check disk space on VPS
   - Verify network connectivity

3. **Nginx Issues**
   ```bash
   # Check configuration and restart
   ssh root@147.93.62.188 'nginx -t && systemctl restart nginx'
   ```

### Recovery Procedures

1. **Restore from Backup**
   ```bash
   # Create backup directory if it doesn't exist
   ssh root@147.93.62.188 'mkdir -p /root/backups'
   
   # Create backup
   ssh root@147.93.62.188 'tar -czf /root/backups/website_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/jouw-frontend-website/'
   
   # Restore from specific backup
   ssh root@147.93.62.188 'cd /var/www && tar -xzf /root/backups/website_YYYYMMDD_HHMMSS.tar.gz'
   ```

2. **Environment File Recovery**
   ```bash
   # Backup current env file
   ssh root@147.93.62.188 'cp /var/www/jouw-frontend-website/.env /var/www/jouw-frontend-website/.env.backup'
   ```

## Security Considerations

1. **SSH Security**
   - Use SSH key authentication only
   - Disable password authentication
   - Use strong SSH keys (ED25519 or RSA 4096)
   - Regularly rotate SSH keys
   - Monitor SSH access logs

2. **SFTP Configuration**
   - Never commit sftp.json with credentials
   - Add sftp.json to .gitignore
   - Use SSH keys instead of passwords
   - Regularly update VS Code and SFTP extension

3. **Environment Variables**
   - Never commit .env files
   - Keep secure backups of environment files
   - Regularly rotate sensitive credentials

4. **Monitoring**
   - Monitor SSH access attempts
   - Check for unauthorized access
   - Review system logs regularly
   - Monitor website performance

## Backup Procedures

1. **Website Files**
   ```bash
   # Create dated backup
   ssh root@147.93.62.188 'cd /var/www && tar -czf /root/backups/website_$(date +%Y%m%d_%H%M%S).tar.gz jouw-frontend-website/'
   
   # List backups
   ssh root@147.93.62.188 'ls -lh /root/backups/'
   ```

2. **Configuration Files**
   ```bash
   # Backup all config files
   ssh root@147.93.62.188 'tar -czf /root/backups/config_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/jouw-frontend-website/.env* /etc/nginx/sites-available/default'
   ```

## Contact Information

For deployment issues, contact:
- System Administrator: [Contact Info]
- Website Developer: [Contact Info]