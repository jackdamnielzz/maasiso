# Technische Projectaudit MaasISO
Versie: 1.1  
Datum: 6 februari 2026  
Status: Definitief (geactualiseerd)  
Scope: volledige codebase in `d:\Programmeren\MaasISO\New without errors\maasiso - Copy`

## 1. Doel en context
Dit document bundelt alle technische bevindingen uit een volledige projectanalyse, inclusief architectuur-afwijkingen ten opzichte van de "single source of truth", beveiligingsrisico's, kwaliteitsstatus (lint/test/build), operationele risico's en een geprioriteerd herstelplan.

Deze rapportage is bedoeld als uitvoerbare stuurinformatie voor refactoring, hardening en governance-herstel.

## 2. Onderzoeksaanpak
Analyse uitgevoerd op:
- repositorystructuur, routes, configuratie en deploymentbestanden;
- governance- en architectuurdocumenten;
- API-routes, auth, logging en secrets-beheer;
- test- en lintpipeline;
- dependency security (`npm audit`);
- build-verifieerbaarheid (`next build`).

Belangrijkste feitelijke checks (herbevestigd op 6 februari 2026):
- `npm run build` -> geslaagd (Next.js 16.1.6).
- `npm run build:prod` -> geslaagd (zonder `SKIP_TYPESCRIPT` en zonder `--no-lint`).
- `npm run lint` -> geslaagd.
- `npm run test:jest -- --runInBand` -> **45 suites, 45 passed; 340 tests, 340 passed**.
- `npm run test:vitest` -> **14 files, 14 passed; 139 tests, 139 passed**.
- `npm run typecheck` -> geslaagd.
- `npx tsc --noEmit -p tsconfig.prod.json` -> geslaagd.
- `npm audit --json` -> **1 kwetsbaarheid (0 critical, 0 high, 1 moderate)**.

## 2.1 Update voortgang (6 februari 2026 - afrondingsronde)
Nieuwe verificatie en afronding uitgevoerd op quality-gates, routecompleetheid en repository hygiene.

Afgeronde acties in deze ronde:
- CI quality gates verhard: `continue-on-error` verwijderd voor typecheck/Jest/Vitest/audit, met expliciete fail op audit `high`/`critical`.
- Ontbrekende SSOT-route toegevoegd: `app/kennis/e-learning/[slug]/page.tsx`.
- `next.config.js` gecorrigeerd (één consistente `splitChunks.cacheGroups` definitie en correcte `removeConsole` configuratie).
- Placeholder structured data in `app/layout.tsx` vervangen door geldige service-context.
- Backup/artifact/log-bestanden uit repository verwijderd en `.gitignore` uitgebreid.
- Type/test regressies opgelost in 4 testbestanden (`ProgressiveContent`, `ProgressiveImage`, `imageOptimization`, `monitoring`).

Status na deze ronde:
- Test- en type-baseline is volledig groen.
- CI-gates zijn hard afdwingbaar voor lint/build/type/tests/audit-threshold.
- Openstaande prioriteiten liggen primair op externe security-governance (secret-rotatie en history-rewrite) plus bredere loggingstandaardisatie.

## 3. Meetresultaten (objectief)

| Onderdeel | Resultaat |
| --- | --- |
| Build | Geslaagd (`next build`, `npm run build:prod`, Next.js 16.1.6) |
| Lint | Geslaagd (`eslint app src --ext .js,.jsx,.ts,.tsx`) |
| Jest tests | 45 suites, 45 passed; 340 tests, 340 passed |
| Vitest tests | 14 files, 14 passed; 139 tests, 139 passed |
| Typecheck (repo-breed) | Geslaagd (`npm run typecheck`) |
| Typecheck (prod-profiel) | Geslaagd (`npx tsc --noEmit -p tsconfig.prod.json`) |
| Dependency audit | 1 vulnerability (0 critical, 0 high, 1 moderate, 0 low) |

## 4. Kritieke bevindingen

### C-01 Secrets en tokens in repository (direct exploiteerbaar)
**Impact**  
Onbevoegde toegang tot CMS/API/deploy keten, mogelijk datalek of contentmanipulatie.

**Bewijs**  
- `ecosystem.config.js:13`
- `ecosystem.config.js:14`
- `ecosystem.config.js:34`
- `ecosystem.config.js:35`
- `.env.production:4`
- `.env.vercel:2`
- `scripts/direct-deploy.ps1:94`
- `scripts/direct-deploy.ps1:184`
- `scripts/quick-deploy.ps1:23`

