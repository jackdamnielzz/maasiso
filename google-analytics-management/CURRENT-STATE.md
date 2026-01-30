# 📸 Huidige Staat - GTM & GA4 Configuratie

*Snapshot genomen: 30 Januari 2026*

Dit document bevat de exacte huidige staat van alle configuraties in Google Tag Manager en Google Analytics 4.

---

## Google Tag Manager Container: GTM-556J8S8K

### Container Info

| Property | Waarde |
|----------|--------|
| Naam | www.maasiso.nl |
| Public ID | GTM-556J8S8K |
| Numeric ID | 224608008 |
| Account | MaasISO (6303356117) |
| Domein | Niet ingesteld |

---

### Tags (2 totaal)

#### 1. Google-tag

| Property | Waarde |
|----------|--------|
| Type | googtag (Google Tag) |
| Status | Actief |
| Beschrijving | Basis Google Tag voor GA4 configuratie |

Dit is de primaire tag die de GA4 Measurement ID laadt.

#### 2. GA4 - file_download

| Property | Waarde |
|----------|--------|
| Type | gaawe (GA4 Event) |
| Status | Actief |
| Event Naam | file_download |
| Beschrijving | Tracked wanneer gebruikers bestanden downloaden |

---

### Triggers (1 totaal)

#### 1. Aangepaste gebeurtenis

| Property | Waarde |
|----------|--------|
| Type | customEvent |
| Status | Actief |
| Beschrijving | Triggered op custom dataLayer events |

---

### Variables (7 totaal)

*Exacte variabelen moeten worden opgehaald met gedetailleerde API call*

Verwachte variabelen:
- Click URL
- Click Text
- Page URL
- Page Path
- Page Hostname
- Event
- (Custom variabelen)

---

## Google Analytics 4 Property

### Property Info

| Property | Waarde |
|----------|--------|
| Naam | MaasISO |
| Property ID | 467095380 |
| Account | MaasISO (336392538) |
| Tijdzone | Europe/Amsterdam |
| Valuta | EUR |
| Industrie | OTHER |

---

### Data Streams (1 totaal)

#### Web Data Stream: MaasISO

| Property | Waarde |
|----------|--------|
| Type | WEB_DATA_STREAM |
| Measurement ID | **G-QHY9D9XR7G** |
| Default URI | https://www.maasiso.nl |
| Enhanced Measurement | Vermoedelijk AAN |

#### Enhanced Measurement Features (standaard):
- ✅ Page views
- ✅ Scrolls
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement
- ✅ File downloads

---

### Conversies

*Te verifiëren met Admin API*

Aanbevolen conversies om in te stellen:
- [ ] contact_form_submit
- [ ] file_download
- [ ] newsletter_signup
- [ ] request_quote

---

### Custom Dimensions

*Te verifiëren met Admin API*

Aanbevolen custom dimensions:
- [ ] content_type (blog, dienst, pagina)
- [ ] author (voor blog posts)
- [ ] category (dienst categorie)

---

### Custom Metrics

*Te verifiëren met Admin API*

Aanbevolen custom metrics:
- [ ] scroll_depth
- [ ] engagement_score

---

## Website Implementatie

### Consent Mode v2

**Locatie:** `app/layout.tsx`

```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});
```

**Status:** ✅ Geïmplementeerd

---

### Consent Updates

**Locatie:** `src/lib/cookies/cookieManager.ts`

Wanneer gebruiker accepteert:
```javascript
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted',
  'analytics_storage': 'granted',
});
```

**Status:** ✅ Geïmplementeerd

---

### Analytics Component

**Locatie:** `src/components/common/Analytics.tsx`

Features:
- ✅ Page view tracking
- ✅ Scroll depth tracking (25%, 50%, 75%, 90%, 100%)
- ✅ Engagement tracking (time on page)
- ✅ Visibility change detection

**Status:** ✅ Geïmplementeerd

---

### Tracking Functions

**Locatie:** `src/lib/analytics.ts`

| Functie | Beschrijving | Status |
|---------|--------------|--------|
| `trackDownload()` | Track file downloads | ✅ Beschikbaar |
| `trackSearch()` | Track zoekacties | ✅ Beschikbaar |
| `trackFormSubmission()` | Track formulieren | ✅ Beschikbaar |
| `trackOutboundLink()` | Track externe links | ✅ Beschikbaar |
| `trackScrollDepth()` | Track scroll percentage | ✅ Beschikbaar |
| `trackEngagement()` | Track engagement metrics | ✅ Beschikbaar |
| `trackWebVital()` | Track Core Web Vitals | ✅ Beschikbaar |

---

## Aanbevelingen

### GTM Tags Toe Te Voegen

1. **GA4 - Contact Form Submit**
   - Trigger: custom event `contact_form_submit`
   - Parameters: form_name, form_location

2. **GA4 - Scroll Tracking**
   - Trigger: Scroll Depth trigger (25, 50, 75, 100%)
   - Parameters: scroll_depth_percentage

3. **GA4 - Outbound Link Click**
   - Trigger: Link Click (outbound)
   - Parameters: link_url, link_text

### GA4 Conversies Toe Te Voegen

1. `contact_form_submit` - Contactformulier verzonden
2. `file_download` - Document gedownload
3. `generate_lead` - Lead gegenereerd

### GA4 Audiences Toe Te Voegen

1. **Engaged Visitors** - >2 min op site OF >50% scroll
2. **Potential Leads** - Bezocht diensten pagina's
3. **Blog Readers** - Bezocht 3+ blog posts

---

## Wijzigingslog

| Datum | Wijziging | Door |
|-------|-----------|------|
| 30-01-2026 | Initiële documentatie | API Script |
| 30-01-2026 | Consent Mode v2 toegevoegd | Roo |
| 30-01-2026 | Analytics component verbeterd | Roo |
| 30-01-2026 | API toegang geconfigureerd | Roo |

---

*Dit document wordt automatisch bijgewerkt door het verificatie script.*
