# Two-Server Deployment Setup Guide

This document details the deployment setup for both VPS instances in our infrastructure: VPS1 (Strapi Backend) and VPS2 (Next.js Frontend).

## Infrastructure Overview

### VPS1 - Backend Server
- IP: 153.92.223.23
- Hostname: srv692111.hstgr.cloud
- Location: Netherlands
- Purpose: Strapi CMS Backend

### VPS2 - Frontend Server
- IP: 147.93.62.188
- Hostname: srv718842.hstgr.cloud
- Location: Germany
- Purpose: Next.js Frontend Application

## Access Configuration

### VPS1 (Backend) Access
1. SSH Configuration:
   ```bash
   Host maasiso-backend
       HostName 153.92.223.23
       User root
       Port 22
       IdentityFile ~/.ssh/maasiso_vps1
   ```

2. SSH Key Setup:
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -f ~/.ssh/maasiso_vps1
   
   # Copy key to VPS1
   ssh-copy-id -i ~/.ssh/maasiso_vps1.pub root@153.92.223.23
   ```

### VPS2 (Frontend) Access
1. SSH Configuration:
   ```bash
   Host maasiso-frontend
       HostName 147.93.62.188
       User root
       Port 22
       IdentityFile ~/.ssh/maasiso_vps2
   ```

2. SSH Key Setup:
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -f ~/.ssh/maasiso_vps2
   
   # Copy key to VPS2
   ssh-copy-id -i ~/.ssh/maasiso_vps2.pub root@147.93.62.188
   ```

## Backend Deployment (VPS1)

### Initial Setup
1. System Requirements:
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   
   # Install PM2
   npm install -p pm2@latest
   ```

2. Directory Structure:
   ```
   /var/www/strapi/
   ├── config/
   ├── public/
   ├── src/
   └── package.json
   ```

3. Environment Configuration:
   ```bash
   # Create .env file
   nano /var/www/strapi/.env
   ```
   
   Content:
   ```
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=your-app-keys
   API_TOKEN_SALT=your-token-salt
   ADMIN_JWT_SECRET=your-jwt-secret
   JWT_SECRET=your-jwt-secret
   ```

### Deployment Process
1. Application Setup:
   ```bash
   cd /var/www/strapi
   npm install
   npm run build
   ```

2. PM2 Configuration:
   ```bash
   pm2 start npm --name "strapi" -- run start
   pm2 save
   pm2 startup
   ```

3. CORS Configuration:
   ```javascript
   // config/middlewares.js
   module.exports = [
     'strapi::errors',
     {
       name: 'strapi::security',
       config: {
         contentSecurityPolicy: {
           useDefaults: true,
           directives: {
             'connect-src': ["'self'", 'https:', 'http:'],
             'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
             'media-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
             upgradeInsecureRequests: null,
           },
         },
         frameguard: false,
       },
     },
     {
       name: 'strapi::cors',
       config: {
         enabled: true,
         origin: ['http://147.93.62.188', 'http://147.93.62.188:3000'],
         credentials: true,
         methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
         headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
         keepHeaderOnError: true,
       },
     },
     'strapi::poweredBy',
     'strapi::logger',
     'strapi::query',
     'strapi::body',
     'strapi::session',
     'strapi::favicon',
     'strapi::public',
   ]
   ```

## Frontend Deployment (VPS2)

### Initial Setup
1. System Requirements:
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

2. Directory Structure:
   ```
   /var/www/jouw-frontend-website/
   ├── .next/
   ├── public/
   ├── src/
   └── package.json
   ```

### SFTP Deployment Configuration
1. VS Code SFTP Setup:
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
       "privateKeyPath": "~/.ssh/maasiso_vps2"
   }
   ```