**Aanpak**  
1. Direct alle tokens/secrets roteren (Strapi, Vercel OIDC, SMTP, admin secrets).  
2. Secrets uit git history verwijderen (niet alleen uit laatste commit).  
3. Secret scanning verplicht in CI.

---

### C-02 Architectuur gebruikt publieke bearer token (`NEXT_PUBLIC_STRAPI_TOKEN`)
**Impact**  
Token is client-zichtbaar en kan misbruikt worden buiten de applicatie.

**Bewijs**  
- `src/lib/config/client-env.ts:32`
- `src/lib/config/client-env.ts:80`
- `src/lib/api.ts:47`
- `src/lib/api/core.ts:15`
- `src/lib/cache.ts:15`
- `src/lib/monitoredFetch.ts:52`
- `app/sitemap.ts:11`

**Aanpak**  
1. Migreren naar server-only token (`STRAPI_TOKEN`).  
2. Client nooit direct op Strapi met bearer laten authenticeren.  
3. Alle client calls via gecontroleerde backend routes laten lopen.

---

### C-03 Open proxy met token-doorgeleiding naar dynamische Strapi-path
**Impact**  
Vergroot aanvalsoppervlak en risico op ongecontroleerde data-exfiltratie.

**Bewijs**  
- `app/api/proxy/[...path]/route.ts:56`
- `app/api/proxy/[...path]/route.ts:72`
- `app/api/proxy/[...path]/route.ts:79`

**Aanpak**  
1. Strikte allowlist op endpointniveau.  
2. Auth + rate limiting + request auditing.  
3. Alleen expliciet ondersteunde queryparams doorlaten.

---

### C-04 Health endpoint lekt infra details zonder afscherming
**Impact**  
Geeft aanvallers operationele en systeeminformatie.

**Bewijs**  
- `app/api/health/route.ts:101`
- `app/api/health/route.ts:105`
- `app/api/health/route.ts:122`
- `app/api/health/route.ts:128`

**Aanpak**  
1. Endpoint afschermen (IP allowlist of admin auth).  
2. Detailniveau reduceren naar minimale liveness/readiness info.

---

### C-05 Contact API logt PII en geeft debug payloads terug
**Impact**  
Privacy- en securityrisico via logs en API-responses.

**Bewijs**  
- `app/api/contact/route.ts:80`
- `app/api/contact/route.ts:96`
- `app/api/contact/route.ts:97`
- `app/api/contact/route.ts:207`
- `app/api/contact/route.ts:217`
- `app/api/contact/route.ts:3` (duplicaat interface)
- `app/api/contact/route.ts:19` (duplicaat interface)

**Aanpak**  
1. Debug/logs uit productiepad halen.  
2. Uniforme, minimale foutresponse zonder intern debugobject.  
3. Anti-spam/rate limit toevoegen.

## 5. Hoge bevindingen

### H-01 Architectuurdrift: dubbele content-routes naast `/kennis/*`
**Impact**  
Canonical- en indexatieproblemen, governanceconflict met SSOT.

**SSOT bewijs**  
- `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:57`
- `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:63`
- `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:1167`
- `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:1168`

**Implementatie bewijs**  
- `.next/server/app-paths-manifest.json:47` (`/blog/[slug]`)
- `.next/server/app-paths-manifest.json:48` (`/blog`)
- `.next/server/app-paths-manifest.json:59` (`/kennis/blog/[slug]`)
- `.next/server/app-paths-manifest.json:60` (`/kennis/blog`)
- `.next/server/app-paths-manifest.json:73` (`/whitepaper`)
- `.next/server/app-paths-manifest.json:63` (`/kennis/whitepapers`)
- `app/blog/page.tsx:18`
- `app/kennis/blog/page.tsx:13`
- `app/whitepaper/page.tsx:9`
- `app/kennis/whitepapers/page.tsx:10`
- `app/sitemap.ts:146`
- `app/sitemap.ts:150`
- `app/sitemap.ts:203`

**Aanpak**  
1. Een canonieke informatiearchitectuur afdwingen (alle kennis onder `/kennis`).  
2. 301 redirects vanaf legacy routes.  
3. Sitemap en interne links harmoniseren.

---

