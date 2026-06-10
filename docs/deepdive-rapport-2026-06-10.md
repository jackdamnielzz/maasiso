# Deepdive-rapport MaasISO website — 10 juni 2026

Multi-agent audit over 8 dimensies (architectuur, SEO, performance, security, dependencies, toegankelijkheid/UX, conversie, testing). Elke critical/high-bevinding is door een onafhankelijke, sceptische verificatie-agent gecontroleerd tegen de code; geen enkele is weerlegd, drie zijn in ernst bijgesteld.

**Algemeen beeld:** de basis is voor een eenmanszaak verrassend goed — degelijke security-fundamenten (read-only proxy met allowlist, HMAC-admin-auth, correcte Mollie-webhookverificatie, honeypots en rate limiting), nette SEO-basis (dynamische sitemap, robots, rijke structured data, Consent Mode v2), statische homepage met ISR. De problemen concentreren zich op vier plekken: **(1)** een gelekt root-wachtwoord en privébestanden in de publieke git-historie, **(2)** ~9 weken ongecommit werk op één machine, **(3)** de betaalde TRA-funnel die fragiel én omzeilbaar is, en **(4)** veel dode code/ballast die onderhoud bemoeilijkt.

---

## 🔴 Direct doen (deze week)

### 1. Roteer het root-SSH-wachtwoord van de VPS — CRITICAL
- Commit `528876e` (15-02-2025) bevat in `setup-ssh.ps1` regel 1 het **echte root-wachtwoord** van VPS 147.93.62.188. De repo is **publiek** op GitHub. De huidige versie is geredact, maar `git show 528876e:setup-ssh.ps1` toont het wachtwoord nog steeds.
- **Actie:** wachtwoord nú roteren, `PasswordAuthentication no` instellen (alleen SSH-keys). History-scrub (git filter-repo) is secundair — rotatie is de echte fix. Overweeg de repo privé te maken.

### 2. Commit en push je werk (~9 weken niet gecommit)
- Laatste commit: 7 april. 49 gewijzigde bestanden + untracked nieuwe bestanden (homepage-redesign naar minimal-variant, JsonLd schema-refactor, trailing-slash fixes). Bestaat alleen op deze machine; Vercel deployt vanaf git, dus **niets hiervan staat live**.
- **Valkuil:** 6 getrackte bestanden (o.a. `app/page.tsx:3`, contact, homepage-v2, avg-wetgeving, informatiebeveiliging, iso-certificering) importeren het **untracked** `src/components/seo/JsonLd.tsx`. Selectief committen breekt de Vercel-build; `git add -A` neemt alles mee.
- Verwijder vóór de commit `app/home-premium/` (letterlijke kopie van /homepage-v2 zónder noindex) of geef het dezelfde `robots: { index: false }`.

### 3. Privébestanden uit de publieke repo
- In git getrackt: `OCD CURES RESEARCH (AutoRecovered).docx` (413 KB), `OCD_CURES_RESEARCH_Structured.pdf` (5,7 MB), WhatsApp-foto, dubbele megabyte-afbeeldingen (niels.png 7 MB in root én public/), testdumps. Pack-grootte: 387 MiB.
- **Actie:** `git rm` + commit; voor de privé-medische bestanden history-rewrite met git filter-repo + force-push, daarna GitHub Support vragen cached views te purgen. `.gitignore` uitbreiden (*.docx, jest-results*.json, *.log).

### 4. TRA-betaalfunnel (€22,99): klant kan met lege handen staan + betaling omzeilbaar
Drie samenhangende problemen, allemaal geverifieerd:
- **Levering hangt 100% aan de browser van de klant.** De webhook (`app/api/tra-webhook/route.ts:24`) is een lege TODO. Rapport komt uit localStorage; e-mail wordt client-side getriggerd vanaf de bedankt-pagina. Klant die na betalen de bedankt-pagina niet bereikt (tab dicht, in-app browser, ander device) krijgt: geen PDF, geen e-mail, geen factuur — en er is geen serverspoor. De e-mail bevat bovendien alleen de factuur, niet het rapport, terwijl de UI zegt "wij kunnen het rapport naderhand niet opnieuw aanleveren". Chargeback-risico.
- **Betaal-bypass:** `tra-payment-status/route.ts:21-27` accepteert elk ID dat met `free_` begint als "paid", zonder validatie. URL handmatig aanpassen = gratis rapport.
- **Open e-mail-endpoint:** `tra-send-email/route.ts` verstuurt zonder auth/betalingscheck facturen naar willekeurige adressen vanaf info@maasiso.nl (domeinreputatie/phishing-risico, Resend-quota).
- **Actie:** (a) laat de webhook bij status 'paid' de bevestigingsmail + factuur versturen (paymentId + e-mail zitten in Mollie-metadata) met logging/alerting; (b) verifieer in tra-send-email de Mollie-status én gebruik het e-mailadres uit payment.metadata i.p.v. de request-body; (c) vervang de `free_`-startsWith-check door een ondertekend token (HMAC). Rapport-als-bijlage vergt een bewuste keuze: de rapportdata verlaat nu bewust de browser niet (privacy-belofte in de UI) — dat is een ontwerpbeslissing, geen bug.

