# Server Access and Maintenance Guide
Last Updated: 2025-01-19

## Server Details
- IP Address: 153.92.223.23
- Server Type: Hostinger KVM1 VPS
- Operating System: Ubuntu 22.04 LTS

## Access Procedures

### 1. SSH Access
```bash
ssh root@153.92.223.23
```

### 2. Important Directories
- Strapi Installation: `/var/www/strapi`
- Nginx Configuration: `/etc/nginx/sites-available/strapi`
- PM2 Logs: `/root/.pm2/logs/`

## Starting the Server

### 1. Check Server Status
```bash
# Check if Strapi is running
pm2 list

# Check nginx status
systemctl status nginx
```

### 2. Start Strapi (if not running)
```bash
# Navigate to Strapi directory
cd /var/www/strapi

# Start Strapi in production mode
NODE_ENV=production pm2 start npm --name strapi -- run start
```

### 3. Verify Services
```bash
# Check Strapi response
curl -I http://localhost:1337/admin

# Check nginx status
nginx -t
systemctl status nginx
```

## Stopping the Server
```bash
# Stop Strapi
pm2 stop all

# Stop nginx (if needed)
systemctl stop nginx
```

## Configuration Files

### 1. Strapi Database Configuration
File: `/var/www/strapi/config/database.ts`
```typescript
export default ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi_db'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'MaasIso2025ABC'),
      ssl: env.bool('DATABASE_SSL', false),
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    debug: false,
  },
});
```

### 2. Nginx Configuration
File: `/etc/nginx/sites-available/strapi`
```nginx
server {
    listen 80;
    server_name 153.92.223.23;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Maintenance Procedures

### 1. Updating Strapi
```bash
cd /var/www/strapi
npm install
NODE_ENV=production npm run build
pm2 restart strapi
```

### 2. Checking Logs
```bash
# View Strapi logs
pm2 logs strapi

# View nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 3. Database Backup
```bash
pg_dump -U postgres strapi_db > backup.sql
```

## Troubleshooting

### 1. If Strapi Fails to Start
```bash
# Check logs
pm2 logs strapi

# Rebuild and restart
cd /var/www/strapi
npm run build
NODE_ENV=production pm2 restart strapi
```

### 2. If Nginx Shows 502 Bad Gateway
```bash
# Check if Strapi is running
curl -I http://localhost:1337/admin

# Check nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

### 3. Port Conflicts
```bash
# Check what's using port 1337
lsof -i :1337

# Stop all PM2 processes
pm2 stop all
pm2 delete all

# Start fresh
NODE_ENV=production pm2 start npm --name strapi -- run start
```

## Access URLs

### Production Environment
- Admin Panel: http://153.92.223.23/admin
- API: http://153.92.223.23

### Development Environment
To access the Strapi admin panel in development mode (for editing content types):

1. Stop all running instances:
```bash
pm2 stop all
pm2 delete all
```

2. Start Strapi in development mode:
```bash
cd /var/www/strapi
npm run build
NODE_ENV=development pm2 start npm --name strapi -- run develop
```

3. Wait for the build to complete (you'll see "Strapi started successfully" in the logs)

4. Access the admin panel:
- URL: http://153.92.223.23:1337/admin
- Development mode allows editing content types and schema
- Changes made in development mode require a rebuild

To switch back to production mode:
```bash
pm2 stop all
cd /var/www/strapi
NODE_ENV=production pm2 start npm --name strapi -- run start
```

Note: Always use production mode for normal content management. Only use development mode when you need to modify content types or schema.

## Security Notes
- Keep server packages updated: `apt update && apt upgrade`
- Monitor logs regularly for suspicious activity
- Keep backups of database and configurations
- Update SSL certificates when implemented

## Regular Maintenance Tasks

### Daily
- Check server status: `pm2 list`
- Monitor error logs: `pm2 logs strapi`

### Weekly
- Check for updates: `apt update`
- Review nginx logs
- Backup database

### Monthly
- Full system updates: `apt upgrade`
- Review and clean old logs
- Check disk space: `df -h`

## Revision History
- 2025-01-19 13:36: Added detailed instructions for accessing development environment
- 2025-01-19: Initial documentation created after successful server setup