### H-02 (opgelost) Verplichte SSOT routes ontbraken
**Impact**  
Architectuurimplementatie is nu volledig voor de verplichte routes.

**Bewijs**  
- `app/iso-selector/page.tsx` aanwezig.
- `app/kennis/whitepapers/[slug]/page.tsx` aanwezig.
- `app/kennis/e-learning/[slug]/page.tsx` aanwezig.
- Build-output bevat nu ook `/kennis/e-learning/[slug]` en `/kennis/whitepapers/[slug]`.

**Aanpak**  
Behouden en monitoren via CONTROL-validatiebestand.

---

### H-03 (opgelost) Whitepaper lead-endpoint actief op app-router
**Impact**  
Leadflow is beschikbaar op actieve API-route.

**Bewijs**  
- Frontend call blijft `src/components/features/WhitepaperCard.tsx:37` (`/api/whitepaper-leads`).
- Actieve endpoint-route aanwezig: `app/api/whitepaper-leads/route.ts`.
- Build-output bevat `/api/whitepaper-leads`.

**Aanpak**  
Behouden; optioneel legacy duplicaat onder `src/app` later verwijderen in hygiene-rondes.

---

### H-04 (opgelost) QA-pipeline volledig groen
**Impact**  
Kwaliteitslijn is nu groen voor lint/type/tests/build.

**Bewijs**  
- `npm run lint` -> geslaagd.
- `npm run typecheck` -> geslaagd.
- `npx tsc --noEmit -p tsconfig.prod.json` -> geslaagd.
- `npm run test:jest -- --runInBand` -> 45 suites, 45 passed; 340 tests, 340 passed.
- `npm run test:vitest` -> 14 files, 14 passed; 139 tests, 139 passed.
- `npm run build` en `npm run build:prod` -> geslaagd.

**Aanpak**  
Baselines periodiek blijven verifiëren in CI.

---

### H-05 (opgelost) CI-gates zijn hard afdwingbaar
**Impact**  
PR-kwaliteit wordt nu consistent afgedwongen op tests/typecheck/security-threshold.

**Bewijs**  
- `.github/workflows/quality-gates.yml` bevat geen `continue-on-error` meer voor typecheck/Jest/Vitest/audit.
- Audit stap faalt expliciet bij `high > 0` of `critical > 0`.
- Lint + build + typecheck + tests + audit draaien als gating checks.

**Aanpak**  
Thresholds periodiek herijken (bijv. ook fail op `moderate` indien gewenst).

---

### H-06 (opgelost) Productiebuildpad omzeilde controles
**Impact**  
Omzeiling is verwijderd; deploymentpad valideert nu weer lint + build.

**Bewijs**  
- Historisch: `package.json:20` gebruikte `SKIP_TYPESCRIPT` en `--no-lint`.
- Huidig: `package.json:20` draait `npm run clean && npm run lint && next build`.
- `ecosystem.config.js:42` gebruikt `npm run build:prod` in post-update.

**Aanpak**  
Behouden en monitoren via CI + periodieke build-validatie.

## 6. Middelzware bevindingen

### M-01 Mixed routerstructuur en dode code
**Impact**  
Hogere onderhoudslast, grotere kans op regressies.

**Bewijs**  
- Actieve routes komen uit `app/*`: `.next/server/app-paths-manifest.json`
- Parallelle code onder `src/app/*` bestaat nog.
- Legacy/backupbestanden:
  - `app/blog/page.tsx.backup`
  - `app/search/page.tsx.backup`
  - `ecosystem.config.js.backup`

---

### M-02 Governance-validatie minder streng dan SSOT
**Impact**  
Detailpagina's kunnen "compliant lijken" zonder alle verplichte secties inhoudelijk af te dwingen.

**Bewijs**  
- SSOT verplichtingen:  
  - `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:1148`
  - `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:1154`
- Code behandelt missende onderdelen deels als warning:
  - `src/lib/governance/coreContent.ts:117`
  - `src/lib/governance/coreContent.ts:177`
- Enforcement richt zich vooral op fatale gevallen:
  - `src/components/templates/core/CoreDetailPageTemplate.tsx:32`

---

### M-03 (opgelost) `next.config.js` splitChunks conflict
**Impact**  
Bundlegedrag is nu eenduidig geconfigureerd.

**Bewijs**  
- `next.config.js` bevat nu één consistente `splitChunks.cacheGroups` configuratie.
- `next.config.js` gebruikt een geldige `compiler.removeConsole` configuratie voor productie.

