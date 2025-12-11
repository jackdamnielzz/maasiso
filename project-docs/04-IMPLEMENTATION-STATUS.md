# Implementation Status

**Last Updated**: 2025-12-11 22:09 UTC
**Project**: MaasISO - ISO Certification Consultancy Website

---

## Overview

This document tracks the implementation status of all major features and systems for the MaasISO project, including the critical security hardening work completed on December 9, 2025.

---

## 🛡️ Security Hardening (Post-Incident December 2025)

### Incident Summary
On December 9, 2025, a major security incident was discovered and resolved:
- Cryptomining malware (xmrig) on Frontend VPS
- Malicious nginx redirect to xss.pro
- **Status**: ✅ FULLY RESOLVED

### Security Implementation Progress

#### Immediate Response (100% Complete)

| Component | Status | Percentage | Notes |
|-----------|--------|------------|-------|
| Malware Cleanup | ✅ Complete | 100% | xmrig, sex.sh removed |
| Nginx Restoration | ✅ Complete | 100% | Clean config deployed |
| SSH Hardening (Basic) | ✅ Complete | 100% | Key-based auth enabled |
| Firewall (UFW) | ✅ Complete | 100% | Both servers |
| Fail2ban | ✅ Complete | 100% | Brute-force protection |

#### Antivirus & Malware Detection (100% Complete)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| ClamAV Installation | ✅ Complete | 100% | `04-install-clamav.sh` |
| Daily Quick Scans | ✅ Complete | 100% | Cron configured |
| Weekly Full Scans | ✅ Complete | 100% | Cron configured |
| Manual Scan Helper | ✅ Complete | 100% | `clamscan-maasiso` |

#### Rootkit Detection (95% Complete)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| rkhunter Installation | ✅ Complete | 100% | `06-install-rootkit-detection.sh` |
| chkrootkit Installation | ✅ Complete | 100% | `06-install-rootkit-detection.sh` |
| Daily rkhunter Scans | ✅ Complete | 100% | Cron configured |
| Weekly chkrootkit Scans | ✅ Complete | 100% | Cron configured |
| Manual Scan Helper | ✅ Complete | 100% | `rootkit-scan` |
| First Scan Log Creation | ⏳ Pending | 0% | Will create on first run |

#### AIDE File Integrity Monitoring (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| AIDE Installation | 📄 Script Ready | 0% | `08-install-aide.sh` |
| Database Initialization | 📄 Script Ready | 0% | - |
| Daily Integrity Checks | 📄 Script Ready | 0% | - |
| Alert Configuration | 📄 Script Ready | 0% | - |

#### Automatic Security Updates (100% Complete)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| unattended-upgrades | ✅ Complete | 100% | `09-setup-unattended-upgrades.sh` |
| Security Updates | ✅ Complete | 100% | Auto-enabled |
| Unused Dependency Cleanup | ✅ Complete | 100% | Configured |
| Helper Scripts | ✅ Complete | 100% | `check-updates`, `run-security-updates` |

#### CrowdSec IDS (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| CrowdSec Installation | 📄 Script Ready | 0% | `10-install-crowdsec.sh` |
| Firewall Bouncer | 📄 Script Ready | 0% | - |
| Nginx Bouncer | 📄 Script Ready | 0% | - |
| SSH/HTTP Scenarios | 📄 Script Ready | 0% | - |
| Community Blocklists | 📄 Script Ready | 0% | - |

#### ModSecurity WAF (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| ModSecurity Installation | 📄 Script Ready | 0% | `11-install-modsecurity.sh` |
| OWASP Core Rule Set | 📄 Script Ready | 0% | - |
| Nginx Integration | 📄 Script Ready | 0% | - |
| Attack Logging | 📄 Script Ready | 0% | - |

#### Centralized Logging (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Logwatch Installation | 📄 Script Ready | 0% | `12-setup-logging.sh` |
| GoAccess Nginx Analytics | 📄 Script Ready | 0% | - |
| Log Rotation | 📄 Script Ready | 0% | - |
| Daily Security Summary | 📄 Script Ready | 0% | - |

