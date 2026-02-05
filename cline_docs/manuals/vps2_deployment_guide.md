# VPS2 Deployment Guide

This guide explains how to deploy and maintain the frontend application on VPS2, and how it communicates with the backend on VPS1.

## Infrastructure Overview

- VPS1 (153.92.223.23): Runs the backend (Strapi)
- VPS2 (147.93.62.188): Runs the frontend (Next.js)

## Initial Setup

1. SSH Key Setup:
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -f ~/.ssh/maasiso_vps
   
   # Add key to VPS2 (Password: [REDACTED_PASSWORD])
   ssh root@147.93.62.188
   # Then manually add the public key content to ~/.ssh/authorized_keys
   ```

2. VS Code SFTP Configuration:
   - Install "SFTP" extension by liximomo
   - Configuration is in `.vscode/sftp.json`
   - Uses SSH key authentication for secure file transfer

3. Server Setup:
   ```bash
   # Copy setup script to VPS2
   scp scripts/setup-vps2.sh root@147.93.62.188:/root/
   
   # Run setup script
   ssh root@147.93.62.188 "chmod +x /root/setup-vps2.sh && ./setup-vps2.sh"
   ```

## Deployment Process

1. Local Development:
   - Make changes in VS Code
   - Test locally with `npm run dev`
   - Ensure backend connectivity is working

2. Deploy to VPS2:
   ```powershell
   # Run deployment script
   ./scripts/deploy-to-vps2.ps1
   ```

3. Verify Deployment:
   - Access frontend: http://147.93.62.188
   - Check logs: `ssh root@147.93.62.188 "journalctl -u frontend"`
   - Monitor process: `ssh root@147.93.62.188 "pm2 status"`

## Configuration Files

1. Environment Variables:
   - `.env.production`: Contains production environment settings
   - Key variables:
     ```
     NEXT_PUBLIC_API_URL=http://147.93.62.188:3000
     NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
     ```

2. Nginx Configuration:
   - Located at `/etc/nginx/sites-available/frontend`
   - Handles HTTP traffic and proxies to Node.js application

3. Systemd Service:
   - Located at `/etc/systemd/system/frontend.service`
   - Manages application lifecycle

## Maintenance

1. View Logs:
   ```bash
   # Application logs
   ssh root@147.93.62.188 "pm2 logs frontend"
   
   # Nginx logs
   ssh root@147.93.62.188 "tail -f /var/log/nginx/access.log"
   ssh root@147.93.62.188 "tail -f /var/log/nginx/error.log"
   ```

2. Restart Services:
   ```bash
   # Restart application
   ssh root@147.93.62.188 "systemctl restart frontend"
   
   # Restart Nginx
   ssh root@147.93.62.188 "systemctl restart nginx"
   ```

3. Update Application:
   - Run `./scripts/deploy-to-vps2.ps1`
   - Or manually using VS Code SFTP:
     1. Right-click project folder
     2. Select "SFTP: Upload Folder"
     3. Choose `/var/www/jouw-frontend-website/`

## Troubleshooting

1. Connection Issues:
   - Check VPS2 status: `ssh root@147.93.62.188 "systemctl status frontend"`
   - Verify Nginx: `ssh root@147.93.62.188 "nginx -t"`
   - Check backend connectivity: `curl http://153.92.223.23:1337/api/health`

2. Deployment Failures:
   - Check application logs
   - Verify file permissions
   - Ensure all services are running

3. Performance Issues:
   - Monitor resources: `ssh root@147.93.62.188 "htop"`
   - Check Nginx worker connections
   - Review PM2 metrics

## Security Considerations

1. SSH Access:
   - Use SSH key authentication only
   - Regularly rotate SSH keys
   - Monitor auth.log for unauthorized attempts

2. Environment Variables:
   - Never commit .env files
   - Use secure methods to transfer sensitive data
   - Regularly update credentials

3. File Permissions:
   - Ensure proper ownership: `chown -R root:root /var/www/jouw-frontend-website`
   - Set correct permissions: `chmod -R 755 /var/www/jouw-frontend-website`

## Backup and Recovery

1. Create Backup:
   ```bash
   ssh root@147.93.62.188 "tar -czf /root/frontend-backup-\$(date +%Y%m%d).tar.gz /var/www/jouw-frontend-website"
   ```

2. Restore from Backup:
   ```bash
   ssh root@147.93.62.188 "cd /var/www && tar -xzf /root/frontend-backup-YYYYMMDD.tar.gz"
   ```

## Contact Information

For deployment issues, contact:
- System Administrator: [Contact Info]
- Frontend Developer: [Contact Info]