---

### M-04 Productielogging deels gereduceerd, standaardisatie nog open
**Impact**  
Ruis, mogelijke prestatie-impact en groter risico op gevoelige logdata.

**Bewijs**  
- Logging is al gedempt op kritieke fetch/sitemap-sluitingen:
  - `src/lib/api.ts` (debug-gated logging)
  - `app/[slug]/page.tsx` (debug-gated logging)
  - `app/sitemap.ts` (debug-gated logging)
- Repo bevat nog veel `console.*` statements buiten tests (`rg console.` -> 561 matches in `app`/`src` exclusief testbestanden).

---

### M-05 (opgelost) Repository hygiene: artifacts/logs opgeschoond
**Impact**  
Repo-ruis en onnodige binary artifacts zijn verwijderd.

**Bewijs**  
- Verwijderd uit git:
  - `deploy.tar.gz`
  - `logs/*`
  - `test-deploy/**`
  - `*.backup` en `*.bak` artifacts
- `.gitignore` uitgebreid met `logs/`, `test-deploy/`, `deploy.tar.gz`, `*.backup`, `*.bak`.

---

### M-06 (opgelost) Structured data placeholder verwijderd
**Impact**  
Structured data bevat geen placeholder-adres meer.

**Bewijs**  
- `app/layout.tsx`: placeholder `PostalAddress`-blok verwijderd.
- `app/layout.tsx`: `ProfessionalService` aangevuld met `areaServed: ["NL", "BE"]`.

---

### M-07 (opgelost) Navigatie aligned met SSOT (desktop hoofdmenu)
**Impact**  
Hoofdnavigatie bevat nu de SSOT-verplichte kennisroute.

**Bewijs**  
- SSOT verwacht menu met `Kennis`: `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:137`
- `src/components/layout/Header.tsx` bevat `Kennis` en interne link naar `/iso-selector`.

## 7. Positieve observaties
- Core detail template bevat vaste, SSOT-conforme hoofdsecties:
  - `src/components/templates/core/CoreDetailPageTemplate.tsx:99`
  - `src/components/templates/core/CoreDetailPageTemplate.tsx:126`
  - `src/components/templates/core/CoreDetailPageTemplate.tsx:262`
- Breadcrumb schema is centraal geregeld:
  - `src/components/templates/core/CoreBreadcrumbBar.tsx:12`
- Debug/test-endpoints hebben productieguard:
  - `src/lib/admin/apiAuth.ts:21`
  - `src/lib/admin/apiAuth.ts:23`
  - `src/lib/admin/apiAuth.ts:30`
- Productiebuild is reproduceerbaar en slaagt op dit moment.

## 8. Geprioriteerd herstelplan

### Fase 0 (0-24 uur)
1. Alle gelekte secrets roteren en intrekken.  
2. Secrets uit git history verwijderen.  
3. Secret scanning in CI verplicht maken (indien nog niet actief via platformpolicy).

### Fase 1 (2-7 dagen)
1. Loggingstandaardisatie afronden (verdere reductie van `console.*` buiten debug-guards).  
2. Governance-validatie aanscherpen naar SSOT-verplichte checks (warnings -> fail criteria waar passend).

### Fase 2 (1-2 weken)
1. Security-thresholdstrategie evalueren (optioneel fail ook op `moderate`).  
2. Periodieke regressie-audit op routecanoniek, schema-markup en quality-gates.

## 9. Conclusie
De codebase is nu operationeel stabiel met groene kwaliteitsbaseline (lint/type/tests/build), harde CI-gates en grotendeels herstelde SSOT-compliance voor routes en governance-structuur. Openstaand kritisch werk zit buiten de codebase zelf (secret-rotatie en history-rewrite) plus resterende loggingstandaardisatie.

## 10. Uitvoeringsregister (levend)
Gebruik deze tabel als centrale bron voor voortgang.  
Toegestane statussen: `TODO`, `DOING`, `BLOCKED`, `DONE`, `CANCELLED`.

