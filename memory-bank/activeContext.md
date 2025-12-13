# Active Context - MaasISO Migration

**Last Updated:** 2025-12-13 18:19 UTC
**Current Phase:** Production availability incident: intermittent “This connection is not private” on `www.maasiso.nl` (expired TLS cert)
**Status:** Strapi Deployed to Railway ✅ LIVE ✅ Content Fixed ✅ Media Uploaded ✅ Frontend Deployed ✅ Backend-migratie naar Railway technisch afgerond ✅ **CONTENT MIGRATION COMPLETE** ✅ **CLOUDINARY URL FIX COMPLETE** ✅ **VERCEL CRITICAL.CSS FIX COMPLETE** ✅ **BLOG IMAGE POPULATE FIX COMPLETE** ✅ **BLOG IMAGE UPDATE FIX COMPLETE** ✅

---

## Current Work

### 🔧 SEO cleanup: “Noindex URLs” (Dec 12, 2025 17:04 UTC)

Goal: reduce GSC “Noindex URLs” by removing/locking down production test/diagnostic routes rather than sprinkling `noindex`.

**Approach implemented (centralized in middleware):**
- Auth-protect maintainers-only page(s) in production (currently: `/test-deploy`) using a shared secret via header/cookie:
  - Header: `x-internal-routes-secret`
  - Cookie: `internal_routes_secret`
  - Env: `INTERNAL_ROUTES_SECRET`
- Return **410 Gone** for debug/test API endpoints in production (pattern-based), so crawlers see “removed” rather than “noindex”.

Implemented in: [`middleware()`](../middleware.ts:36)

**Automated guardrail:**
- Added a script to fail CI if any blog post route code includes robots/noindex signals: [`check-blog-indexable.js`](../scripts/check-blog-indexable.js:1)
- Added npm script: [`seo:check-blog-indexable`](../package.json:5)

### ✅ SEO canonicalization: redirect + trailing-slash normalization (Dec 12, 2025 14:57 UTC)

Implemented site-wide canonical URL policy: **NO trailing slash** for all non-root pages (root stays `/`). This eliminates duplicate URL variants (“Pagina met omleiding”) and avoids redirect chains.

### ✅ Canonical tags for GSC “Dubbele pagina zonder canonieke” (Dec 12, 2025)

Added explicit canonical tags for:
- `/diensten` → `https://maasiso.nl/diensten`
- `/iso-16175` → `https://maasiso.nl/iso-16175`
- `/avg` → `https://maasiso.nl/avg`

Why: repo contains both `app/` and `src/app/`; these three URLs can be served by either static routes or the dynamic `[slug]` route depending on which tree is active. We now emit canonicals from both the static pages (where applicable) and the dynamic `[slug]` metadata.

### 🔎 HTTPS/security warning investigation + canonical host normalization (Dec 12, 2025 15:31 UTC)

- **Issue reported:** browser showed “Not secure / Advanced → proceed” for `www.maasiso.nl`.
- **Local checks (`curl.exe -vkI`):** both `maasiso.nl` and `www.maasiso.nl` resolved to `76.76.21.21` with `Server: Vercel`, returning normal HTTPS responses.
- **Code change:** added explicit canonical host normalization in [`middleware()`](../middleware.ts:36): `www.* → apex` with **301**, applying pathname de-slashing on the redirected URL.
- **Note:** takes effect after deployment; live behavior may still reflect Vercel-level redirects until deployed.

### 🚨 TLS incident reproduced: `www.maasiso.nl` serves expired certificate (Dec 13, 2025 10:53 UTC)

- **Observed user error (iOS Safari):** “Deze verbinding is niet privé” for `https://www.maasiso.nl`.
- **Local reproduction:** [`site:diagnose:maasiso`](../package.json:5) shows:
  - `maasiso.nl`: TLS OK (Let’s Encrypt R12), valid_to `Mar 11 2026`
  - `www.maasiso.nl`: **TLS FAIL** `CERT_HAS_EXPIRED`, valid_to `Jul 22 2025`
- **Impact:** because `www` is on HTTPS + HSTS, affected clients cannot bypass reliably → site appears “down” for some visitors.
- **Repo change:** added diagnostics script [`scripts/diagnose-site-connectivity.js`](../scripts/diagnose-site-connectivity.js:1) and npm scripts in [`package.json`](../package.json:5).
- **Next action (infra):** fix certificate at the edge/origin serving `www.maasiso.nl`:
  - Ensure `www.maasiso.nl` is added to the correct Vercel project domains and re-issue cert
  - Ensure DNS for `www` points to Vercel correctly (prefer CNAME `www` → `cname.vercel-dns.com`), avoiding stale/mixed hosting endpoints