---

## 🟠 Hoge prioriteit (deze maand)

### 5. Dependencies: bekende vulnerabilities (30 min werk)
- `npm audit --omit=dev`: 1 critical (jspdf — hier waarschijnlijk niet exploiteerbaar, maar fix is gratis), 2 high. Next 16.1.6 heeft ~19 open advisories (o.a. middleware-bypass die de CSRF-check in `src/middleware.ts` raakt) — gefixt in 16.2.9. Nodemailer-advisories raken `lead-submit` (replyTo is user input).
- **Actie:** `npm audit fix`, `npm i next@16.2.9`, build + smoke test. Nodemailer v8-upgrade apart plannen — of beter: lead-submit migreren naar Resend (al aanwezig, domein geverifieerd) en nodemailer verwijderen.

### 6. SEO: tegenstrijdig trailing-slash-beleid (oorzaak van de ~102 issues)
- Middleware en sitemap dwingen URL's **mét** slash af; vrijwel alle canonicals/og:urls/schema-URL's staan **zónder** slash; `scripts/seo-verify.js` verwacht een derde variant. Canonicals wijzen dus naar URL's die 301-redirecten — signaalconflict richting Google, GSC-meldingen, en een eigen SEO-check die nooit groen kan worden.
- **Actie (simpeler dan het lijkt):** zet `trailingSlash: true` in next.config.js — Next' metadata-resolver past dan automatisch alle relatieve canonicals/og:urls aan. Pas daarnaast de hardcoded absolute schema-URL's aan (o.a. `app/kennis/blog/[slug]/page.tsx:178,242-244`) en vervang in seo-verify.js de allowlist door de regel "canonical == finale URL na redirects".

### 7. Blogcontent rendert client-side (`ssr: false`) — schaadt LCP/CLS op je belangrijkste contentkanaal
- `BlogPostContent.tsx:142-144` laadt react-markdown met `{ ssr: false }`: artikeltekst staat niet in de server-HTML. Zelfde patroon in `MarkdownContent.tsx:8` en `DynamicBlogCard.tsx:23`. Ook het featured image (LazyImage) blijft `opacity-0` tot client-side onLoad — het LCP-element is onzichtbaar tot na hydration.
- **Actie:** minimale fix is `{ ssr: false }` verwijderen (react-markdown werkt prima server-side); LazyImage de priority-afbeelding direct zichtbaar laten renderen.

### 8. Geen purchase-tracking op de enige echte transactie
- Grep op purchase/begin_checkout in de TRA-funnel: nul treffers. GA4/Ads zien de €22,99-conversies niet en kunnen er niet op optimaliseren.
- **Actie:** `begin_checkout` in handlePurchase (met beacon-transport, vóór de Mollie-redirect) en `purchase` op de bedankt-pagina (transaction_id = paymentId; bedrag uit `/api/tra-payment-status` laten komen i.v.m. kortingscodes — voeg payment.amount.value toe aan die response).

### 9. Whitepaper-funnel is in zijn geheel kapot én lek
- De Strapi v5-respons matcht niet met de v4-mapping in getWhitepapers/mapWhitepaper → downloadLink altijd leeg, modal kan nooit openen. Daarbovenop dubbele apiUrl-prefix in `WhitepaperDownloadModal.tsx:53`. En als hij werkt: de detailpagina biedt dezelfde PDF ongegate aan (`[slug]/page.tsx:132-142`) — lead-formulier omzeilbaar in één klik.
- **Actie:** mapping naar v5-vorm fixen (data.file?.url), dubbele prefix weg, en één bewuste keuze: overal gaten of nergens.