| ID | Status | Prioriteit | Actie | Eigenaar | Startdatum | Streefdatum | Afgerond op | Bewijs / Opmerking |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ACT-001 | BLOCKED | Kritiek | Alle gelekte secrets roteren en intrekken | Codex | 2026-02-05 | 2026-02-05 |  | Code opgeschoond; externe rotatie in Strapi/Vercel/SMTP vereist |
| ACT-002 | BLOCKED | Kritiek | Secrets uit git-history verwijderen en repo hardenen | Codex | 2026-02-05 | 2026-02-06 |  | Repo hardening gedaan, history rewrite + force-push nog vereist |
| ACT-003 | DONE | Kritiek | `NEXT_PUBLIC_STRAPI_TOKEN` uit runtime pad halen; server-only tokenflow | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `src/lib/config/client-env.ts`, `src/lib/api.ts`, `src/lib/api/core.ts`, `src/lib/monitoredFetch.ts`, `app/sitemap.ts` |
| ACT-004 | DONE | Kritiek | `api/proxy` beperken met allowlist + auth + rate limiting | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `app/api/proxy/[...path]/route.ts` (allowlist, query filtering, rate limit, optionele auth) |
| ACT-005 | DONE | Kritiek | `api/health` afschermen of minimaliseren | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `app/api/health/route.ts` (minimale publieke health, detail alleen met token-header) |
| ACT-006 | DONE | Kritiek | Contact API debug/PII logging verwijderen en foutafhandeling hardenen | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `app/api/contact/route.ts` (PII logs verwijderd, minimale error responses, rate limiting, honeypot) |
| ACT-007 | DONE | Hoog | Canonieke kennisroutes afdwingen onder `/kennis/*` + redirects | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `next.config.js`, `app/sitemap.ts` (301 redirects + canonical sitemap) |
| ACT-008 | DONE | Hoog | Ontbrekende SSOT-routes toevoegen (`/iso-selector`, whitepaper/e-learning detailroutes) | Codex | 2026-02-05 | 2026-02-06 | 2026-02-06 | `app/iso-selector/page.tsx`, `app/kennis/whitepapers/[slug]/page.tsx`, `app/kennis/e-learning/[slug]/page.tsx` |
| ACT-009 | DONE | Hoog | Whitepaper-lead endpoint op actieve routebasis brengen | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `app/api/whitepaper-leads/route.ts` (actieve app-router route) |
| ACT-010 | DONE | Hoog | Lintproces repareren voor Next 16 setup | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `package.json`, `.eslintrc.json` -> `npm run lint` geslaagd |
| ACT-011 | DONE | Hoog | Teststack normaliseren (Jest/Vitest scheiden of unificeren) | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `package.json`, `jest.config.js`, `vitest.config.ts`; scheiding gereed en baseline groen |
| ACT-012 | DONE | Hoog | CI uitbreiden met build/test/type/security gates | Codex | 2026-02-05 | 2026-02-06 | 2026-02-06 | `.github/workflows/quality-gates.yml`; `continue-on-error` verwijderd, audit failt op high/critical |
| ACT-013 | DONE | Hoog | Productiebuild zonder `SKIP_TYPESCRIPT` en zonder `--no-lint` | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `package.json` aangepast; `npm run build:prod` geslaagd |
| ACT-020 | DONE | Hoog | Functionele test/typecheck-schuld reduceren tot groene baseline | Codex | 2026-02-05 | 2026-02-06 | 2026-02-06 | `npm run typecheck`, `npx tsc --noEmit -p tsconfig.prod.json`, `npm run test:jest`, `npm run test:vitest` allemaal groen |
| ACT-014 | DONE | Middel | Dode code, backupfiles, artifacts en logs uit repo opschonen | Codex | 2026-02-06 | 2026-02-06 | 2026-02-06 | Backup/log/artifact bestanden verwijderd; `.gitignore` uitgebreid |
| ACT-015 | TODO | Middel | Governance-validatie aanscherpen naar SSOT-verplichte checks | n.t.b. |  |  |  | Zie M-02 |
| ACT-016 | DONE | Middel | `next.config.js` splitChunks conflict herstellen | Codex | 2026-02-06 | 2026-02-06 | 2026-02-06 | Eén `cacheGroups` set en geldige `compiler.removeConsole` configuratie |
| ACT-017 | DOING | Middel | Productielogging reduceren en standaardiseren | Codex | 2026-02-06 | 2026-02-10 |  | Kernpaden gedempt (`src/lib/api.ts`, `app/[slug]/page.tsx`, `app/sitemap.ts`), brede uitrol nog open |
| ACT-018 | DONE | Middel | Placeholder bedrijfsdata in structured data vervangen | Codex | 2026-02-06 | 2026-02-06 | 2026-02-06 | `app/layout.tsx` placeholder-adres verwijderd; `areaServed` toegevoegd |
| ACT-019 | DONE | Middel | Hoofdnavigatie aligneren met SSOT (`Kennis` in hoofdmenu) | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `src/components/layout/Header.tsx` (`Kennis` toegevoegd, `ISO-Selector` intern) |

