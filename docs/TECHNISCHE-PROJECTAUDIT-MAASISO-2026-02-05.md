# Technische Projectaudit MaasISO
Versie: 1.0  
Datum: 5 februari 2026  
Status: Definitief (momentopname)  
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

Belangrijkste feitelijke checks:
- `npm run build` -> geslaagd (laatst bekende run)
- `npm run build:prod` -> geslaagd (zonder `SKIP_TYPESCRIPT` en zonder `--no-lint`, laatst bekende run)
- `npm run lint` -> geslaagd (herbevestigd op 5 februari 2026)
- `npm run test:jest -- --runInBand` -> 49 suites, 38 failed; 330 tests, 97 failed (herbevestigd op 5 februari 2026)
- `npm run test:vitest` -> 14 files, 14 passed; 139 tests, 139 passed (herbevestigd op 5 februari 2026)
- `npm run typecheck` -> geslaagd (herbevestigd op 5 februari 2026)
- `npx tsc --noEmit -p tsconfig.prod.json` -> geslaagd (herbevestigd op 5 februari 2026)
- `npm audit --json` -> 12 kwetsbaarheden (2 critical, 2 high)

## 2.1 Update voortgang (5 februari 2026 - herstelronde type/normalizers)
Nieuwe verificatie uitgevoerd na herstelwerk op normalizers en type-tests:
- `npx jest --runInBand --json --outputFile=jest-results-latest.json` -> **45 suites, 45 passed; 340 tests, 340 passed**

