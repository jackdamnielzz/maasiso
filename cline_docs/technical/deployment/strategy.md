# Deployment Strategy

## Environment Overview

### Production Environment
- **Frontend:** Hostinger (maasiso.nl)
- **Backend:** Hostinger KVM1 VPS (cms.maasiso.nl)
  - 1 vCPU
  - 2GB RAM
  - 20GB SSD
  - Unmetered bandwidth
  - Ubuntu 22.04 LTS
- **Database:** PostgreSQL
- **CDN:** Cloudflare (optional)

### Staging Environment
- **Frontend:** Hostinger (staging.maasiso.nl)
- **Backend:** Staging VPS instance
- **Database:** Staging PostgreSQL instance
- **Purpose:** Testing and QA

### Development Environment
- **Frontend:** Local Next.js development server
- **Backend:** Local Strapi instance
- **Database:** Local PostgreSQL
- **Purpose:** Development and testing

## Deployment Process

### Frontend (Next.js on Hostinger)

1. **Pre-deployment Checks**
   - Run unit tests
   - Run integration tests
   - Check build process locally
   - Verify environment variables

2. **Deployment Steps**
   ```bash
   # Build and test locally first
   npm run build
   npm run test
   
   # Push to GitHub
   git push origin main
   
   # Deploy to Hostinger
   ```

3. **Post-deployment Verification**
   - Check Hostinger deployment status
   - Verify site functionality
   - Run Lighthouse tests
   - Check error monitoring

### Backend (Strapi on VPS)

1. **Current Deployment Status**
   - VPS: Hostinger KVM1 (153.92.223.23)
   - Strapi running on port 1337
   - Nginx reverse proxy configured
   - PM2 process management active
   - PostgreSQL database running
   - Detailed setup and maintenance in `server_access_guide.md`

2. **Server Access and Maintenance**
   - Complete server access procedures documented in `server_access_guide.md`
   - Includes startup, configuration, and troubleshooting
   - Regular maintenance tasks and schedules
   - Security best practices

3. **Verification Points**
   - Admin panel accessible at http://153.92.223.23/admin
   - API endpoints working
   - Database connection stable
   - PM2 process running
   - Nginx proxy functioning

4. **Next Steps**
   - Set up SSL/HTTPS
   - Configure domain (cms.maasiso.nl)
   - Implement regular backups
   - Set up monitoring

## Configuration Management

### Environment Variables

#### Frontend (.env)
```env
# Development
NEXT_PUBLIC_API_URL=http://153.92.223.23
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production (future)
# NEXT_PUBLIC_API_URL=https://cms.maasiso.nl
# NEXT_PUBLIC_SITE_URL=https://maasiso.nl
```

#### Backend (.env)
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=[secure-password]

# Security
JWT_SECRET=[generated-secret]
ADMIN_JWT_SECRET=[generated-admin-secret]
API_TOKEN_SALT=[generated-salt]

# Server Configuration
HOST=localhost
PORT=1337
APP_KEYS=[generated-keys]
```

### Server Configurations

#### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name cms.maasiso.nl;

    ssl_certificate /etc/letsencrypt/live/cms.maasiso.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.maasiso.nl/privkey.pem;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backup Procedures

### Database Backups
```bash
# Daily automated backup
0 0 * * * pg_dump -U postgres maasiso > /backups/maasiso_$(date +\%Y\%m\%d).sql

# Manual backup
pg_dump -U postgres maasiso > backup.sql
```

### File Backups
```bash
# Backup uploaded files
tar -czf /backups/uploads_$(date +\%Y\%m\%d).tar.gz /path/to/strapi/public/uploads
```

## Rollback Procedures

### Frontend Rollback
1. Access Hostinger hosting panel
2. Select previous deployment version
3. Restore selected version
4. Verify rollback success

### Backend Rollback
1. **Database Rollback**
   ```bash
   # Restore from backup
   psql -U postgres maasiso < backup.sql
   ```

2. **Code Rollback**
   ```bash
   # Revert to previous version
   git reset --hard HEAD^
   git push -f origin main
   
   # Rebuild and restart
   npm install
   npm run build
   pm2 restart strapi
   ```

## Monitoring

### Frontend Monitoring
- Hostinger Analytics
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring

### Backend Monitoring
- Server resources (CPU, memory, disk)
- API response times
- Database performance
- Error logs

## Security Measures

### SSL/TLS
- Auto-renewal with Let's Encrypt
- Force HTTPS
- HSTS enabled

### Firewall
- UFW configuration
- Rate limiting
- DDoS protection

### Access Control
- JWT authentication
- Role-based permissions
- API key management

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment steps
```

## Incident Response

### Response Steps
1. Identify the issue
2. Assess impact
3. Implement fix
4. Monitor resolution
5. Document incident

### Communication Plan
1. Internal notification
2. Status page update
3. User communication
4. Post-mortem report

## Revision History
- **Date:** 2025-01-11
- **Description:** Initial deployment strategy documentation
- **Author:** AI