#### Kernel Hardening (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Network Hardening | 📄 Script Ready | 0% | `13-kernel-hardening.sh` |
| Memory Protection | 📄 Script Ready | 0% | - |
| Module Blacklisting | 📄 Script Ready | 0% | - |
| /proc Restrictions | 📄 Script Ready | 0% | - |
| Security Limits | 📄 Script Ready | 0% | - |

#### Advanced SSH Hardening (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Strong Cryptography | 📄 Script Ready | 0% | `14-advanced-ssh-hardening.sh` |
| Session Limits | 📄 Script Ready | 0% | - |
| 2FA (Google Auth) | 📄 Script Ready | 0% | - |
| IP Allowlisting | 📄 Script Ready | 0% | - |
| Security Banner | 📄 Script Ready | 0% | - |

#### Encrypted Backups (100% Complete)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Backup Tools | ✅ Complete | 100% | `15-encrypted-backups.sh` |
| Encryption Key | ✅ Complete | 100% | AES-256-CBC |
| Daily Full Backup | ✅ Complete | 100% | 3:00 AM |
| Hourly Config Backup | ✅ Complete | 100% | - |
| Backup Verification | ✅ Complete | 100% | `backup-maasiso verify` |
| Restore Script | ✅ Complete | 100% | `restore-maasiso` |

#### Data Leak Monitoring (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Secret Scanner | 📄 Script Ready | 0% | `16-data-leak-monitoring.sh` |
| Exposed File Checker | 📄 Script Ready | 0% | - |
| Breach Database Check | 📄 Script Ready | 0% | - |
| Server Exposure Check | 📄 Script Ready | 0% | - |

#### Metadata Stripping (Script Ready - 0% Deployed)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| exiftool Installation | 📄 Script Ready | 0% | `17-metadata-stripping.sh` |
| mat2 Installation | 📄 Script Ready | 0% | - |
| Upload Watcher | 📄 Script Ready | 0% | - |
| Bulk Processing | 📄 Script Ready | 0% | - |

---

### Security Implementation Summary

| Category | Deployed | Ready | Total | Percentage |
|----------|----------|-------|-------|------------|
| Immediate Response | 5 | 0 | 5 | 100% |
| Antivirus (ClamAV) | 4 | 0 | 4 | 100% |
| Rootkit Detection | 5 | 1 | 6 | 83% |
| AIDE File Integrity | 0 | 4 | 4 | 0% |
| Automatic Updates | 4 | 0 | 4 | 100% |
| CrowdSec IDS | 0 | 5 | 5 | 0% |
| ModSecurity WAF | 0 | 4 | 4 | 0% |
| Centralized Logging | 0 | 4 | 4 | 0% |
| Kernel Hardening | 0 | 5 | 5 | 0% |
| Advanced SSH | 0 | 5 | 5 | 0% |
| Encrypted Backups | 6 | 0 | 6 | 100% |
| Data Leak Monitoring | 0 | 4 | 4 | 0% |
| Metadata Stripping | 0 | 4 | 4 | 0% |
| **TOTAL** | **24** | **36** | **60** | **40%** |

#### Enhanced Security Monitoring (100% Complete)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Enhanced Monitor Script | ✅ Complete | 100% | `20-enhanced-security-monitor.sh` |
| Configuration File | ✅ Complete | 100% | `security-monitor-config.sh` |
| Setup Documentation | ✅ Complete | 100% | `MONITORING-SETUP.md` |
| 10 Security Checks | ✅ Complete | 100% | All persistence mechanisms covered |
| External Email Alerts | ✅ Complete | 100% | Configured for CRITICAL/WARNING/HOURLY |
| SMS Alerts | ✅ Complete | 100% | CRITICAL alerts to +31623578344 |

#### Guardian Security System (100% Complete - NEW)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Guardian Config | ✅ Complete | 100% | `guardian/guardian-config.sh` |
| Process Monitoring | ✅ Complete | 100% | `guardian/guardian-process.sh` |
| Network Monitoring | ✅ Complete | 100% | `guardian/guardian-network.sh` |
| File Monitoring | ✅ Complete | 100% | `guardian/guardian-files.sh` |
| Website Monitoring | ✅ Complete | 100% | `guardian/guardian-website.sh` |
| Alert Library | ✅ Complete | 100% | `guardian/guardian-alert-lib.sh` |
| Services Monitoring | ✅ Complete | 100% | `guardian/guardian-services.sh` |

