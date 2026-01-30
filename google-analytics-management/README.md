# 🎯 Google Analytics & Tag Manager Management

## Overzicht

Dit document beschrijft de geautomatiseerde toegang tot Google Analytics 4 (GA4) en Google Tag Manager (GTM) voor het MaasISO project. Via de Google APIs kunnen we tags, triggers, variabelen, rapportages en configuraties beheren zonder handmatig in te loggen.

**Status:** ✅ VOLLEDIG OPERATIONEEL (Januari 2026)

---

## 📊 Huidige Configuratie

### Google Tag Manager

| Property | Waarde |
|----------|--------|
| Account Naam | MaasISO |
| Account ID | 6303356117 |
| Container Naam | www.maasiso.nl |
| Container ID (Public) | GTM-556J8S8K |
| Container ID (Numeric) | 224608008 |

### Google Analytics 4

| Property | Waarde |
|----------|--------|
| Account Naam | MaasISO |
| Account ID | 336392538 |
| Property Naam | MaasISO |
| Property ID | 467095380 |
| Measurement ID | **G-QHY9D9XR7G** |
| Tijdzone | Europe/Amsterdam |
| Valuta | EUR |
| Website URL | https://www.maasiso.nl |

---

## 🔐 Service Account Toegang

### Service Account Details

```
Email: maasiso-analytics-bot@gen-lang-client-0994431140.iam.gserviceaccount.com
Project: gen-lang-client-0994431140
```

### Toegang Verleend Op

- **Google Tag Manager:** Publish rechten (kan tags maken, bewerken, publiceren)
- **Google Analytics 4:** Editor rechten (kan property beheren, data lezen)

### Credentials Locatie

```
secrets/google-service-account.json
```

⚠️ **BELANGRIJK:** Dit bestand bevat de private key en staat in `.gitignore`. Deel dit bestand NOOIT via chat, email of git!

---

## 🛠️ Beschikbare Scripts

### 1. Verificatie Script

**Bestand:** `scripts/check-google-analytics.js`

**Uitvoeren:**
```bash
node scripts/check-google-analytics.js
```

**Wat het doet:**
- Toont alle GTM accounts en containers
- Lijst alle tags, triggers en variabelen
- Toont alle GA4 properties en data streams
- Verifieert dat de API toegang werkt

### 2. Toekomstige Scripts (Te Maken)

| Script | Doel |
|--------|------|
| `create-gtm-tag.js` | Nieuwe tags aanmaken in GTM |
| `publish-gtm-changes.js` | Wijzigingen publiceren |
| `ga4-report.js` | Rapportages genereren |
| `backup-gtm-container.js` | Container exporteren als backup |
| `sync-consent-mode.js` | Consent Mode settings synchroniseren |

---

## 📋 Wat We Kunnen Doen

### Google Tag Manager (GTM)

#### Lezen
- ✅ Accounts en containers oplijsten
- ✅ Alle tags bekijken
- ✅ Alle triggers bekijken
- ✅ Alle variabelen bekijken
- ✅ Versiegeschiedenis bekijken
- ✅ Workspace status bekijken

#### Schrijven
- ✅ Nieuwe tags aanmaken
- ✅ Tags bewerken
- ✅ Tags verwijderen
- ✅ Triggers aanmaken/bewerken
- ✅ Variabelen aanmaken/bewerken
- ✅ Workspaces beheren

#### Publiceren
- ✅ Wijzigingen publiceren naar live
- ✅ Versies maken
- ✅ Versies terugdraaien

### Google Analytics 4 (GA4)

#### Lezen
- ✅ Account informatie
- ✅ Property instellingen
- ✅ Data streams
- ✅ Conversies
- ✅ Audiences
- ✅ Custom dimensions
- ✅ Custom metrics

#### Schrijven
- ✅ Property instellingen wijzigen
- ✅ Data streams configureren
- ✅ Conversies definiëren
- ✅ Audiences maken
- ✅ Custom dimensions/metrics maken

#### Rapportages (met Data API)
- ✅ Real-time data opvragen
- ✅ Historische data opvragen
- ✅ Custom reports genereren
- ✅ Export naar JSON/CSV