**Redirects / status handling (middleware) — querystrings preserved:**
- Trailing slash normalization (global 301): `/<path>/` → `/<path>` (except `/`)
- Explicit legacy alias: `/home` and `/home/` → `/` (301, no redirect chain)
- Legacy variants + services redirects remain in place (301), evaluated against a de-slashed pathname to avoid chains:
  - `/$` + `/%24` → **410 Gone**
  - `/index.html` → `/` (301)
  - `/index` → `/` (301)
  - `/contact.html` → `/contact` (301)
  - `/consultancy` → `/diensten` (301)
  - `/algemene-voorwaarden.html` → `/algemene-voorwaarden` (301)
  - `/terms-and-conditions` → `/algemene-voorwaarden` (301)
  - `/diensten/iso-9001-consultancy` → `/iso-9001` (301)
  - `/diensten/iso-9001` → `/iso-9001` (301)
  - `/diensten/iso-14001` → `/iso-14001` (301)
  - `/diensten/iso-27001` → `/iso-27001` (301)
  - `/diensten/bio` → `/bio` (301)
  - `/diensten/gdpr-avg` → `/diensten` (301)

**Exclusions (no redirects applied):**
- Next internals: `/_next/*`
- API: `/api/*`
- Static bucket (if used): `/assets/*`
- Special files: `/robots.txt`, `/sitemap.xml`, `/favicon.ico`

Implemented in: [`middleware()`](../middleware.ts:36)

**Sitemap canonicalization:**
- Sitemap continues to list only canonical URLs (no trailing slashes, no `/home`): [`sitemap()`](../app/sitemap.ts:23)

---

### ✅ Robots.txt: block Next.js internals from crawling (Dec 12, 2025 16:47 UTC)

Goal: reduce Google Search Console noise for technical endpoints (e.g. `/_next/image?url=...`) by instructing crawlers not to crawl Next.js internals.

**Deployment safety note (hybrid router tree):** repo contains both `app/` and `src/app/`. Production `/robots.txt` may be served by either tree depending on deployment config. To prevent mismatches, the same route now exists in both locations:
- [`GET()`](../app/robots.txt/route.ts:1)
- [`GET()`](../src/app/robots.txt/route.ts:1)

- Rules added:
  - `Disallow: /_next/`
  - `Allow: /_next/static/`

### ✅ Fix: prevent Vercel Edge from caching stale `/robots.txt` (Dec 12, 2025 16:57 UTC)

Live fetch was serving an old robots body with `X-Vercel-Cache: HIT` + high `Age`. To ensure updates go live quickly, both robots route handlers were made explicitly dynamic and non-cacheable:
- Added `export const dynamic = 'force-dynamic'`
- Added explicit response headers:
  - `Content-Type: text/plain; charset=utf-8`
  - `Cache-Control: no-store, max-age=0`

Implemented in:
- [`app/robots.txt/route.ts`](../app/robots.txt/route.ts:1)
- [`src/app/robots.txt/route.ts`](../src/app/robots.txt/route.ts:1)

---

## Completed Today (December 11, 2025)

### ✅ Phase 1: Account Setup
- Vercel: Ready
- Railway: Hobby plan active
- Cloudinary: Credentials obtained
  - Cloud Name: `dseckqnba`
  - API Key: `888487219281111`
  - API Secret: `PhKNfi5R4jnjVF2j5PUPXRSZr3E`

### ✅ Phase 2: Backups Created
All backups downloaded to `./backups/`:
- `strapi_db_backup_20251211.backup` (676 KB) - ✅ Safe to use
- `strapi-uploads-20251211.tar.gz` (98 MB) - ✅ Scanned & Uploaded
- `strapi-code-20251211.tar.gz` (118 MB) - ❌ Do NOT use
- `strapi-env-backup-20251210.txt` - ✅ Reference only