#### Security Dashboard (100% Complete - NEW Dec 10)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Bash Dashboard | ✅ Complete | 100% | `guardian-dashboard.sh` |
| PowerShell Dashboard | ✅ Complete | 100% | `guardian-dashboard.ps1` |
| Alert Viewer | ✅ Complete | 100% | `view-alerts.sh` |
| c3pool Blocking | ✅ Complete | 100% | iptables rules on both servers |

#### 🔥 Phoenix Guardian Meta-Security (100% Complete - NEW Dec 10)

| Component | Status | Percentage | Script |
|-----------|--------|------------|--------|
| Phoenix Main Script | ✅ Complete | 100% | `phoenix/phoenix-guardian.sh` |
| Installation Script | ✅ Complete | 100% | `phoenix/install-phoenix.sh` |
| Test Suite | ✅ Complete | 100% | `phoenix/phoenix-test.sh` |
| Deploy Scripts (PowerShell) | ✅ Complete | 100% | `phoenix/deploy-phoenix-*.ps1` |
| Documentation | ✅ Complete | 100% | `phoenix/README.md` |
| Self-Healing Mechanism | ✅ Complete | 100% | 3 redundant hidden locations |
| Encrypted Backups | ✅ Complete | 100% | AES-256-CBC Guardian backups |
| Attack Detection | ✅ Complete | 100% | Malware, cron, process monitoring |

**Phoenix Guardian Features**:
- 🔥 Self-Healing: Restores itself from redundant copies if deleted
- 🛡️ Self-Protecting: Uses immutable flag (chattr +i) to prevent modification
- 👁️ Meta-Monitoring: Monitors Guardian scripts and restores if tampered
- 🥷 Stealth Mode: Hidden in system directories with innocent names
- ⚔️ Attack Detection: Kills malware, removes malicious cron entries
- 📧 Alerting: Sends email alerts for security events

**Hidden Locations**:
- `/usr/lib/x86_64-linux-gnu/.cache/.system-health-d`
- `/var/cache/apt/.pkg-cache-d`
- `/lib/systemd/.sd-pam-d`

**Security Checks Implemented**:
1. Nginx configuration integrity
2. Malware directories detection
3. Malicious cron jobs
4. Rogue systemd services
5. Startup file modifications
6. Unauthorized SSH keys
7. Hidden binaries in /tmp, /var/tmp, /dev/shm
8. C2/mining pool connections
9. High CPU processes (cryptominer detection)
10. Hidden directories in web roots

**Note**: This system addresses all 5 persistence mechanisms discovered during the December 9, 2025 incident.

### Current Security Posture

