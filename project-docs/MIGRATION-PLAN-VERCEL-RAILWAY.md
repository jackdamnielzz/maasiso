
# MaasISO Migration Plan: Hostinger VPS → Vercel + Railway

**Document Version:** 1.1 (ISO Selector included)  
**Date:** December 10, 2025  
**Status:** Ready for execution  
**Urgency:** 🔴 HIGH (Backend VPS expires December 17, 2025)

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Essentials](#pre-migration-essentials)
3. [Phase 1: Backup & Groundwork](#phase-1-backup--groundwork)
4. [Phase 2: Cloudinary Media Storage Integration](#phase-2-cloudinary-media-storage-integration)
5. [Phase 3: Railway Deployment](#phase-3-railway-deployment)
6. [Phase 4: Vercel Deployment](#phase-4-vercel-deployment)
7. [Phase 5: DNS Migration](#phase-5-dns-migration)
8. [Phase 6: Post-Launch Testing](#phase-6-post-launch-testing)
9. [Phase 7: Cleanup & Documentation](#phase-7-cleanup--documentation)
10. [Rollback Contingency Plan](#rollback-contingency-plan)
11. [Support & Resources](#support--resources)
12. [Migration Checklist Summary](#migration-checklist-summary)

---

## Overview

### Current Situation

| Component | Hosting | IP/URL | Status |
|-----------|---------|--------|--------|
| Frontend (Next.js) | Hostinger VPS | 147.93.62.188 / maasiso.nl | ⚠️ Offline after security incident |
| Backend (Strapi) | Hostinger VPS | 153.92.223.23 / strapicms.maasiso.cloud | ⚠️ Offline, expires 17 Dec |
| ISO Selector | Hostinger VPS | 147.93.62.188 / maasiso.nl:3001 | ⚠️ Offline after security incident |
| Database | PostgreSQL on backend VPS | localhost:5432 | ⚠️ Must be exported |
| Media uploads | Filesystem on backend VPS | /public/uploads | ⚠️ Must go to cloud storage |

### Target Situation

| Component | Hosting | Estimated Cost |
|-----------|---------|----------------|
| Frontend (Next.js) | Vercel | 💰 Free (hobby tier) |
| Backend (Strapi) | Railway | 💰 ~€10-15/month |
| ISO Selector | Railway | 💰 Included in Railway usage |
| Database | Railway PostgreSQL | 💰 Included |
| Media uploads | Cloudinary or AWS S3 | 💰 Free tier / ~€5/month |

### Migration Timeline

| Day | Activity | Duration |
|-----|----------|----------|
| **Day 1** | Backups, account creation, cloud storage setup | 4-6 hours |
| **Day 2** | Railway deployment Strapi & ISO Selector, database migration | 6-8 hours |
| **Day 3** | Vercel deployment frontend, integration testing | 4-6 hours |
| **Day 4** | DNS migration, monitoring, go-live | 2-4 hours |
| **Day 5** | Validation, decommission old servers | 2-3 hours |

**Total Estimated Time:** 18-27 hours over 5 days

---

## Pre-Migration Essentials

### Account Provisioning

- [ ] **Vercel Account**
  - Sign up at [vercel.com](https://vercel.com)
  - Connect GitHub repository
  - Verify email and enable 2FA

- [ ] **Railway Account**
  - Sign up at [railway.app](https://railway.app)
  - Connect GitHub repository
  - Add payment method (required even for free tier)

- [ ] **Cloudinary Account**
  - Sign up at [cloudinary.com](https://cloudinary.com)
  - Note: Cloud Name, API Key, API Secret
  - Enable auto-upload folder

### Access Requirements

- [ ] SSH access to both VPS servers (147.93.62.188 and 153.92.223.23)
- [ ] Database credentials for PostgreSQL
- [ ] Strapi admin credentials
- [ ] Domain registrar access (for DNS changes)
- [ ] GitHub repository access

### Local Development Toolkit

Install required CLI tools:

```bash
# Vercel CLI
npm install -g vercel

# Railway CLI
npm install -g @railway/cli

# Cloudinary CLI (optional but helpful)
npm install -g cloudinary-cli
```

---

## Phase 1: Backup & Groundwork

### 1.1 PostgreSQL Database Export

**Connect to backend VPS:**

```bash
ssh root@153.92.223.23
```

**Export database:**

```bash
# Navigate to backup directory
cd /root/backups

# Create timestamped backup
pg_dump -U strapi_user -d strapi_db -F c -b -v -f "strapi_backup_$(date +%Y%m%d_%H%M%S).backup"

# Create SQL dump as well (for easier inspection)
pg_dump -U strapi_user -d strapi_db > "strapi_backup_$(date +%Y%m%d_%H%M%S).sql"

# Verify backup file
ls -lh strapi_backup_*.backup
```

**Download backup to local machine:**

```bash
# From your local machine
scp root@153.92.223.23:/root/backups/strapi_backup_*.backup ./backups/
scp root@153.92.223.23:/root/backups/strapi_backup_*.sql ./backups/
```

### 1.2 Media Uploads Archival

**Create archive of uploads directory:**

```bash
# On backend VPS
cd /var/www/strapi
tar -czf /root/backups/strapi_uploads_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/

# Verify archive
ls -lh /root/backups/strapi_uploads_*.tar.gz
```

**Download to local machine:**

```bash
# From your local machine
scp root@153.92.223.23:/root/backups/strapi_uploads_*.tar.gz ./backups/
```

### 1.3 Environment Variables Documentation

**Extract current environment variables:**

```bash
# On backend VPS
cd /var/www/strapi
cat .env > /root/backups/strapi_env_backup.txt

# Download to local
scp root@153.92.223.23:/root/backups/strapi_env_backup.txt ./backups/
```

**Document critical variables:**

Create a local file `migration-env-vars.md` with:

```markdown
# Environment Variables Mapping

## Strapi Backend
- DATABASE_CLIENT=postgres
- DATABASE_HOST=<Railway PostgreSQL host>
- DATABASE_PORT=<Railway PostgreSQL port>
- DATABASE_NAME=<Railway database name>
- DATABASE_USERNAME=<Railway username>
- DATABASE_PASSWORD=<Railway password>
- DATABASE_SSL=true
- JWT_SECRET=<keep existing or regenerate>
- ADMIN_JWT_SECRET=<keep existing or regenerate>
- APP_KEYS=<keep existing>
- API_TOKEN_SALT=<keep existing>
- TRANSFER_TOKEN_SALT=<keep existing>
- CLOUDINARY_NAME=<from Cloudinary dashboard>
- CLOUDINARY_KEY=<from Cloudinary dashboard>
- CLOUDINARY_SECRET=<from Cloudinary dashboard>
- NODE_ENV=production
- HOST=0.0.0.0
- PORT=1337

## Frontend (Next.js)
- NEXT_PUBLIC_STRAPI_URL=<Railway Strapi URL>
- NEXT_PUBLIC_SITE_URL=https://maasiso.nl
- STRAPI_API_TOKEN=<from Strapi admin>

## ISO Selector
- STRAPI_URL=<Railway Strapi URL>
- STRAPI_API_TOKEN=<from Strapi admin>
- PORT=3001
```

### 1.4 Codebase Verification

**Verify ISO Selector project location:**

```bash
# Check if ISO Selector exists
cd D:\Programmeren\MaasISO\saasapps\iso_norm_selector_maasiso
ls -la

# Verify package.json and dependencies
cat package.json
```

**Ensure Git repositories are clean:**

```bash
# Main MaasISO project
cd "D:\Programmeren\MaasISO\New without errors\maasiso - Copy (2)"
git status
git add .
git commit -m "Pre-migration checkpoint"
git push

# ISO Selector project
cd D:\Programmeren\MaasISO\saasapps\iso_norm_selector_maasiso
git status
git add .
git commit -m "Pre-migration checkpoint"
git push
```

---

## Phase 2: Cloudinary Media Storage Integration

### 2.1 Cloudinary Account Configuration

1. **Sign up at [cloudinary.com](https://cloudinary.com)**
2. **Navigate to Dashboard → Settings**
3. **Note your credentials:**
   - Cloud Name: `your-cloud-name`
   - API Key: `your-api-key`
   - API Secret: `your-api-secret`

### 2.2 Install Strapi Cloudinary Provider

**In your local Strapi project:**

```bash
cd /path/to/strapi-backend
npm install @strapi/provider-upload-cloudinary
```

### 2.3 Configure Cloudinary Plugin

**Create/update `config/plugins.js`:**

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

### 2.4 Migrate Existing Media to Cloudinary

**Option A: Using Cloudinary CLI**

```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Configure CLI
cloudinary config:set cloud_name=your-cloud-name api_key=your-api-key api_secret=your-api-secret

# Upload entire uploads directory
cloudinary uploader:upload_dir ./backups/uploads/ --folder strapi-uploads
```

**Option B: Using Node.js Script**

Create `migrate-media.js`:

```javascript
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});

async function uploadDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await uploadDirectory(filePath);
    } else {
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'strapi-uploads',
          resource_type: 'auto'
        });
        console.log(`Uploaded: ${file} → ${result.secure_url}`);
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error);
      }
    }
  }
}

uploadDirectory('./backups/uploads');
```

Run the script:

```bash
node migrate-media.js
```

---

## Phase 3: Railway Deployment

### 3.1 Initialize Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway init

# Link to existing project (if already created in Railway dashboard)
railway link
```

### 3.2 Create PostgreSQL Database

**Via Railway Dashboard:**

1. Go to your Railway project
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for provisioning (2-3 minutes)
4. Note the connection details from "Connect" tab

**Via Railway CLI:**

```bash
railway add --database postgresql
```

### 3.3 Deploy Strapi Backend

**Set environment variables in Railway:**

```bash
# Set all required variables
railway variables set DATABASE_CLIENT=postgres
railway variables set DATABASE_HOST=${{PGHOST}}
railway variables set DATABASE_PORT=${{PGPORT}}
railway variables set DATABASE_NAME=${{PGDATABASE}}
railway variables set DATABASE_USERNAME=${{PGUSER}}
railway variables set DATABASE_PASSWORD=${{PGPASSWORD}}
railway variables set DATABASE_SSL=true
railway variables set JWT_SECRET=<your-jwt-secret>
railway variables set ADMIN_JWT_SECRET=<your-admin-jwt-secret>
railway variables set APP_KEYS=<your-app-keys>
railway variables set API_TOKEN_SALT=<your-api-token-salt>
railway variables set TRANSFER_TOKEN_SALT=<your-transfer-token-salt>
railway variables set CLOUDINARY_NAME=<your-cloudinary-name>
railway variables set CLOUDINARY_KEY=<your-cloudinary-key>
railway variables set CLOUDINARY_SECRET=<your-cloudinary-secret>
railway variables set NODE_ENV=production
railway variables set HOST=0.0.0.0
railway variables set PORT=1337
```

**Deploy Strapi:**

```bash
# From Strapi project directory
railway up
```

**Or configure via `railway.json`:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3.4 Deploy ISO Selector

**Create separate Railway service:**

```bash
# Navigate to ISO Selector project
cd D:\Programmeren\MaasISO\saasapps\iso_norm_selector_maasiso

# Initialize Railway for this service
railway init

# Set environment variables
railway variables set STRAPI_URL=<railway-strapi-url>
railway variables set STRAPI_API_TOKEN=<strapi-api-token>
railway variables set PORT=3001
railway variables set NODE_ENV=production

# Deploy
railway up
```

**Or add as service in existing Railway project:**

1. In Railway dashboard, click "New" → "GitHub Repo"
2. Select ISO Selector repository
3. Configure environment variables
4. Deploy

### 3.5 Import Database to Railway

**Get Railway PostgreSQL connection string:**

```bash
railway variables get DATABASE_URL
```

**Import database from local backup:**

```bash
# Using pg_restore
pg_restore -h <railway-host> -p <railway-port> -U <railway-user> -d <railway-db> -v ./backups/strapi_backup_*.backup

# Or using psql for SQL dump
psql -h <railway-host> -p <railway-port> -U <railway-user> -d <railway-db> < ./backups/strapi_backup_*.sql
```

**Verify import:**

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Check tables
\dt

# Check record counts
SELECT COUNT(*) FROM strapi_administrator;
SELECT COUNT(*) FROM upload_file;
```

### 3.6 Update Media URLs in Database

**If media URLs need updating (from local paths to Cloudinary URLs):**

```sql
-- Connect to Railway database
railway connect postgres

-- Update upload_file table (adjust based on your schema)
UPDATE upload_file 
SET url = REPLACE(url, '/uploads/', 'https://res.cloudinary.com/your-cloud-name/image/upload/strapi-uploads/')
WHERE url LIKE '/uploads/%';

-- Verify changes
SELECT url FROM upload_file LIMIT 10;
```

### 3.7 Configure Custom Domains

**In Railway Dashboard:**

1. Go to your Strapi service
2. Click "Settings" → "Domains"
3. Add custom domain: `strapicms.maasiso.cloud`
4. Note the CNAME target provided by Railway

**For ISO Selector:**

1. Go to ISO Selector service
2. Add custom domain or subdomain (e.g., `iso-selector.maasiso.nl`)
3. Note the CNAME target

---

## Phase 4: Vercel Deployment

### 4.1 Initialize Vercel Project

```bash
# Navigate to frontend project
cd "D:\Programmeren\MaasISO\New without errors\maasiso - Copy (2)"

# Login to Vercel
vercel login

# Initialize project
vercel
```

**Follow prompts:**
- Link to existing project? No
- Project name: `maasiso-frontend`
- Directory: `./`
- Override settings? No

### 4.2 Configure Environment Variables

**Via Vercel CLI:**

```bash
vercel env add NEXT_PUBLIC_STRAPI_URL production
# Enter: https://strapicms.maasiso.cloud

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://maasiso.nl

vercel env add STRAPI_API_TOKEN production
# Enter: <your-strapi-api-token>
```

**Via Vercel Dashboard:**

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add all required variables for Production, Preview, and Development

### 4.3 Configure Build Settings

**Create/update `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["ams1"],
  "env": {
    "NEXT_PUBLIC_STRAPI_URL": "@strapi-url",
    "NEXT_PUBLIC_SITE_URL": "@site-url"
  }
}
```

**Ensure `next.config.js` is production-ready:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'strapicms.maasiso.cloud'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
  },
};

module.exports = nextConfig;
```

### 4.4 Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

**Monitor deployment:**

```bash
# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>
```

---

## Phase 5: DNS Migration

### 5.1 Prepare DNS Records

**Document current DNS configuration:**

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | @ | 147.93.62.188 | 3600 |
| A | www | 147.93.62.188 | 3600 |
| CNAME | strapicms | 153.92.223.23 | 3600 |

**New DNS configuration:**

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| CNAME | @ | cname.vercel-dns.com | 300 |
| CNAME | www | cname.vercel-dns.com | 300 |
| CNAME | strapicms | <railway-cname> | 300 |
| CNAME | iso-selector | <railway-cname> | 300 |

### 5.2 Configure Vercel Domain

**Via Vercel Dashboard:**

1. Go to project settings → "Domains"
2. Add domain: `maasiso.nl`
3. Add domain: `www.maasiso.nl`
4. Follow verification instructions
5. Note the CNAME target provided

**Via Vercel CLI:**

```bash
vercel domains add maasiso.nl
vercel domains add www.maasiso.nl
```

### 5.3 Configure Railway Domains

**For Strapi:**

1. Railway Dashboard → Strapi service → Settings → Domains
2. Add: `strapicms.maasiso.cloud`
3. Note CNAME target

**For ISO Selector:**

1. Railway Dashboard → ISO Selector service → Settings → Domains
2. Add: `iso-selector.maasiso.nl`
3. Note CNAME target

### 5.4 Update DNS Records

**Lower TTL first (24 hours before migration):**

```bash
# Update all DNS records to TTL=300 (5 minutes)
# This allows faster propagation during migration
```

**Update DNS records at your registrar:**

1. Login to domain registrar
2. Navigate to DNS management for `maasiso.nl`
3. Update records according to new configuration table
4. Save changes

**Verify DNS propagation:**

```bash
# Check DNS propagation
nslookup maasiso.nl
nslookup www.maasiso.nl
nslookup strapicms.maasiso.cloud

# Or use online tools
# https://dnschecker.org
```

### 5.5 SSL Certificate Verification

**Vercel automatically provisions SSL certificates**

**Verify SSL:**

```bash
# Check SSL certificate
curl -I https://maasiso.nl
curl -I https://www.maasiso.nl

# Verify Railway SSL
curl -I https://strapicms.maasiso.cloud
curl -I https://iso-selector.maasiso.nl
```

---

## Phase 6: Post-Launch Testing

### 6.1 Functional Testing Checklist

- [ ] **Homepage loads correctly**
  ```bash
  curl -I https://maasiso.nl
  ```

- [ ] **Strapi admin accessible**
  - Navigate to: `https://strapicms.maasiso.cloud/admin`
  - Login with admin credentials
  - Verify dashboard loads

- [ ] **ISO Selector functional**
  - Navigate to: `https://iso-selector.maasiso.nl`
  - Test ISO selection functionality
  - Verify data loads from Strapi

- [ ] **Content API endpoints working**
  ```bash
  curl https://strapicms.maasiso.cloud/api/diensten
  curl https://strapicms.maasiso.cloud/api/blog-posts
  ```

- [ ] **Media files loading from Cloudinary**
  - Check image URLs in browser DevTools
  - Verify images display correctly
  - Test image optimization

- [ ] **Forms and contact functionality**
  - Test contact form submission
  - Verify email notifications

- [ ] **Navigation and routing**
  - Test all menu links
  - Verify internal page navigation
  - Check 404 handling

### 6.2 Performance Audit

**Run Lighthouse audit:**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://maasiso.nl --output html --output-path ./audit-report.html
```

**Target metrics:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

**Check Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 6.3 Strapi Admin Validation

- [ ] Login to Strapi admin panel
- [ ] Verify all content types present
- [ ] Check media library (Cloudinary integration)
- [ ] Test content creation/editing
- [ ] Verify API tokens working
- [ ] Check user roles and permissions

### 6.4 Monitoring Setup

**Vercel Analytics:**
- Enable in Vercel dashboard
- Monitor real-time traffic
- Track Web Vitals

**Railway Metrics:**
- Monitor CPU/Memory usage
- Check database connections
- Review application logs

**Set up alerts:**

```bash
# Vercel CLI - enable notifications
vercel notifications enable

# Railway - configure alerts in dashboard
# Settings → Notifications → Add webhook/email
```

---

## Phase 7: Cleanup & Documentation

### 7.1 Decommission Legacy Servers

**⚠️ Only after 48-72 hours of successful operation**

**Frontend VPS (147.93.62.188):**

```bash
# SSH into server
ssh root@147.93.62.188

# Stop services
pm2 stop all
systemctl stop nginx

# Create final backup
tar -czf /root/final-backup-$(date +%Y%m%d).tar.gz /var/www/

# Download backup
# (from local machine)
scp root@147.93.62.188:/root/final-backup-*.tar.gz ./backups/
```

**Backend VPS (153.92.223.23):**

```bash
# SSH into server
ssh root@153.92.223.23

# Stop Strapi
pm2 stop strapi

# Final database backup
pg_dump -U strapi_user -d strapi_db > /root/final-db-backup-$(date +%Y%m%d).sql

# Download backup
# (from local machine)
scp root@153.92.223.23:/root/final-db-backup-*.sql ./backups/
```

**Cancel VPS subscriptions:**
- Login to Hostinger account
- Navigate to VPS management
- Cancel both VPS instances
- Confirm cancellation

### 7.2 Update Documentation

**Update project README:**

```markdown
# MaasISO - Production Deployment

## Infrastructure

- **Frontend:** Vercel (https://maasiso.nl)
- **Backend:** Railway (https://strapicms.maasiso.cloud)
- **ISO Selector:** Railway (https://iso-selector.maasiso.nl)
- **Database:** Railway PostgreSQL
- **Media Storage:** Cloudinary

## Deployment

### Frontend
```bash
vercel --prod
```

### Backend
```bash
railway up
```

## Environment Variables

See `.env.example` for required variables.
```

**Create deployment guide:**

Create `docs/DEPLOYMENT.md` with:
- Deployment procedures
- Environment variable reference
- Troubleshooting guide
- Rollback procedures

**Update team documentation:**
- Share new URLs with team
- Update bookmarks
- Update API documentation
- Update monitoring dashboards

### 7.3 Archive Migration Documentation

```bash
# Create migration archive
mkdir -p ./migration-archive
cp -r ./backups ./migration-archive/
cp ./migration-env-vars.md ./migration-archive/
cp ./project-docs/MIGRATION-PLAN-VERCEL-RAILWAY.md ./migration-archive/

# Create archive
tar -czf migration-archive-$(date +%Y%m%d).tar.gz ./migration-archive/

# Store securely (external backup)
```

---

## Rollback Contingency Plan

### Scenario 1: Critical Issues Within First 24 Hours

**If major issues occur immediately after DNS switch:**

1. **Revert DNS records to old VPS IPs**
   ```bash
   # Update DNS back to:
   # A @ 147.93.62.188
   # A www 147.93.62.188
   # CNAME strapicms 153.92.223.23
   ```

2. **Restart services on old VPS**
   ```bash
   # Frontend VPS
   ssh root@147.93.62.188
   pm2 restart all
   systemctl restart nginx
   
   # Backend VPS
   ssh root@153.92.223.23
   pm2 restart strapi
   ```

3. **Wait for DNS propagation (5-30 minutes with low TTL)**

### Scenario 2: Database Issues

**If database corruption or data loss:**

1. **Restore from backup to Railway**
   ```bash
   pg_restore -h <railway-host> -p <railway-port> -U <railway-user> -d <railway-db> --clean -v ./backups/strapi_backup_*.backup
   ```

2. **Restart Strapi service**
   ```bash
   railway restart
   ```

### Scenario 3: Performance Issues

**If performance is unacceptable:**

1. **Scale Railway resources**
   - Upgrade to higher tier plan
   - Increase database resources

2. **Optimize Vercel deployment**
   - Review build configuration
   - Enable edge caching
   - Optimize images

3. **If issues persist, consider hybrid approach:**
   - Keep frontend on Vercel
   - Move backend to dedicated hosting

### Emergency Contacts

- **Vercel Support:** support@vercel.com
- **Railway Support:** team@railway.app
- **Cloudinary Support:** support@cloudinary.com

---

## Support & Resources

### Documentation Links

**Vercel:**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

**Railway:**
- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Environment Variables](https://docs.railway.app/develop/variables)

**Strapi:**
- [Strapi Deployment](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html)
- [Cloudinary Provider](https://market.strapi.io/providers/@strapi-provider-upload-cloudinary)
- [Database Migration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html)

**Cloudinary:**
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)

### Community Resources

- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Railway Discord](https://discord.gg/railway)
- [Strapi Discord](https://discord.strapi.io)

---

## Migration Checklist Summary

### Pre-Migration (Day 1)

- [ ] Create Vercel account and connect GitHub
- [ ] Create Railway account and add payment method
- [ ] Create Cloudinary account and note credentials
- [ ] Install CLI tools (Vercel, Railway, Cloudinary)
- [ ] Export PostgreSQL database from VPS
- [ ] Archive media uploads directory
- [ ] Document all environment variables
- [ ] Verify codebase and commit to Git
- [ ] Create local backups directory

### Phase 1: Backup & Groundwork (Day 1)

- [ ] PostgreSQL database exported successfully
- [ ] Media uploads archived and downloaded
- [ ] Environment variables documented
- [ ] All backups stored locally and securely
- [ ] Git repositories up to date

### Phase 2: Cloudinary Setup (Day 1-2)

- [ ] Cloudinary account configured
- [ ] Strapi Cloudinary provider installed
- [ ] Plugin configuration updated
- [ ] Media files uploaded to Cloudinary
- [ ] Media URLs verified

### Phase 3: Railway Deployment (Day 2)

- [ ] Railway project initialized
- [ ] PostgreSQL database created on Railway
- [ ] Strapi environment variables configured
- [ ] Strapi deployed to Railway
- [ ] ISO Selector deployed to Railway
- [ ] Database imported successfully
- [ ] Media URLs updated in database
- [ ] Custom domains configured
- [ ] Strapi admin accessible

### Phase 4: Vercel Deployment (Day 3)

- [ ] Vercel project initialized
- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Frontend deployed to Vercel
- [ ] Deployment successful
- [ ] Preview URL tested

### Phase 5: DNS Migration (Day 4)

- [ ] Current DNS records documented
- [ ] TTL lowered 24 hours before migration
- [ ] Vercel domain configured
- [ ] Railway domains configured
- [ ] DNS records updated at registrar
- [ ] DNS propagation verified
- [ ] SSL certificates active

### Phase 6: Testing (Day 4)

- [ ] Homepage loads