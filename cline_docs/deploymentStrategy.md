# Deployment Strategy

## Environment Overview

### Production Environment
- **Frontend:** Vercel (maasiso.nl)
- **Backend:** Self-hosted VPS (cms.maasiso.nl)
- **Database:** PostgreSQL
- **CDN:** Cloudflare (optional)

### Staging Environment
- **Frontend:** Vercel (staging.maasiso.nl)
- **Backend:** Staging VPS instance
- **Database:** Staging PostgreSQL instance
- **Purpose:** Testing and QA

### Development Environment
- **Frontend:** Local Next.js development server
- **Backend:** Local Strapi instance
- **Database:** Local PostgreSQL
- **Purpose:** Development and testing

## Deployment Process

### Frontend (Next.js on Vercel)

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
   
   # Vercel automatically deploys
   ```

3. **Post-deployment Verification**
   - Check Vercel deployment status
   - Verify site functionality
   - Run Lighthouse tests
   - Check error monitoring

### Backend (Strapi on VPS)

1. **Pre-deployment Checks**
   - Backup database
   - Test migrations
   - Verify API endpoints
   - Check environment variables

2. **Deployment Steps**
   ```bash
   # SSH into server
   ssh user@cms.maasiso.nl

   # Pull latest changes
   cd /path/to/strapi
   git pull origin main

   # Install dependencies
   npm install

   # Build Strapi
   npm run build

   # Restart PM2 process
   pm2 restart strapi
   ```

3. **Post-deployment Verification**
   - Check Strapi admin panel
   - Verify API responses
   - Monitor error logs
   - Check database migrations

## Configuration Management

### Environment Variables

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=https://cms.maasiso.nl
NEXT_PUBLIC_SITE_URL=https://maasiso.nl
```

#### Backend (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=maasiso
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
JWT_SECRET=your-secret-key
ADMIN_JWT_SECRET=your-admin-secret
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
1. Access Vercel dashboard
2. Select previous successful deployment
3. Click "Redeploy"
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
- Vercel Analytics
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