---

## 🏷️ Huidige Tags in GTM

| Tag Naam | Type | Beschrijving |
|----------|------|--------------|
| Google-tag | googtag | Basis Google Tag configuratie |
| GA4 - file_download | gaawe | Track document downloads |

### Huidige Triggers

| Trigger Naam | Type | Beschrijving |
|--------------|------|--------------|
| Aangepaste gebeurtenis | customEvent | Custom event trigger |

### Huidige Variabelen

7 variabelen gedefinieerd (details via verificatie script)

---

## 🔒 Beveiliging & Compliance

### AVG/GDPR Compliance

1. **Google Consent Mode v2** is geïmplementeerd
2. Standaard zijn alle cookies "denied"
3. Pas na expliciete toestemming wordt tracking actief
4. Gebruikers kunnen toestemming intrekken

### API Beveiliging

1. Service Account heeft minimaal benodigde rechten
2. Private key is niet in version control
3. Credentials worden niet gelogd of gedeeld
4. API calls worden gelogd voor audit

### Best Practices

- Roteer de service account key jaarlijks
- Monitor API usage in Google Cloud Console
- Gebruik principe van least privilege
- Backup container configuratie regelmatig

---

## 📈 Implementatie Status

### Wat Is Geïmplementeerd

| Component | Status | Locatie |
|-----------|--------|---------|
| Consent Mode v2 | ✅ | `app/layout.tsx` |
| Cookie consent update | ✅ | `src/lib/cookies/cookieManager.ts` |
| Page view tracking | ✅ | `src/components/common/Analytics.tsx` |
| Scroll depth tracking | ✅ | `src/components/common/Analytics.tsx` |
| Engagement tracking | ✅ | `src/components/common/Analytics.tsx` |
| trackDownload() | ✅ | `src/lib/analytics.ts` |
| trackSearch() | ✅ | `src/lib/analytics.ts` |
| trackFormSubmission() | ✅ | `src/lib/analytics.ts` |
| GTM API script | ✅ | `scripts/check-google-analytics.js` |
| Service Account | ✅ | `secrets/google-service-account.json` |

### Wat Nog Te Doen

| Component | Status | Prioriteit |
|-----------|--------|------------|
| GA4 Data API rapportages | 📋 Gepland | Medium |
| Automated GTM backups | 📋 Gepland | Low |
| Custom event tags | 📋 Gepland | Medium |
| Enhanced ecommerce (indien nodig) | 📋 Optioneel | Low |

---

## 🚀 Gebruik

### Quick Start

```bash
# Verifieer dat alles werkt
node scripts/check-google-analytics.js

# Output toont:
# - GTM container info
# - Alle tags, triggers, variabelen
# - GA4 property info
# - Measurement ID
```

### Track een Download (in code)

```typescript
import { trackDownload } from '@/lib/analytics';

// In een component
<button onClick={() => trackDownload('ISO-checklist.pdf', 'pdf', 'ISO 27001 Blog')}>
  Download PDF
</button>
```

### Track een Formulier

```typescript
import { trackFormSubmission } from '@/lib/analytics';

// Na form submit
trackFormSubmission('contact_form', true);
```

---

## 📚 Gerelateerde Documentatie

- [ANALYTICS-VERIFICATION-GUIDE.md](/docs/ANALYTICS-VERIFICATION-GUIDE.md) - Handmatige verificatie stappen
- [GOOGLE-API-SETUP-GUIDE.md](/docs/GOOGLE-API-SETUP-GUIDE.md) - Initiële setup instructies
- [DOWNLOADABLE-DOCUMENTS-GUIDE.md](/docs/DOWNLOADABLE-DOCUMENTS-GUIDE.md) - Document downloads tracken

---

## 📞 Ondersteuning

Bij problemen met de analytics setup:

1. Run het verificatie script
2. Check de browser console voor errors
3. Verifieer dat Consent Mode correct werkt
4. Check de GTM Preview mode

---

*Laatste update: 30 Januari 2026*
*Documentversie: 1.0*