### 10. Toegankelijkheid: twee pijnlijke punten op de live homepage
- **Contrast:** `text-gray-400` op wit (±2,5:1, WCAG AA vereist 4,5:1) door de hele home-minimal set, inclusief de helft van de H1 en de trust-claims; `text-gray-300` (~1,4:1) in StatsMinimal:36 en AanpakMinimal:69 is nog erger. Fix: gray-500 of donkerder (op de donkere Testimonials-sectie juist andersom). Ook wit-op-oranje (#FF8B00, ±2,35:1) op de belangrijkste conversieknoppen: gebruik donkere tekst (#091E42) op oranje.
- **Cookie-instellingen** (`CookiePreferences.tsx`): de vier consent-toggles zijn naamloze sr-only checkboxes — blinde gebruikers kunnen niet zien welke categorie ze aan/uitzetten. Voor een AVG-consultant extra pijnlijk. Fix: echte `<label>` om elke toggle (lost ook de div-onClick op).

---

## 🟡 Opruimronde (gepland, geen haast)

1. **Dode code (~de helft van de codebase-complexiteit):**
   - 4 generaties homepage-componenten (~3000 regels): `src/components/home/` (door niemand geïmporteerd, maar wél in de uncommitted diff — je onderhoudt dode code), `home-v3/` + `app/page.v3.tsx` (geen geldige route), `app/page.tsx.backup`. Bewaar in een branch, verwijder uit de werkboom.
   - Dode tweede API-laag: `src/lib/api/` (circuit-breaker, request-queue) — door geen pagina gebruikt.
   - Zelfgebouwde monitoringstack die per bezoeker data POST naar `/api/metrics` dat alles weggooit. Verwijderen; Web Vitals krijg je via Vercel/GA4.
   - VPS/PM2-restanten (server.js, ecosystem.config.js, nginx-configs, `output: 'standalone'`, 153.92.223.23-remotePatterns) — alles draait op Vercel.
   - `pages/`-hybride voor één admin-tool → naar App Router, pages/ weg.
   - Drie parallelle JSON-LD-implementaties → JsonLd-refactor afmaken, twee verwijderen.
2. **CI groen maken:** lint faalt door config-omissie (`next/core-web-vitals` niet ge-extend, react-hooks-plugin ontbreekt), audit-gate draait over devDeps en kan nooit slagen (`--omit=dev`), 4 Jest-suites verouderd, typecheck struikelt over stale `.next`. Elke check is nu rood = nul signaal.
3. **Error-tracking:** Sentry free tier op de betaal-/e-mailroutes + UptimeRobot op `/api/health`. Nu verdwijnt alles in console.log.
4. **Strapi-storing:** blogposts geven dan 404 i.p.v. 500 (`api.ts:789-792`) — Google kan ze de-indexeren. Onderscheid "niet gevonden" van "fetch mislukt".
5. **Dependencies-hygiëne:** googleapis (195 MB!) naar aparte scripts-package of @googleapis/-subpakketten; zod/web-vitals naar dependencies, @types/pg naar devDeps; node-fetch v2, marked, pdfkit, critters verwijderen; Jest+Vitest consolideren naar Vitest; ESLint 9 + flat config.

## 🟢 Kleine conversie- en UX-winsten
- Telefoon/e-mail in de footer klikbaar maken (`tel:`/`mailto:`) — MKB-beslissers bellen.
- TRA-calculator is vrijwel onvindbaar (alleen gelinkt vanuit één blogpost) én ontbreekt in de sitemap → footer + sitemap + homepage-vermelding naast de ISO-Selector.
- Eén primaire CTA: header pusht nu ISO-Selector, hero pusht contact — kies "Plan een kennismaking".
- Hardcoded niet-verifieerbare testimonials vervangen door één echte case/referentie.
- Calendly-tracking op /bedankt heeft een initialisatie-race (isInitialized-guard) — waarschijnlijk gaan die conversies verloren; `generate_lead` wordt bovendien dubbel gepusht (gtag én dataLayer).
- 404-pagina: links naar dienstenhubs + contact-CTA.
- Skip-link, aria-live op formulierfeedback, dialog-semantiek op modals, Escape/focus-trap, Nederlands aria-label op hamburger.
- Foutmelding-fallback op dienstenpagina's ("Strapi content ontbreekt") vervangen door commerciële fallback met contact-CTA.
- og:image (maasisohome.png) is 1,5 MB → comprimeren naar <300 KB op 1200×630; `images.minimumCacheTTL: 30` → 86400+; AVIF toevoegen.

---

*Gegenereerd door multi-agent deepdive (27 agents, 645 tool calls). Alle critical/high-bevindingen adversarieel geverifieerd tegen de code op 10 juni 2026.*