Afgeronde acties in deze ronde:
- normalizers geharmoniseerd op typecontracten (ID's consequent naar `string` voor categorieen, tags, blogposts, componenten en navigatie-entiteiten);
- `normalizeTag` robuust gemaakt voor flat en nested Strapi-structuren;
- `normalizeNewsArticle` casing-prioriteit gecorrigeerd (`Content` voor `content`);
- page-component normalisatie geharmoniseerd met component-normalizers (geen geforceerde ID-prefixen, consistente output);
- image-normalisatie verbeterd voor URL's zonder extensie en met query-parameters;
- kapotte testsuite `src/lib/types/image.test.ts` volledig hersteld en opgeschoond.

Status na deze ronde:
- Jest kwaliteitsblokkade uit eerdere momentopname is opgelost.
- Openstaande prioriteiten uit dit auditdocument liggen nu primair op security/governance (secrets, tokengebruik, proxy-hardening), niet meer op teststabiliteit.

## 3. Meetresultaten (objectief)

| Onderdeel | Resultaat |
| --- | --- |
| Build | Geslaagd (`next build`, `npm run build:prod`) |
| Lint | Geslaagd (`eslint app src --ext .js,.jsx,.ts,.tsx`) |
| Jest tests | 49 suites, 38 failed; 330 tests, 97 failed |
| Vitest tests | 14 files, 14 passed; 139 tests, 139 passed |
| Typecheck (repo-breed) | Geslaagd (`npm run typecheck`) |
| Typecheck (prod-profiel) | Geslaagd (`npx tsc --noEmit -p tsconfig.prod.json`) |
| Dependency audit | 12 vulnerabilities (2 critical, 2 high, 5 moderate, 3 low) |

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

### H-02 Verplichte SSOT routes ontbreken
**Impact**  
Onvolledige architectuurimplementatie.

**Bewijs**  
- SSOT eist `/iso-selector`: `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:127`
- SSOT eist `/kennis/whitepapers/:slug`: `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:120`
- In code ontbreekt `app/iso-selector/page.tsx`
- In code ontbreekt `app/kennis/whitepapers/[slug]/page.tsx`
- In code ontbreekt `app/kennis/e-learning/[slug]`

**Aanpak**  
Routeset expliciet gelijk trekken met SSOT-document.

---

### H-03 Waarschijnlijk dode endpoint voor whitepaper leads
**Impact**  
Leadformulier kan in productie falen.

**Bewijs**  
- Frontend call: `src/components/features/WhitepaperCard.tsx:37` (`/api/whitepaper-leads`)
- Endpoint staat onder `src/app/api/whitepaper-leads/route.ts:4`
- Actieve route-manifest bevat geen `/api/whitepaper-leads/route` in root app manifest

**Aanpak**  
Endpoint verplaatsen naar `app/api/whitepaper-leads/route.ts` of frontend routepad aanpassen.

---

### H-04 QA-pipeline is deels hersteld, maar nog niet volledig groen
**Impact**  
Lint, build en typechecks zijn groen, maar omvangrijke Jest-schuld houdt de kwaliteitslijn rood.

**Bewijs**  
- `package.json:16` gebruikt nu ESLint CLI.
- `package.json:25`, `package.json:26`, `package.json:27` scheiden `test`, `test:jest` en `test:vitest`.
- `jest.config.js:19` sluit Vitest-specifieke testpaden uit.
- `vitest.config.ts:20` bevat een expliciete include-lijst voor Vitest suites.
- `npm run test:jest -- --runInBand` -> 49 suites, 38 failed; 330 tests, 97 failed.
- `npm run test:vitest` -> 14 files, 14 passed; 139 tests, 139 passed.
- `npm run typecheck` -> geslaagd.
- `npx tsc --noEmit -p tsconfig.prod.json` -> geslaagd.
- `jest-results.json` toont grootste fail-clusters in `ErrorBoundary`, `RelatedPosts`, `imageOptimization`, `NewsCard`, `ProgressiveContent`.

**Aanpak**  
1. Jest-failures clusteren en herstellen op root-cause (provider wrappers, URL/fetch-mocks, rendering expectations).  
2. Gestandaardiseerde `renderWithProviders` testhulp invoeren voor componenttests met context-afhankelijkheden.  
3. Na Jest-baseline: CI-gates voor test/typecheck van diagnostisch naar hard afdwingen.

---

### H-05 CI-gates zijn gestart, maar nog niet volledig afdwingbaar
**Impact**  
Basiskwaliteit is nu geautomatiseerd, maar test/typecheck/security draaien nog diagnostisch en blokkeren merges nog niet.

**Bewijs**  
- `.github/workflows/seo-verify.yml:1`
- `.github/workflows/quality-gates.yml:1` toegevoegd met verplichte `lint + build`.
- In dezelfde workflow draaien `typecheck`, `jest`, `vitest`, `audit` met `continue-on-error`.

**Aanpak**  
1. `continue-on-error` gefaseerd verwijderen zodra baseline stabiel is.  
2. Tests/typecheck/audit promoveren naar harde gates op PR's.  
3. Security threshold expliciet maken (bijv. fail op `high`/`critical`).

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

### M-03 `next.config.js` bevat tegenstrijdige `splitChunks` definitie
**Impact**  
Onvoorspelbaar bundlegedrag; eerste `cacheGroups` wordt overschreven.

**Bewijs**  
- `next.config.js:63`
- `next.config.js:80`

---

### M-04 Overmatige logging in app/runtime
**Impact**  
Ruis, mogelijke prestatie-impact en groter risico op gevoelige logdata.

**Bewijs**  
- Veel `console.*` statements in `app/src/pages` (honderden).
- Voorbeelden:
  - `src/lib/monitoredFetch.ts:8`
  - `src/lib/monitoredFetch.ts:40`
  - `src/components/layout/Header.tsx:17`
  - `app/[slug]/page.tsx:42`

---

### M-05 Repository hygiene: artifacts/logs in git
**Impact**  
Onnodige repo-omvang en ruis.

**Bewijs**  
- `test-deploy/.next/cache/webpack/client-production/0.pack`
- `logs/pm2-error.log`
- `deploy.tar.gz`

---

### M-06 Structured data bevat placeholders
**Impact**  
Onjuiste bedrijfsdata in schema markup.

**Bewijs**  
- `app/layout.tsx:115`
- `app/layout.tsx:116`
- `app/layout.tsx:117`

---

### M-07 Navigatie wijkt af van SSOT (desktop hoofdmenu)
**Impact**  
Functionele afwijking ten opzichte van definitieve navigatiestructuur.

**Bewijs**  
- SSOT verwacht menu met `Kennis`: `001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:137`
- Header bevat geen `Kennis` item:
  - `src/components/layout/Header.tsx:57`
  - `src/components/layout/Header.tsx:65`
  - `src/components/layout/Header.tsx:73`
  - `src/components/layout/Header.tsx:81`
  - `src/components/layout/Header.tsx:89`
  - `src/components/layout/Header.tsx:97`

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
3. Publieke Strapi tokenflow stopzetten (`NEXT_PUBLIC_STRAPI_TOKEN` uit productiepad).  
4. `api/proxy` en `api/health` direct afschermen.

### Fase 1 (2-7 dagen)
1. Routecanoniek herstellen naar SSOT (`/kennis/*` leidend).  
2. Ontbrekende verplichte routes implementeren (`/iso-selector`, whitepaper detailroute).  
3. Sitemap en canonical tags corrigeren.  
4. Whitepaper lead endpoint op actieve routebasis zetten.

### Fase 2 (1-2 weken)
1. QA stack normaliseren (lint + test + typecheck).  
2. CI uitbreiden met harde gates voor build/test/type/security.  
3. Productiedeploys blokkeren bij kwaliteitsfouten.

### Fase 3 (2-4 weken)
1. Dode code, backupbestanden en artifacts opruimen.  
2. Loggingbeleid aanscherpen.  
3. Governance-validatie van warnings naar afdwingbare fouten waar SSOT dit vereist.

## 9. Conclusie
De codebase is operationeel buildbaar, maar heeft kritieke security- en governanceproblemen die eerst opgelost moeten worden voordat verdere inhoudelijke ontwikkeling veilig en duurzaam is. Prioriteit ligt bij secret-incidentresponse, token-architectuurherstel en routecanoniek conform het definitieve architectuurdocument.

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
| ACT-008 | DONE | Hoog | Ontbrekende SSOT-routes toevoegen (`/iso-selector`, whitepaper detailroute) | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `app/iso-selector/page.tsx`, `app/kennis/whitepapers/[slug]/page.tsx`, `src/lib/api.ts` |
| ACT-009 | DONE | Hoog | Whitepaper-lead endpoint op actieve routebasis brengen | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `app/api/whitepaper-leads/route.ts` (actieve app-router route) |
| ACT-010 | DONE | Hoog | Lintproces repareren voor Next 16 setup | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `package.json`, `.eslintrc.json` -> `npm run lint` geslaagd |
| ACT-011 | DONE | Hoog | Teststack normaliseren (Jest/Vitest scheiden of unificeren) | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `package.json`, `jest.config.js`, `vitest.config.ts`; scheiding gereed, inhoudelijke testschuld blijft |
| ACT-012 | DOING | Hoog | CI uitbreiden met build/test/type/security gates | Codex | 2026-02-05 | 2026-02-06 |  | `.github/workflows/quality-gates.yml` toegevoegd; lint/build hard, diagnostics nog non-blocking |
| ACT-013 | DONE | Hoog | Productiebuild zonder `SKIP_TYPESCRIPT` en zonder `--no-lint` | Codex | 2026-02-05 | 2026-02-05 | 2026-02-05 | `package.json` aangepast; `npm run build:prod` geslaagd |
| ACT-020 | DOING | Hoog | Functionele test/typecheck-schuld reduceren tot groene baseline | Codex | 2026-02-05 | 2026-02-06 |  | Typecheck + prod-typecheck groen; Jest teruggebracht naar 97 failing tests (38 suites) |
| ACT-014 | TODO | Middel | Dode code, backupfiles, artifacts en logs uit repo opschonen | n.t.b. |  |  |  | Zie M-01, M-05 |
| ACT-015 | TODO | Middel | Governance-validatie aanscherpen naar SSOT-verplichte checks | n.t.b. |  |  |  | Zie M-02 |
| ACT-016 | TODO | Middel | `next.config.js` splitChunks conflict herstellen | n.t.b. |  |  |  | Zie M-03 |
| ACT-017 | TODO | Middel | Productielogging reduceren en standaardiseren | n.t.b. |  |  |  | Zie M-04 |
| ACT-018 | TODO | Middel | Placeholder bedrijfsdata in structured data vervangen | n.t.b. |  |  |  | Zie M-06 |
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

## 12. Beslislog
Leg hier technische en governance-beslissingen vast.

| Beslis-ID | Datum | Beslissing | Reden | Impact | Besloten door |
| --- | --- | --- | --- | --- | --- |
| DEC-001 | 2026-02-05 | Auditdocument wordt leidend werkdocument voor opvolging | Centrale voortgang en traceerbaarheid | Hogere beheersbaarheid | n.t.b. |
| DEC-002 | 2026-02-05 | Publieke Strapi bearer-tokenflow uitgefaseerd; server-only token via proxy/API-routes | Beperking exfiltratie en client-side token exposure | Securityverbetering met beperkte refactorimpact | Codex |
| DEC-003 | 2026-02-05 | CI opgesplitst in mandatory gates (lint/build) en diagnostische gates (typecheck/tests/audit) | Snel kwaliteitsvangnet zonder team direct te blokkeren op bestaande testschuld | Continue zichtbaarheid en gefaseerde verharding | Codex |
| DEC-004 | 2026-02-05 | `build:prod` mag geen skip-flags meer gebruiken (`SKIP_TYPESCRIPT`, `--no-lint`) | Deploymentpad moet dezelfde kwaliteitsdrempel volgen als reguliere build | Lager risico op regressies in productie | Codex |
| DEC-005 | 2026-02-05 | ACT-020 gefaseerd uitgevoerd: eerst type-baseline groen, daarna Jest-clusters | Sneller risicoreductiepad met meetbare tussenmijlpaal | Hogere voorspelbaarheid in CI-verharding | Codex |

## 13. Blokkades en afhankelijkheden
Gebruik dit blok voor issues die voortgang blokkeren.

| Blocker-ID | Datum | Blokkade | Impact op acties | Eigenaar | Status |
| --- | --- | --- | --- | --- | --- |
| BLK-001 | 2026-02-05 | Externe secret-rotatie nodig (Strapi, Vercel OIDC, SMTP, admin credentials) | ACT-001 | n.t.b. | Open |
| BLK-002 | 2026-02-05 | Git history rewrite vereist gecoördineerde force-push en teamafstemming | ACT-002 | n.t.b. | Open |
| BLK-003 | 2026-02-05 | Grote functionele Jest-schuld (provider-context, URL/fetch-mocks, renderverwachtingen) verhindert volledige hard-gating in CI | ACT-012, ACT-020 | Codex | Open |

## 14. Werkwijze voor bijwerken
1. Zet bij start van een actie de status op `DOING` en vul `Eigenaar` + `Startdatum`.
2. Voeg elke inhoudelijke wijziging toe aan de `Werklog`.
3. Zet status op `BLOCKED` met bijbehorende regel in sectie 13 als je niet verder kunt.
4. Zet status op `DONE` met `Afgerond op` en verwijs naar bewijs (PR, commit, testresultaat, document).
5. Werk het beslislog bij bij elke architectuur- of governancebeslissing.