### ✅ Phase 3.1-3.3: Railway Database Import COMPLETE + CONTENT FIX
- **Project Name:** MaasISO
- **Project URL:** https://railway.com/project/186f4e92-9c4e-437b-9e51-46562ba5a87e
- **Account:** maassure@gmail.com (jackdamnielzz's Projects)
- **PostgreSQL:** Provisioned and DATA IMPORTED ✅
- **Tables Restored:** 71 tables successfully imported
- **Content Fix Applied:** December 11, 2025 09:36 UTC

**Bug Fixed - Missing Content:**
The original pg_restore imported table schemas but not content data.
A custom migration script was created to extract content from the VPS and import to Railway:

| Table | Before Fix | After Fix |
|-------|------------|-----------|
| blog_posts | 0 rows | 72 rows ✅ |
| pages | 0 rows | 24 rows ✅ |
| categories | 0 rows | 36 rows ✅ |
| tags | 0 rows | 224 rows ✅ |
| blog_posts_categories_lnk | 0 rows | 80 rows ✅ |
| blog_posts_tags_lnk | 0 rows | 164 rows ✅ |

**Scripts Created:**
- `scripts/vps-export-content.sh` - Export content from VPS PostgreSQL
- `scripts/import-content-to-railway.js` - Import with Strapi v5 compatibility
- Backup file: `backups/strapi-content-export-combined.json` (1.2MB)

**Database Connection Variables:**
| Variable | Value |
|----------|-------|
| PGHOST | postgres.railway.internal |
| PGPORT | 5432 |
| PGDATABASE | railway |
| PGUSER | postgres |
| PGPASSWORD | pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ |
| DATABASE_PUBLIC_URL | postgresql://postgres:pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ@centerbeam.proxy.rlwy.net:52159/railway |
| DATABASE_URL | postgresql://postgres:pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ@postgres.railway.internal:5432/railway |

**External Access (for migrations):**
- Host: centerbeam.proxy.rlwy.net
- Port: 52159

### ✅ Phase 3.4-3.6: Strapi Environment Configuration COMPLETE
- **Fresh Strapi Project:** `../maasiso-strapi-railway`
- **Environment Configured:** `.env` with all credentials
- **Dependencies Installed:** pg, @strapi/provider-upload-cloudinary
- **Build Test:** ✅ PASSED (TypeScript compiled, admin panel built)

**Configuration Details:**
- PostgreSQL connection: centerbeam.proxy.rlwy.net:52159
- SSL enabled with `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
- Cloudinary upload provider configured in `config/plugins.ts`
- 8 NEW secure keys generated (APP_KEYS x4, API_TOKEN_SALT, ADMIN_JWT_SECRET, JWT_SECRET, TRANSFER_TOKEN_SALT)

### ✅ Phase 3.7: Strapi Deployed to Railway COMPLETE
- **GitHub Repository:** https://github.com/jackdamnielzz/maasiso-strapi-railway
- **Railway Service:** peaceful-insight (production)
- **Public URL:** https://peaceful-insight-production.up.railway.app
- **Admin Panel:** https://peaceful-insight-production.up.railway.app/admin
- **API Endpoint:** https://peaceful-insight-production.up.railway.app/api
- **Strapi Version:** 5.31.3 (node v20.19.6)
- **Database:** Connected to Railway PostgreSQL ✅
- **Status:** "Strapi started successfully" ✅

### ✅ Phase 4: Cloudinary Media Migration COMPLETE
- **Timestamp:** December 11, 2025, 09:43 UTC
- **Duration:** 194.5 seconds

**Antivirus Scan:**
- Scanner: Windows Defender (MpCmdRun.exe -Scan -ScanType 3)
- Path scanned: `backups/uploads-extracted`
- Result: **NO THREATS FOUND** ✅

**Upload Results:**
| Metric | Value |
|--------|-------|
| Total Files Extracted | 229 |
| Total Size | 98.4 MB |
| Successfully Uploaded | 226 ✅ |
| Errors | 0 ✅ |
| Skipped (unsupported) | 3 (.gitkeep, .zip, .txt) |

**Cloudinary Organization:**
- Base folder: `strapi-uploads/`
  - `original/` - Original images
  - `small/` - Small variants
  - `medium/` - Medium variants
  - `large/` - Large variants
  - `thumbnail/` - Thumbnail variants

**Scripts Created:**
- `scripts/upload-to-cloudinary.js` - Node.js upload script
- `scripts/count-media-files.ps1` - PowerShell file counter
- `backups/cloudinary-upload-results.json` - Upload results log

### ✅ Handover Document Created
- [`project-docs/MIGRATION-HANDOVER-DOCUMENT.md`](../project-docs/MIGRATION-HANDOVER-DOCUMENT.md:1)

### ✅ Phase 5: Vercel Frontend Deployment COMPLETE
- **Timestamp:** December 11, 2025, 10:01 UTC

**Configuration Updates:**
- Updated `next.config.js` with Railway and Cloudinary image domains
- Created `.env.production` with Railway Strapi URL
- Created `.vercelignore` to exclude large folders from deployment
- Updated Next.js from 15.1.6 to 15.1.9 (security patch)

**Vercel Project:**
- **Project Name:** maasiso-copy-2
- **Account:** tunuxs-projects (jackdamnielzz)
- **Production URL:** https://maasiso-copy-2.vercel.app

**Environment Variables Configured:**
| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_API_URL | https://peaceful-insight-production.up.railway.app |
| NEXT_PUBLIC_STRAPI_URL | https://peaceful-insight-production.up.railway.app |
| NEXT_PUBLIC_BACKEND_URL | https://peaceful-insight-production.up.railway.app |
| NEXT_PUBLIC_SITE_URL | https://maasiso.nl |
| NEXT_PUBLIC_STRAPI_TOKEN | (configured - 256 chars) |

**Build/Test Results:**
- Local/CI: `npm run build` now exits with code 0 (build passing).
- Note: SSG fetches to Strapi produced runtime 500 responses during build; these are logged and do not currently fail the build.

- **Page Test Results (deployed preview):**
  - Homepage (/) | ✅ 200 OK
  - Blog (/blog) | ✅ 200 OK
  - Diensten (/diensten) | ✅ 200 OK
  - News (/news) | ⚠️ 500 Error (needs verification in production after deploy)

---

## Important Security Decision

**DO NOT USE:**
- Strapi code backup from VPS (potential backdoors)
- Hostinger VPS snapshots (created during attack period)

**DO USE:**
- Database dump (pure SQL data - safe)
- Media files (after local antivirus scan) ✅ SCANNED & UPLOADED
- Fresh Strapi installation on Railway ✅

---

## Next Steps

### 🔧 Incident mitigation: contact form email sending via Microsoft Graph (Dec 13, 2025)
- **Problem:** SMTP basic auth fails for Microsoft 365 mailboxes with MFA; app passwords are blocked.
- **Change implemented:** contact form API now attempts Microsoft Graph first (when configured) and falls back to SMTP/nodemailer for backward compatibility. Implemented in [`POST()`](../app/api/contact/route.ts:90) and [`sendEmailViaGraph()`](../app/api/contact/route.ts:41).
- **New env vars (Graph):**
  - `AZURE_TENANT_ID`
  - `AZURE_CLIENT_ID`
  - `AZURE_CLIENT_SECRET`
  - `GRAPH_USER_ID` (optional; falls back to `EMAIL_USER`)
- **SMTP still supported:** existing variables continue to work:
  - Preferred: `EMAIL_PASSWORD`
  - Also accepted: `SMTP_PASS`, `SMTP_PASSWORD`
  - Optional: `EMAIL_USER`, `SMTP_USER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- **Azure AD requirement:** App registration must have **Application permission** `Mail.Send` granted with admin consent (and send-as mailbox must be allowed if applicable).

De technische migratie naar Railway (Strapi + database + proxy + media-config) is afgerond. De resterende acties zijn vooral DNS, opschonen en **content-afwerking (Gemini-afbeeldingen)**.

### Phase 6: DNS Migration (NEXT)
1. DNS-records voor `maasiso.nl` naar Vercel laten wijzen en propagatie verifiëren.
2. Custom domain in het Vercel-project definitief configureren.
3. SSL/TLS-certificaten controleren na de switch.

### Phase 7: Cleanup, VPS-uitfasering & Documentatie
1. De huidige frontend-build naar Vercel (productie) deployen en de belangrijkste pagina's verifiëren (incl. `/news`).
2. Hostinger VPS-servers gecontroleerd uitfaseren zodra Vercel + Railway stabiel draaien.
3. Contentmatig: nieuwe Gemini-afbeeldingen genereren, uploaden in Railway Strapi en koppelen aan de relevante content (redactionele taak, geen codewijzigingen nodig).
4. Laatste documentatie-updates bijwerken (dit bestand, [`project-docs/04-IMPLEMENTATION-STATUS.md`](../project-docs/04-IMPLEMENTATION-STATUS.md:1) en [`memory-bank/progress.md`](./progress.md:1)).

---

## Key Files

- Handover doc: [`project-docs/MIGRATION-HANDOVER-DOCUMENT.md`](../project-docs/MIGRATION-HANDOVER-DOCUMENT.md:1)
- Original plan: [`project-docs/MIGRATION-PLAN-VERCEL-RAILWAY.md`](../project-docs/MIGRATION-PLAN-VERCEL-RAILWAY.md:1)
- Security report: [`logs/COMPLETE-SECURITY-INCIDENT-REPORT-2025-12-09-10.md`](../logs/COMPLETE-SECURITY-INCIDENT-REPORT-2025-12-09-10.md:1)
- Strapi project: `../maasiso-strapi-railway/`
- Upload results: `backups/cloudinary-upload-results.json`

---

## VPS Status

Both VPS servers are currently **RUNNING** (restarted December 11, 2025):
- Frontend: 147.93.62.188 (expires Jan 7, 2026)
- Backend: 153.92.223.23 (expires **Dec 17, 2025** ⚠️)

---

## Language Note

All AI communication will be in **English** regardless of user input language.