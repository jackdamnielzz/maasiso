# MaasISO Migration Handover Document

**Document Version:** 1.0  
**Created:** December 11, 2025  
**Last Updated:** December 11, 2025  
**Status:** In Progress - Phase 3  
**Language:** All communication and documentation must be in **English**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Background](#project-background)
3. [Current Infrastructure](#current-infrastructure)
4. [Target Infrastructure](#target-infrastructure)
5. [Security Incident Summary](#security-incident-summary)
6. [Account Credentials & Access](#account-credentials--access)
7. [Completed Work](#completed-work)
8. [Available Backups](#available-backups)
9. [Safe Migration Strategy](#safe-migration-strategy)
10. [Remaining Tasks](#remaining-tasks)
11. [Step-by-Step Instructions](#step-by-step-instructions)
12. [Important Files & Locations](#important-files--locations)
13. [Rollback Plan](#rollback-plan)
14. [Contact Information](#contact-information)

---

## Executive Summary

MaasISO is migrating from compromised Hostinger VPS servers to a modern cloud infrastructure using:
- **Frontend:** Vercel (free tier)
- **Backend (Strapi CMS):** Railway (~€10-15/month)
- **Media Storage:** Cloudinary (free tier)

**Critical Deadline:** Backend VPS expires **December 17, 2025** (6 days remaining)

**Current Status:** Phase 2 complete. Backups downloaded. Ready for Phase 3 (Railway deployment).

---

## Project Background

### What is MaasISO?

MaasISO is an ISO certification consultancy website built with:
- **Frontend:** Next.js 14 (React)
- **Backend CMS:** Strapi v4
- **Database:** PostgreSQL
- **Additional Tool:** ISO Selector (separate Next.js app)

### Why Migration?

1. **Security Incident:** VPS servers were infected with cryptocurrency mining malware (December 5-10, 2025)
2. **VPS Expiration:** Backend VPS expires December 17, 2025
3. **Cost Reduction:** Moving to managed services reduces maintenance overhead
4. **Security:** Fresh installation eliminates potential backdoors

---

## Current Infrastructure

### VPS 1: Frontend Server (COMPROMISED)
| Property | Value |
|----------|-------|
| IP Address | 147.93.62.188 |
| Provider | Hostinger VPS |
| OS | Ubuntu 22.04 LTS |
| Status | ⚠️ Was infected, cleaned, but potentially has backdoors |
| Expires | January 7, 2026 |
| Services | Nginx, Next.js (port 3000), ISO Selector (port 3001) |

### VPS 2: Backend Server (CLEAN - but untrusted)
| Property | Value |
|----------|-------|
| IP Address | 153.92.223.23 |
| Domain | strapicms.maasiso.cloud |
| Provider | Hostinger VPS |
| OS | Ubuntu 22.04 LTS |
| Status | ✅ ClamAV scan: 0 infected files, BUT firewall was inactive during attack period |
| Expires | **December 17, 2025** ⚠️ CRITICAL |
| Services | Nginx, Strapi (port 1337), PostgreSQL (port 5432) |

### Domains
| Domain | Current Target | Purpose |
|--------|----------------|---------|
| maasiso.nl | 147.93.62.188 | Main website |
| www.maasiso.nl | 147.93.62.188 | Main website |
| strapicms.maasiso.cloud | 153.92.223.23 | Strapi API |

---

## Target Infrastructure

| Component | Service | URL | Cost |
|-----------|---------|-----|------|
| Frontend | Vercel | maasiso.nl | Free |
| Backend | Railway | strapicms.maasiso.cloud | ~€10-15/mo |
| Database | Railway PostgreSQL | (internal) | Included |
| Media | Cloudinary | res.cloudinary.com | Free tier |
| ISO Selector | Railway | iso-selector.maasiso.nl | Included |

---

## Security Incident Summary

### Timeline
| Date | Event |
|------|-------|
| December 5 | Malware first installed on Frontend VPS |
| December 8 | XMRig cryptocurrency miner deployed |
| December 9 | Incident discovered, initial cleanup |
| December 9 | Nginx redirecting to xss.pro (hacking forum) |
| December 10 | REINFECTION discovered - malware returned |
| December 10 | UFW firewall found INACTIVE on BOTH servers |
| December 10 | Root passwords changed, servers stopped |
| December 11 | Backups created for migration |

### Key Findings
1. **Frontend VPS:** Multiple malware files found in Next.js directory
2. **Backend VPS:** ClamAV scan showed 0 infected files
3. **Critical Issue:** UFW firewall was INACTIVE, allowing unrestricted access
4. **Unknown:** Attack vector never definitively identified (SSH brute force suspected)

### Security Decision
Due to the uncertainty about remaining backdoors:
- ❌ **DO NOT** use code backups from VPS
- ❌ **DO NOT** restore Hostinger snapshots
- ✅ **DO** use database dump (pure SQL data)
- ✅ **DO** use media files (after antivirus scan)
- ✅ **DO** install FRESH Strapi on Railway

---

## Account Credentials & Access

### Railway
- **URL:** [railway.app](https://railway.app)
- **Plan:** Hobby (usage-based billing)
- **Login:** GitHub OAuth
- **Status:** ✅ Ready

### Vercel
- **URL:** [vercel.com](https://vercel.com)
- **Plan:** Hobby (free)
- **Login:** GitHub OAuth
- **Status:** ✅ Ready

### Cloudinary
- **URL:** [cloudinary.com](https://cloudinary.com)
- **Cloud Name:** `dseckqnba`
- **API Key:** `888487219281111`
- **API Secret:** `PhKNfi5R4jnjVF2j5PUPXRSZr3E`
- **Status:** ✅ Ready

⚠️ **Security Note:** Consider regenerating these Cloudinary credentials after migration is complete.

### Hostinger
- **URL:** [hpanel.hostinger.com](https://hpanel.hostinger.com)
- **VPS Access:** SSH key-based authentication
- **Status:** VPS servers currently running (restarted December 11, 2025)

### GitHub Repository
- **Repository:** Contains frontend code
- **Status:** ✅ Clean (local development, never compromised)

---

## Completed Work

### ✅ Phase 1: Account Setup (DONE)
- [x] Vercel account verified
- [x] Railway account created and upgraded to Hobby plan
- [x] Cloudinary account created and credentials obtained
- [x] GitHub repository confirmed

### ✅ Phase 2: Backup Creation (DONE - December 11, 2025)

**Commands executed on Backend VPS (153.92.223.23):**

```bash
# Database backup
cd /tmp && sudo -u postgres pg_dump strapi_db -F c -f strapi_db_backup_20251211.backup

# Media uploads backup
tar -czf strapi-uploads-20251211.tar.gz -C /var/www/strapi/public uploads

# Strapi code backup (NOT TO BE USED - for archive only)
tar --exclude='node_modules' --exclude='.cache' --exclude='.tmp' --exclude='build' \
    -czf strapi-code-20251211.tar.gz -C /var/www strapi
```

**Files downloaded to local machine:**
```bash
scp root@153.92.223.23:/tmp/strapi_db_backup_20251211.backup ./backups/
scp root@153.92.223.23:/tmp/strapi-uploads-20251211.tar.gz ./backups/
scp root@153.92.223.23:/tmp/strapi-code-20251211.tar.gz ./backups/
```

---

## Available Backups

**Location:** `./backups/` directory in project root

| File | Size | Created | Safe to Use |
|------|------|---------|-------------|
| `strapi_db_backup_20251211.backup` | 676 KB | Dec 11, 2025 | ✅ YES |
| `strapi-uploads-20251211.tar.gz` | 98 MB | Dec 11, 2025 | ⚠️ SCAN FIRST |
| `strapi-code-20251211.tar.gz` | 118 MB | Dec 11, 2025 | ❌ DO NOT USE |
| `strapi-env-backup-20251210.txt` | ~2 KB | Dec 10, 2025 | ✅ YES (reference) |
| `strapi_backup_20251210.backup` | ~670 KB | Dec 10, 2025 | ✅ YES (older backup) |
| `strapi_uploads_20251210.tar.gz` | ~98 MB | Dec 10, 2025 | ⚠️ SCAN FIRST |

### Hostinger Backups (DO NOT USE)
These were created during the attack period and may contain malware:
- Backend VPS auto-backup: December 7, 2025
- Backend VPS snapshot: December 10, 2025
- Frontend VPS auto-backup: December 5, 2025
- Frontend VPS snapshot: December 10, 2025

---

## Safe Migration Strategy

### What to USE:
| Item | Source | Reason |
|------|--------|--------|
| Database dump | `strapi_db_backup_20251211.backup` | Pure SQL text - cannot contain executables |
| Media files | `strapi-uploads-20251211.tar.gz` | After local antivirus scan |
| ENV reference | `strapi-env-backup-20251210.txt` | For configuration values |
| Frontend code | Local Git repository | Never touched VPS |
| ISO Selector code | Local folder | Never touched VPS |

### What NOT to USE:
| Item | Reason |
|------|--------|
| Strapi code backup | Could contain backdoors |
| Hostinger VPS snapshots | Created during attack period |
| Any executable files from VPS | Potential malware |

### Strategy:
1. Install **FRESH** Strapi v4 on Railway
2. Import **only the database** (content data)
3. **Scan** media files locally, then upload to Cloudinary
4. Deploy frontend from **local Git repository**

---

## Remaining Tasks

### Phase 3: Railway Deployment (NEXT)
- [ ] Create new Railway project
- [ ] Add PostgreSQL database service
- [ ] Create new Strapi project (fresh installation)
- [ ] Configure Strapi environment variables
- [ ] Import database backup
- [ ] Configure Cloudinary upload provider
- [ ] Deploy Strapi to Railway
- [ ] Verify Strapi admin panel works
- [ ] Deploy ISO Selector to Railway (optional - can remain separate)

### Phase 4: Cloudinary Media Migration
- [ ] Extract `strapi-uploads-20251211.tar.gz` locally
- [ ] Scan extracted files with Windows Defender/ClamAV
- [ ] Install Cloudinary CLI or use upload script
- [ ] Upload media files to Cloudinary
- [ ] Update media URLs in database (SQL update)
- [ ] Verify images display correctly

### Phase 5: Vercel Frontend Deployment
- [ ] Update `NEXT_PUBLIC_STRAPI_URL` to Railway URL
- [ ] Configure Vercel environment variables
- [ ] Deploy frontend to Vercel
- [ ] Test all pages and API connections
- [ ] Verify images load from Cloudinary

### Phase 6: DNS Migration
- [ ] Add `maasiso.nl` domain to Vercel
- [ ] Add `strapicms.maasiso.cloud` to Railway
- [ ] Lower DNS TTL to 300 seconds
- [ ] Update DNS records:
  - `maasiso.nl` → Vercel CNAME
  - `www.maasiso.nl` → Vercel CNAME
  - `strapicms.maasiso.cloud` → Railway CNAME
- [ ] Verify SSL certificates active
- [ ] Test live site

### Phase 7: Cleanup & Documentation
- [ ] Monitor new infrastructure for 48-72 hours
- [ ] Stop VPS servers via Hostinger
- [ ] Cancel VPS subscriptions
- [ ] Update project documentation
- [ ] Archive migration files

---

## Step-by-Step Instructions

### Step 3.1: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
# Choose: "Empty Project"
# Name: "maasiso-backend"
```

### Step 3.2: Create PostgreSQL Database

**Via Railway Dashboard (recommended):**
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Open your project
3. Click "New" → "Database" → "PostgreSQL"
4. Wait for provisioning (~2 minutes)
5. Click the database → "Connect" tab
6. Note the connection details

### Step 3.3: Import Database

```bash
# Get Railway PostgreSQL connection string
railway variables get DATABASE_URL

# Import database (replace values with Railway credentials)
pg_restore -h <RAILWAY_HOST> -p <RAILWAY_PORT> -U <RAILWAY_USER> -d <RAILWAY_DB> \
    --no-owner --no-privileges -v ./backups/strapi_db_backup_20251211.backup
```

### Step 3.4: Create Fresh Strapi Project

```bash
# Create new Strapi project
npx create-strapi-app@latest maasiso-strapi --quickstart --no-run

cd maasiso-strapi

# Install PostgreSQL client
npm install pg

# Install Cloudinary provider
npm install @strapi/provider-upload-cloudinary
```

### Step 3.5: Configure Strapi

**config/database.js:**
```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: false } : false,
    },
  },
});
```

**config/plugins.js:**
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

### Step 3.6: Set Railway Environment Variables

```bash
railway variables set DATABASE_CLIENT=postgres
railway variables set DATABASE_HOST=${{Postgres.PGHOST}}
railway variables set DATABASE_PORT=${{Postgres.PGPORT}}
railway variables set DATABASE_NAME=${{Postgres.PGDATABASE}}
railway variables set DATABASE_USERNAME=${{Postgres.PGUSER}}
railway variables set DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
railway variables set DATABASE_SSL=true
railway variables set NODE_ENV=production
railway variables set HOST=0.0.0.0
railway variables set PORT=1337
railway variables set APP_KEYS="<generate-new-keys>"
railway variables set API_TOKEN_SALT="<generate-new-salt>"
railway variables set ADMIN_JWT_SECRET="<generate-new-secret>"
railway variables set JWT_SECRET="<generate-new-secret>"
railway variables set TRANSFER_TOKEN_SALT="<generate-new-salt>"
railway variables set CLOUDINARY_NAME=dseckqnba
railway variables set CLOUDINARY_KEY=888487219281111
railway variables set CLOUDINARY_SECRET=PhKNfi5R4jnjVF2j5PUPXRSZr3E
```

### Step 3.7: Deploy Strapi to Railway

```bash
# From Strapi project directory
railway up
```

### Step 4: Media Migration

```bash
# Extract media locally
mkdir -p ./uploads-temp
tar -xzf ./backups/strapi-uploads-20251211.tar.gz -C ./uploads-temp

# SCAN WITH ANTIVIRUS BEFORE PROCEEDING
# Windows: Right-click folder → Scan with Microsoft Defender

# Upload to Cloudinary (using CLI)
npm install -g cloudinary-cli
cloudinary config:set cloud_name=dseckqnba api_key=888487219281111 api_secret=PhKNfi5R4jnjVF2j5PUPXRSZr3E
cloudinary uploader:upload_dir ./uploads-temp/uploads --folder strapi-uploads
```

### Step 5: Vercel Deployment

```bash
# From frontend project directory
cd "D:\Programmeren\MaasISO\New without errors\maasiso - Copy (2)"

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_STRAPI_URL production
# Enter: https://your-railway-url.railway.app

vercel env add STRAPI_API_TOKEN production
# Enter: <token from Strapi admin>

# Deploy to production
vercel --prod
```

### Step 6: DNS Migration

**Update DNS records at domain registrar:**

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |
| CNAME | strapicms | <railway-provided-cname> |

**Verify:**
```bash
nslookup maasiso.nl
nslookup strapicms.maasiso.cloud
```

---

## Important Files & Locations

### Local Project Structure
```
D:\Programmeren\MaasISO\New without errors\maasiso - Copy (2)\
├── backups/
│   ├── strapi_db_backup_20251211.backup    # ✅ Database backup
│   ├── strapi-uploads-20251211.tar.gz       # ⚠️ Media (scan first)
│   ├── strapi-code-20251211.tar.gz          # ❌ Do not use
│   └── strapi-env-backup-20251210.txt       # ✅ ENV reference
├── project-docs/
│   ├── MIGRATION-PLAN-VERCEL-RAILWAY.md     # Original plan
│   └── MIGRATION-HANDOVER-DOCUMENT.md       # This document
├── logs/
│   ├── COMPLETE-SECURITY-INCIDENT-REPORT-2025-12-09-10.md
│   └── SECURITY-SCAN-REPORT-20251210.md
├── app/                                      # Next.js frontend
├── src/                                      # Source code
└── ...
```

### ISO Selector Location
```
D:\Programmeren\MaasISO\saasapps\iso_norm_selector_maasiso\
```

### Reference Documentation
- [`project-docs/MIGRATION-PLAN-VERCEL-RAILWAY.md`](./MIGRATION-PLAN-VERCEL-RAILWAY.md) - Original detailed plan
- [`logs/COMPLETE-SECURITY-INCIDENT-REPORT-2025-12-09-10.md`](../logs/COMPLETE-SECURITY-INCIDENT-REPORT-2025-12-09-10.md) - Security incident details
- [`logs/SECURITY-SCAN-REPORT-20251210.md`](../logs/SECURITY-SCAN-REPORT-20251210.md) - Malware scan results

---

## Rollback Plan

### If Railway deployment fails:
1. Hostinger VPS is still running
2. Can temporarily restart services on VPS
3. Backend VPS expires December 17 - must resolve before then

### If database import fails:
1. Multiple backup files available (Dec 10 and Dec 11)
2. Hostinger auto-backups available (last resort - may contain issues)

### If DNS migration fails:
1. Keep old DNS records ready to revert
2. TTL lowered to 300 seconds allows quick rollback
3. Can point back to VPS IPs temporarily

---

## Contact Information

### Project Owner
- **Name:** Niels Maas
- **Email:** niels.maas@maasiso.nl
- **Alternative:** niels_maas@hotmail.com
- **Phone:** +31623578344

### Service Support
- **Vercel:** support@vercel.com
- **Railway:** team@railway.app
- **Cloudinary:** support@cloudinary.com
- **Hostinger:** Via hPanel support tickets

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 11, 2025 | AI Assistant | Initial handover document |

---

**END OF DOCUMENT**

*All communication from the AI assistant will remain in English regardless of user input language.*