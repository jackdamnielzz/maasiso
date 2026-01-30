# Analytics Verificatie Handleiding

## Overzicht

Deze handleiding helpt je te verifiëren dat Google Analytics, Google Tag Manager en de cookie consent correct werken op maasiso.nl.

## Stap 1: Verifieer Website Code (Klaar ✅)

### In de browser (F12 Developer Tools):

1. **Open maasiso.nl** in Chrome
2. **Open DevTools** (F12)
3. **Ga naar Console tab**
4. **Check voor errors**

Je zou dit moeten zien:
```
[Analytics] Initialized
[Analytics] Page view: /
```

### Verifieer Consent Mode in Network tab:

1. **DevTools → Network tab**
2. **Filter op "google" of "gtm"**
3. **Je zou requests moeten zien naar:**
   - `googletagmanager.com/gtm.js`

## Stap 2: Test Cookie Consent Flow

### A. Zonder consent (standaard):

1. **Open incognito venster**
2. **Ga naar maasiso.nl**
3. **Cookie banner verschijnt**
4. **NIET accepteren**
5. **Check in Console:**
   ```
   [Analytics] Page view: /
   ```
   
   Maar in Network tab zie je dat GTM de consent respecteert:
   - `analytics_storage=denied`
   - `ad_storage=denied`

### B. Met consent (na accepteren):

1. **Klik "Alles accepteren"** in cookie banner
2. **Check in Console:**
   ```
   [Cookie Consent] Google Consent Mode updated: {
     ad_storage: 'granted',
     analytics_storage: 'granted'
   }
   ```

## Stap 3: Verifieer in Google Tag Manager

### Login en check container:

1. **Ga naar:** https://tagmanager.google.com/
2. **Open container:** GTM-556J8S8K
3. **Check dat deze tags bestaan:**
   - GA4 Configuration tag
   - GA4 Event tags (page_view, scroll, etc.)

### Consent Mode moet ingesteld zijn:

In GTM → Admin → Container Settings:
- "Require consent for tags" moet **AAN** staan

## Stap 4: Verifieer in Google Analytics

### GA4 Property check:

1. **Ga naar:** https://analytics.google.com/
2. **Open je MaasISO property**
3. **Admin → Data Streams**
4. **Check dat de stream actief is**

### Real-time verificatie:

1. **GA4 → Reports → Realtime**
2. **Open maasiso.nl in nieuwe tab**
3. **Accepteer cookies**
4. **Je zou jezelf moeten zien in Realtime report**

## Stap 5: Google Tag Assistant (Beste Test Tool)

### Installeer extensie:

1. **Ga naar Chrome Web Store**
2. **Zoek "Tag Assistant Companion"**
3. **Installeer de extensie**

### Gebruik Tag Assistant:

1. **Ga naar:** https://tagassistant.google.com/
2. **Klik "Add domain"**
3. **Voer in:** maasiso.nl
4. **Klik "Connect"**
5. **Navigeer op de site**
6. **Tag Assistant toont:**
   - ✅ GTM container geladen
   - ✅ GA4 tags firing
   - ✅ Consent Mode actief

## Stap 6: DebugView in GA4

### Activeer debug mode:

1. **GA4 → Admin → DebugView**
2. **Installeer "Google Analytics Debugger" Chrome extensie**
3. **Of voeg `?debug_mode=1` toe aan URL**
4. **Navigeer op site**
5. **Check DebugView voor events:**
   - `page_view`
   - `scroll`
   - `user_engagement`

## Checklist voor Complete Setup

### Website (Frontend) ✅
- [x] Google Consent Mode v2 script in `<head>` (before GTM)
- [x] GTM container script
- [x] Cookie banner met consent provider
- [x] cookieManager updates consent naar Google
- [x] Analytics component tracked page views

### Google Tag Manager
- [ ] Container GTM-556J8S8K is actief
- [ ] Consent Mode is ingeschakeld in container settings
- [ ] GA4 Configuration tag bestaat
- [ ] GA4 Configuration tag gebruikt Measurement ID
- [ ] Triggers zijn correct geconfigureerd

### Google Analytics 4
- [ ] Property is aangemaakt
- [ ] Data Stream is actief voor maasiso.nl
- [ ] Enhanced Measurement is AAN (scroll, outbound clicks, etc.)
- [ ] Google Signals is AAN (voor demographics, als nodig)
- [ ] Data retention is ingesteld (14 maanden aanbevolen)

## Problemen Oplossen

### Probleem: Geen data in GA4

**Mogelijke oorzaken:**
1. Consent niet geaccepteerd
2. GTM container niet correct geladen
3. GA4 Measurement ID ontbreekt in GTM

**Oplossing:**
- Check Console voor errors
- Check Network tab voor GTM requests
- Verifieer GTM container configuratie

### Probleem: Consent Mode werkt niet

**Check in Console:**
```javascript
// Type dit in console:
dataLayer.filter(e => e[0] === 'consent')
```

Je zou moeten zien:
```javascript
[
  ['consent', 'default', {ad_storage: 'denied', analytics_storage: 'denied', ...}],
  ['consent', 'update', {ad_storage: 'granted', analytics_storage: 'granted', ...}]
]
```

### Probleem: Events komen niet door

**Check:**
1. Is `window.gtag` gedefinieerd? (type `window.gtag` in console)
2. Zijn er JavaScript errors?
3. Is de site correct gedeployed?

## Wat Je Nu Kunt Tracken in GA4

| Report | Locatie in GA4 | Wat je ziet |
|--------|----------------|-------------|
| Realtime | Reports → Realtime | Huidige bezoekers |
| Acquisition | Reports → Acquisition | Waar bezoekers vandaan komen |
| Engagement | Reports → Engagement | Pages, scroll, time |
| Events | Reports → Engagement → Events | Alle custom events |
| Pages | Reports → Engagement → Pages | Top pagina's |
| Demographics | Reports → Demographics | Leeftijd, geslacht (met Signals) |

## AVG/GDPR Compliance Verificatie

### Check dat deze punten kloppen:

1. **Geen tracking VOOR consent** ✅
   - Consent Mode zet alles op "denied" standaard

2. **Functionele cookies altijd toegestaan** ✅
   - Session cookies voor site functionaliteit

3. **Analytics alleen NA consent** ✅
   - `analytics_storage: 'denied'` → geen GA cookies

4. **Marketing alleen NA consent** ✅
   - `ad_storage: 'denied'` → geen advertentie cookies

5. **Gebruiker kan consent intrekken** ✅
   - Cookie instellingen kunnen worden aangepast

## Contact voor Vragen

Als je problemen hebt met de analytics setup, controleer eerst:
1. Deze checklist
2. Browser console voor errors
3. Network tab voor failed requests
4. GTM preview/debug mode

---

*Laatste update: Januari 2026*