## 11. Werklog (chronologisch)
Registreer elke concrete wijziging in tijdsvolgorde.

| Datum | Actie-ID | Wijziging | Resultaat | Uitgevoerd door |
| --- | --- | --- | --- | --- |
| 2026-02-05 | ACT-000 | Auditrapport aangemaakt en gevalideerd | Gereed | Codex |
| 2026-02-05 | ACT-000 | Uitvoeringsregister toegevoegd voor continue opvolging | Gereed | Codex |
| 2026-02-05 | ACT-001 | Secrets gesaneerd in tracked env/config/deploybestanden; placeholders ingevoerd | Deels gereed (rotatie extern nog open) | Codex |
| 2026-02-05 | ACT-002 | Repo hardening: `.gitignore` uitgebreid, `.env.example` toegevoegd, bekende tokenstrings geredigeerd | Deels gereed (history rewrite open) | Codex |
| 2026-02-05 | ACT-003 | Runtime gemigreerd van publieke token naar server-only flow | Gereed | Codex |
| 2026-02-05 | ACT-004 | Proxy route opnieuw opgezet met allowlist/query-validatie/rate limiting/optionele auth | Gereed | Codex |
| 2026-02-05 | ACT-005 | Health endpoint vervangen door minimale publieke output + gated detailniveau | Gereed | Codex |
| 2026-02-05 | ACT-006 | Contact endpoint herschreven zonder PII/debug lekken + anti-spam/rate limit | Gereed | Codex |
| 2026-02-05 | ACT-003/004/005/006 | Build-validatie uitgevoerd (`npm run build`) | Geslaagd | Codex |
| 2026-02-05 | ACT-007 | Canonieke contentpaden afgedwongen met redirects en sitemap update naar `/kennis/*` | Gereed | Codex |
| 2026-02-05 | ACT-008 | SSOT-routes `/iso-selector` en `/kennis/whitepapers/[slug]` toegevoegd | Gereed | Codex |
| 2026-02-05 | ACT-009 | Whitepaper-lead endpoint op actieve app-router geplaatst (`app/api/whitepaper-leads`) | Gereed | Codex |
| 2026-02-05 | ACT-019 | Hoofdnavigatie bijgewerkt met `Kennis` en interne route naar `/iso-selector` | Gereed | Codex |
| 2026-02-05 | ACT-010 | Lintmigratie afgerond naar ESLint CLI met werkende config voor huidige setup | Gereed | Codex |
| 2026-02-05 | ACT-011 | Jest/Vitest gescheiden in scripts en runner-configs | Gereed | Codex |
| 2026-02-05 | ACT-012 | Nieuwe CI-workflow toegevoegd met mandatory lint/build + diagnostische type/test/audit runs | In uitvoering | Codex |
| 2026-02-05 | ACT-013 | `build:prod` opgeschoond; skip-flags verwijderd en productiebuild opnieuw gevalideerd | Gereed | Codex |
| 2026-02-05 | ACT-000 | Meetresultaten ververst (lint groen; Jest/Vitest/typecheck/audit geactualiseerd) | Gereed | Codex |
| 2026-02-05 | ACT-020 | Type-inferentiecluster opgelost in 5 bestanden (`debug-features`, `DienstenContent`, `SchemaMarkup`, `sitemap`, `api`) | Deels gereed (typecheck + prod-typecheck groen) | Codex |
| 2026-02-05 | ACT-020 | Jest-harness verbeterd (`AccessibilityProvider` context-mock + env-safe setup) | Deels gereed (Jest 117 -> 97 failing tests) | Codex |
| 2026-02-05 | ACT-000 | Meetwaarden opnieuw geverifieerd (`typecheck`, `tsconfig.prod`, `vitest`, `jest`) | Gereed | Codex |
| 2026-02-06 | ACT-008 | SSOT-route `/kennis/e-learning/[slug]` toegevoegd en metadata/breadcrumbs ingebouwd | Gereed | Codex |
| 2026-02-06 | ACT-012 | CI quality gates verhard: `continue-on-error` verwijderd voor typecheck/Jest/Vitest/audit + audit-threshold high/critical | Gereed | Codex |
| 2026-02-06 | ACT-014 | Backupfiles, deploy-artifacts en logmappen uit git verwijderd; `.gitignore` aangevuld | Gereed | Codex |
| 2026-02-06 | ACT-016 | `next.config.js` opgeschoond: splitChunks conflict opgelost en `removeConsole` productieconfig gecorrigeerd | Gereed | Codex |
| 2026-02-06 | ACT-018 | Structured data placeholders verwijderd en servicegebied (`NL`,`BE`) toegevoegd | Gereed | Codex |
| 2026-02-06 | ACT-020 | Laatste regressies opgelost in type/tests; baseline bevestigd met 45/45 Jest, 14/14 Vitest en groene typecheck | Gereed | Codex |
| 2026-02-06 | ACT-000 | Eindmeting geactualiseerd (`lint`, `typecheck`, `tsc-prod`, `jest`, `vitest`, `build`, `build:prod`, `audit`) | Gereed | Codex |

