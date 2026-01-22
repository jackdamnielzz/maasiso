# Domain Configuration for MaasISO Website

## Overview

This document details the configuration changes made to set up the MaasISO website to use the domain name `maasiso.nl` instead of the IP address.

## Changes Made

### Environment Variables

1. Updated `.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://maasiso.nl
   NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
   NEXT_PUBLIC_SITE_URL=https://maasiso.nl
   EMAIL_PASSWORD=Niekties@100
   ```

2. Updated `.env`:
   ```
   NEXT_PUBLIC_SITE_URL=https://maasiso.nl
   ```

### Nginx Configuration

1. Updated `nginx.conf`:
   ```nginx
   server {
       listen 80;
       server_name maasiso.nl www.maasiso.nl;
       
       # ... other configuration ...
   }
   ```

2. Updated `nginx-frontend.conf`:
   ```nginx
   server {
       listen 80;
       server_name maasiso.nl www.maasiso.nl;
       
       # ... other configuration ...
   }
   ```

### Deployment Scripts

1. Updated `scripts/direct-deploy.ps1`:
   - Changed all references from `http://147.93.62.188:3000` to `https://maasiso.nl`
   - Added `NEXT_PUBLIC_SITE_URL=https://maasiso.nl` to environment variables

2. Updated `scripts/quick-deploy.ps1`:
   - Changed all references from `http://147.93.62.188:3000` to `https://maasiso.nl`
   - Added `NEXT_PUBLIC_SITE_URL=https://maasiso.nl` to environment variables

3. Updated `scripts/deploy-to-vps2.ps1`:
   - Changed all references from `http://147.93.62.188:3000` to `https://maasiso.nl`
   - Added `NEXT_PUBLIC_SITE_URL=https://maasiso.nl` to environment variables

## DNS Configuration

To complete the setup, the following DNS records need to be configured for the `maasiso.nl` domain:

1. A Record:
   - Name: `@` (or blank)
   - Value: `147.93.62.188` (VPS2 IP address)
   - TTL: 3600 (or as preferred)

2. A Record:
   - Name: `www`
   - Value: `147.93.62.188` (VPS2 IP address)
   - TTL: 3600 (or as preferred)

## SSL/TLS Configuration (TODO)

For secure HTTPS connections, SSL/TLS certificates need to be set up:

1. Install Certbot on VPS2:
   ```bash
   apt-get update
   apt-get install certbot python3-certbot-nginx
   ```

2. Obtain and install certificates:
   ```bash
   certbot --nginx -d maasiso.nl -d www.maasiso.nl
   ```

3. Set up auto-renewal:
   ```bash
   certbot renew --dry-run
   ```

4. Add a cron job for automatic renewal:
   ```bash
   crontab -e
   # Add the following line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Verification

After deployment, verify the website is accessible at:
- https://maasiso.nl
- https://www.maasiso.nl

## Troubleshooting

If the website is not accessible after deployment:

1. Check Nginx configuration:
   ```bash
   ssh root@147.93.62.188 "nginx -t"
   ```

2. Check Nginx status:
   ```bash
   ssh root@147.93.62.188 "systemctl status nginx"
   ```

3. Check application status:
   ```bash
   ssh root@147.93.62.188 "pm2 status frontend"
   ```

4. Check application logs:
   ```bash
   ssh root@147.93.62.188 "pm2 logs frontend"