| Aspect | Status | Notes |
|--------|--------|-------|
| Overall Security | 🛡️ Protected / Monitored | Major incident fully remediated on 2025-12-09, third cleanup Dec 10 |
| Attack Vector | ✅ Mitigated | Server-level compromise via nginx config hijack + malware under web root |
| Malware Families | ✅ Removed | XMRig cryptominer, C2 backdoor, redirect malware, SSH backdoor key, /etc/de/* |
| Network Protection | ✅ Active | UFW firewall + Fail2ban + c3pool blocked on both servers |
| Mining Pool Blocking | ✅ Active | c3pool.org, c3pool.com blocked via iptables OUTPUT rules |
| Monitoring | ✅ Enhanced | Guardian system + dashboard with real-time status from both servers |
| Meta-Security | ✅ Phoenix Guardian | Self-healing system protects Guardian scripts |

- Incident date: **December 9, 2025**
- Attacker infrastructure blocked at firewall level:
  - C2: `35.173.69.207`
  - Mining pools: `pool.hashvault.pro`, `c3pool.org`
  - Redirect domains: `xss.pro`, `xss.is`
- Full incident report: `memory-bank/SECURITY-INCIDENT-2025-12-09.md`
- Security scripts (remediation + hardening): `scripts/security/`
- Guardian monitoring system: `scripts/security/guardian/`
- Phoenix Guardian meta-security: `scripts/security/phoenix/`
- Security dashboard: `scripts/security/guardian-dashboard.ps1`

### Overall Security Score

| Server | Current Score | Target Score |
|--------|---------------|--------------|
| Frontend (147.93.62.188) | **80%** | 95% |
| Backend (153.92.223.23) | **82%** | 95% |

**Note**: All 19 security scripts are ready, plus Phoenix Guardian meta-security system. Current deployment covers critical/high priority items. Phoenix Guardian adds self-healing capability to protect monitoring infrastructure.

---

## 🌐 Frontend (Next.js Application)

| Feature | Status | Percentage | Notes |
|---------|--------|------------|-------|
| Home Page | ✅ Complete | 100% | - |
| Services Pages | ✅ Complete | 100% | ISO 9001, 14001, 27001, etc. |
| About Page | ✅ Complete | 100% | - |
| Contact Page | ✅ Complete | 100% | With form |
| Blog System | ✅ Complete | 100% | Strapi integration (nu via Railway + Next.js proxy-routes). |
| News Section | ✅ Live (statisch) | 100% | `/news` is geïmplementeerd als statische placeholder in `src/app/news/page.tsx`; alle Strapi/news API-calls zijn uit het server-renderpad gehaald zodat Vercel-builds stabiel zijn. De technische koppeling frontend → Railway Strapi via proxy is aanwezig; het opnieuw introduceren van een dynamische nieuwsfeed is een optionele feature, geen blocker meer voor de migratie. |
| Cookie Consent | ✅ Complete | 100% | GDPR compliant |
| SEO Optimization | ✅ Complete | 100% | Meta tags, sitemap |
| Mobile Responsive | ✅ Complete | 100% | - |
| Performance | ✅ Complete | 95% | Core Web Vitals optimized |

**Frontend Overall**: 98%

> TODO (News): Optioneel, na stabiliteit in productie: dynamische, Strapi-gevoede nieuwslisting en detailpagina’s opnieuw introduceren als aparte feature (niet meer geblokkeerd door de Railway-migratie).

---

## 🔧 Backend (Strapi CMS)

| Feature | Status | Percentage | Notes |
|---------|--------|------------|-------|
| Content Types | ✅ Complete | 100% | All defined |
| API Endpoints | ✅ Complete | 100% | RESTful |
| Authentication | ✅ Complete | 100% | JWT |
| Media Upload | ✅ Complete | 100% | - |
| Blog Management | ✅ Complete | 100% | - |
| User Management | ✅ Complete | 100% | - |
| CORS Configuration | ✅ Complete | 100% | - |

**Backend Overall**: 100%

---

## 🔄 Strapi → Railway migratie status

| Onderdeel | Status | Percentage | Notities |
|-----------|--------|------------|----------|
| Database & content-migratie naar Railway | ✅ Voltooid | 100% | PostgreSQL-database geïmporteerd naar Railway; alle relevante contenttypes (blog, pages, categories, tags, relaties) zijn hersteld via de migratiescripts. |
| **Pages Migration (met layout)** | ✅ Voltooid | 100% | 7 pagina's succesvol gemigreerd met volledige layout-componenten (diensten, avg, bio, iso-27001, iso-14001, iso-16175, blog). |
| **Categories & Tags** | ✅ Voltooid | 100% | 5 categorieën aangemaakt, 40+ tags aangemaakt via migratiescript. |
| Strapi op Railway | ✅ Live | 100% | Nieuwe, schone Strapi v5-installatie draait op Railway (`https://peaceful-insight-production.up.railway.app`) met Railway PostgreSQL en Cloudinary-config voor media. |
| Frontend-koppeling (proxy → Railway Strapi) | ✅ Actief | 100% | Next.js-frontend gebruikt nu de proxy-routes (`/api/proxy/...`) richting Railway Strapi voor blog, uploads en overige content. |
| Oude VPS-backend | 💤 Legacy / uitfasering | - | Alleen nog tijdelijk actief voor de overgangsperiode; productie-backenddoel is Railway. |

### Content Migration Script (Dec 11, 2025 21:32 UTC)

De comprehensive migratie via [`scripts/migrate-all-content.js`](../scripts/migrate-all-content.js:1) is succesvol uitgevoerd:

| Content Type | Actie | Aantal | Status |
|--------------|-------|--------|--------|
| Pages | Updated | 7 | ✅ Met volledige layout componenten |
| Categories | Created | 5 | ✅ ISO 9001, ISO 27001, ISO 14001, AVG/GDPR, Algemeen |
| Tags | Created | 40 | ✅ Uit seo_keywords geëxtraheerd |
| Blog Posts | Verified | 36 | ✅ Reeds aanwezig |

### ✅ Cloudinary URL Fix (Dec 11, 2025 22:08 UTC) - NEW

Fixed broken Cloudinary images in the frontend. When Strapi uses Cloudinary as upload provider, it stores:
- `url`: Local path like `/uploads/image.jpg` (doesn't work - file is on Cloudinary)
- `provider`: "cloudinary"
- `provider_metadata`: `{ public_id: "maasiso/image_abc123", ... }`

**Problem:** Frontend was proxying `/uploads/` URLs to Strapi server where files don't exist.

**Solution Implemented:**
- Updated [`mapImage()`](../src/lib/api.ts:230) to detect Cloudinary via `provider_metadata` and construct proper URLs
- Added [`getCloudinaryUrl()`](../src/lib/utils/imageUtils.ts:74) helper function
- Updated [`transformImageUrl()`](../src/lib/utils/imageUtils.ts:114) to handle Strapi image objects
- Updated [`getImageUrl()`](../src/lib/utils/imageUtils.ts:229) to check for Cloudinary URLs
- Fixed [`getNewsArticleBySlug()`](../src/lib/api.ts:810) to use updated `mapImage()`

**Cloudinary Cloud Name:** `dseckqnba`

### Gemini images (Gemini_Generated_Image_*)

- Het image-fixscript [`scripts/fix-strapi-image-formats.js`](../scripts/fix-strapi-image-formats.js:1) is succesvol gedraaid tegen de **Railway** Strapi-omgeving met een geldig API-token.
- Het resultaat staat in [`scripts/fix-strapi-image-formats-report.json`](../scripts/fix-strapi-image-formats-report.json:1).

Samenvatting van de bevindingen:

- Totaal aantal upload-records in Strapi: ~51.
- Aantal `Gemini_Generated_Image_*`-records: 14.
- Voor **alle** Gemini-records:
  - De `original`-URL geeft een 404.
  - Alle varianten (`large`, `medium`, `small`, `thumbnail`) geven eveneens 404.
- Het script kon geen enkel record repareren (**Files changed: 0**).

Technische conclusie:

- De database-records voor Gemini-afbeeldingen bestaan in Railway, maar de fysieke bestanden ontbreken in de Railway uploads-storage.
- De 400/404-imageproblemen op de site rond Gemini-afbeeldingen worden hierdoor veroorzaakt door **ontbrekende bestanden**, niet door een bug in de frontend, de Next.js-proxy of het fix-script.
- De migratie van Strapi naar Railway (database, content, media-config, proxy-koppeling) is hiermee **technisch afgerond**.

Resterende actie (redactioneel, geen codewijzigingen nodig):

- Nieuwe Gemini-afbeeldingen genereren.
- Deze bestanden uploaden in de Railway Strapi-omgeving.
- De juiste afbeeldingen in Strapi koppelen aan de corresponderende content-items.

---

## 🚀 Infrastructure

| Component | Status | Percentage | Notes |
|-----------|--------|------------|-------|
| Vercel Frontend (Next.js) | ✅ Active | 100% | Frontend is nu op Vercel uitgerold; DNS-migratie naar Vercel/maasiso.nl is de volgende stap. |
| Railway Strapi (Backend) | ✅ Active | 100% | Strapi v5 draait op Railway met PostgreSQL; gebruikt door de frontend via proxy. |
| Frontend VPS (Hostinger) | 💤 Legacy / Transition | 100% | Nog actief tijdens de overgangsperiode; wordt uitgefaseerd na succesvolle DNS-migratie naar Vercel. |
| Backend VPS (Hostinger) | 💤 Legacy / Transition | 100% | Nog kort actief tot uiterlijk 2025-12-17; wordt uitgezet zodra Railway-productie stabiel is. |
| SSL Certificates | ✅ Active | 100% | Let's Encrypt (VPS) en certificaten via Vercel/Railway na DNS-switch. |
| DNS Configuration | ✅ In transitie | 80% | Voorbereid op overgang naar Vercel/Railway; definitieve switch nog uit te voeren. |
| Nginx Reverse Proxy | ✅ Legacy | 100% | Draait nog op VPS als tussenlaag tot DNS-migratie is afgerond. |
| Firewall (UFW) | ✅ Active | 100% | Beide VPS-servers, tot decommissioning. |
| Fail2ban | ✅ Active | 100% | Beide VPS-servers, tot decommissioning. |

**Infrastructure Overall**: 100% (nieuwe infrastructuur op Vercel + Railway is operationeel; VPS-laag is in uitfaseringsfase)

---

## 📊 Monitoring & Analytics

| Component | Status | Percentage | Notes |
|-----------|--------|------------|-------|
| Google Analytics | ✅ Active | 100% | - |
| Uptime Monitoring | ⏳ Planned | 0% | Consider UptimeRobot |
| Error Tracking | ⏳ Planned | 0% | Consider Sentry |
| Log Analysis | 📄 Script Ready | 0% | GoAccess ready |
| Security Monitoring | ✅ Partial | 50% | Basic + scripts ready |

**Monitoring Overall**: 50%

---

## 📝 Documentation

| Document | Status | Location |
|----------|--------|----------|
| Security Incident Report | ✅ Complete | `memory-bank/SECURITY-INCIDENT-2025-12-09.md` |
| Active Context | ✅ Updated | `memory-bank/activeContext.md` |
| Progress Tracking | ✅ Updated | `memory-bank/progress.md` |
| Server Access Guide | ✅ Complete | `docs/SERVER-ACCESS-GUIDE.md` |
| Security Scripts | ✅ Complete | `scripts/security/*.sh` |
| Verification Reports | ✅ Complete | `logs/FINAL-SECURITY-REPORT-20251209.md` |

**Documentation Overall**: 95%

---

## 🎯 Project Completion Summary

| Area | Percentage | Status |
|------|------------|--------|
| Frontend Application | 98% | ✅ Production Ready (pending news verification) |
| Backend CMS | 100% | ✅ Production Ready |
| Infrastructure | 100% | ✅ Production Ready |
| Security (Deployed) | 40% | 🔶 Critical Done, More Available |
| Security (Scripts Ready) | 100% | ✅ All Scripts Created |
| Monitoring | 50% | 🔶 Basic Active |
| Documentation | 95% | ✅ Nearly Complete |

### Overall Project Status: **83%** Complete

---

## Next Priority Actions

### Immediate (This Week)
1. ⚠️ **Voltooi DNS-migratie naar Vercel + Railway en plan gecontroleerde uitfasering van de Backend VPS vóór 2025-12-17** (legacy-omgeving alleen nog voor de overgang).
2. 🛡️ **Deploy CrowdSec IDS** - Enhanced attack detection (optioneel, alleen relevant zolang VPS-servers nog actief zijn).
3. 🛡️ **Deploy AIDE** - File integrity monitoring (optioneel, alleen relevant zolang VPS-servers nog actief zijn).

### Short-term (Next 2 Weeks)
4. 📊 **Deploy Centralized Logging**
5. 🔒 **Deploy Kernel Hardening**
6. 🔒 **Deploy Advanced SSH Hardening**

### Medium-term (Next Month)
7. 🛡️ **Deploy ModSecurity WAF**
8. 📊 **Set up Uptime Monitoring**
9. 📊 **Set up Error Tracking**

---

**Legend**:
- ✅ Complete/Deployed
- 📄 Script Ready (not yet deployed)
- ⏳ Pending/Planned
- 🔶 Partial
- ⚠️ Urgent