## 12. Beslislog
Leg hier technische en governance-beslissingen vast.

| Beslis-ID | Datum | Beslissing | Reden | Impact | Besloten door |
| --- | --- | --- | --- | --- | --- |
| DEC-001 | 2026-02-05 | Auditdocument wordt leidend werkdocument voor opvolging | Centrale voortgang en traceerbaarheid | Hogere beheersbaarheid | n.t.b. |
| DEC-002 | 2026-02-05 | Publieke Strapi bearer-tokenflow uitgefaseerd; server-only token via proxy/API-routes | Beperking exfiltratie en client-side token exposure | Securityverbetering met beperkte refactorimpact | Codex |
| DEC-003 | 2026-02-05 | CI opgesplitst in mandatory gates (lint/build) en diagnostische gates (typecheck/tests/audit) | Snel kwaliteitsvangnet zonder team direct te blokkeren op bestaande testschuld | Continue zichtbaarheid en gefaseerde verharding | Codex |
| DEC-004 | 2026-02-05 | `build:prod` mag geen skip-flags meer gebruiken (`SKIP_TYPESCRIPT`, `--no-lint`) | Deploymentpad moet dezelfde kwaliteitsdrempel volgen als reguliere build | Lager risico op regressies in productie | Codex |
| DEC-005 | 2026-02-05 | ACT-020 gefaseerd uitgevoerd: eerst type-baseline groen, daarna Jest-clusters | Sneller risicoreductiepad met meetbare tussenmijlpaal | Hogere voorspelbaarheid in CI-verharding | Codex |
| DEC-006 | 2026-02-06 | CI-gates volledig verhard (`typecheck`, `jest`, `vitest`, `audit` nu blocking) | Baseline is groen en stabiel genoeg voor harde handhaving | Hogere mergekwaliteit en directe regressie-signalen | Codex |

## 13. Blokkades en afhankelijkheden
Gebruik dit blok voor issues die voortgang blokkeren.

| Blocker-ID | Datum | Blokkade | Impact op acties | Eigenaar | Status |
| --- | --- | --- | --- | --- | --- |
| BLK-001 | 2026-02-05 | Externe secret-rotatie nodig (Strapi, Vercel OIDC, SMTP, admin credentials) | ACT-001 | n.t.b. | Open |
| BLK-002 | 2026-02-05 | Git history rewrite vereist gecoördineerde force-push en teamafstemming | ACT-002 | n.t.b. | Open |
| BLK-003 | 2026-02-05 | Grote functionele Jest-schuld (provider-context, URL/fetch-mocks, renderverwachtingen) verhinderde volledige hard-gating in CI | ACT-012, ACT-020 | Codex | Gesloten (2026-02-06) |

## 14. Werkwijze voor bijwerken
1. Zet bij start van een actie de status op `DOING` en vul `Eigenaar` + `Startdatum`.
2. Voeg elke inhoudelijke wijziging toe aan de `Werklog`.
3. Zet status op `BLOCKED` met bijbehorende regel in sectie 13 als je niet verder kunt.
4. Zet status op `DONE` met `Afgerond op` en verwijs naar bewijs (PR, commit, testresultaat, document).
5. Werk het beslislog bij bij elke architectuur- of governancebeslissing.