2. Nginx Configuration:
   ```nginx
   server {
       listen 80;
       server_name 147.93.62.188;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Deployment Process
1. Application Setup:
   ```bash
   cd /var/www/jouw-frontend-website
   npm install
   npm run build
   ```

2. Environment Setup (Critical):
   ```bash
   # Create a production .env file with correct settings
   cat > /var/www/jouw-frontend-website/.env << EOL
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=http://147.93.62.188:3000
   NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
   EMAIL_PASSWORD=your-email-password-here
   EOL

   # Make sure the file has correct permissions
   chmod 600 /var/www/jouw-frontend-website/.env
   ```

3. PM2 Configuration:
   ```bash
   pm2 start npm --name "frontend" -- run start
   pm2 save
   pm2 startup
   ```

4. Automated Deployment Script:
   The `scripts/direct-deploy.ps1` PowerShell script automates deployment including:
   - Setting up environment variables
   - Packaging application into a tarball
   - Transferring to VPS via SCP
   - Creating production .env file on server
   - Restarting the application with PM2

   **Important Note**: When modifying the deployment script, ensure environment variables are properly set in production. The script uses a cat command to explicitly create the .env file rather than preserving existing files, which ensures all required variables are included.

## Monitoring and Maintenance

### Health Checks
1. Backend Health:
   ```bash
   curl http://153.92.223.23:1337/api/health
   ```

2. Frontend Health:
   ```bash
   curl http://147.93.62.188/api/health
   ```

### Log Management
1. Backend Logs:
   ```bash
   # Strapi logs
   pm2 logs strapi
   
   # System logs
   tail -f /var/log/syslog
   ```

2. Frontend Logs:
   ```bash
   # Next.js logs
   pm2 logs frontend
   
   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

### Backup Procedures
1. Backend Backup:
   ```bash
   cd /var/www
   tar -czf strapi-backup-$(date +%Y%m%d).tar.gz strapi/
   ```

2. Frontend Backup:
   ```bash
   cd /var/www
   tar -czf frontend-backup-$(date +%Y%m%d).tar.gz jouw-frontend-website/
   ```

## Security Considerations

1. Firewall Configuration:
   ```bash
   # Backend (VPS1)
   ufw allow 22/tcp
   ufw allow 1337/tcp
   
   # Frontend (VPS2)
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

2. SSL/TLS Setup (TODO):
   - Implement SSL certificates
   - Configure HTTPS
   - Update Nginx configuration

3. Security Best Practices:
   - Regular system updates
   - Security patch management
   - Access control monitoring
   - Regular backup verification

## Troubleshooting

### Common Issues
1. Connection Issues:
   - Verify SSH key permissions
   - Check firewall settings
   - Validate network connectivity

2. Deployment Failures:
   - Check disk space
   - Verify file permissions
   - Review PM2 logs

3. Performance Issues:
   - Monitor resource usage
   - Check application logs
   - Verify network latency

## Contact Information

For deployment issues:
- System Administrator: [Contact Info]
- Backend Developer: [Contact Info]
- Frontend Developer: [Contact Info]

## SSH Key Configuration

### Frontend Server (frontend.maasiso.cloud)
- SSH Key Name: maasiso_vps
- Location: `~/.ssh/maasiso_vps` (local) and added to authorized_keys on server
- Purpose: Used for deployment and maintenance of the frontend application
- Added to server via provider interface

### Backend Server (strapicms.maasiso.cloud)
- SSH Key Name: maasiso_vps
- Location: `~/.ssh/maasiso_vps` (local) and added to authorized_keys on server
- Purpose: Used for API communication and maintenance of the Strapi backend
- Added to server via provider interface

### Key Generation
The SSH key was generated using:
```powershell
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\maasiso_vps" -N '""'
```

### Public Key
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDHaLtH+nrONBIH5/gLVaBlEitFYQUx8BWuZDU5HLh9kCu9eq7pzg5Yo3R3gZDsmDgo6L/k9JYMuvVWHUPxHLyJBU0nPM1fBRYyyIoEqzHpfYl9Ry1VC+Rlrw+7pe0tg2xPJ/2RyChhEnUO8zOZPXIpP4I+P4liVnn3f3LA4RjK8oYZ/fBBo714wRkZqDlhNWhBBrbTfh75fwoEO1xl0EV+FAc5YaybSPvSbyU6hISS6+a+Ns01mJlUGA/pmd0o8LFV1ejdQ9KHwv9WK4tWY/TcwDNOfJ28oroQaoq8zJsg9zO3OijlU8DnUZ9pDndkzQYkOL426hp5lZHpk/hzkpUQKRPLQv8w3D23
```