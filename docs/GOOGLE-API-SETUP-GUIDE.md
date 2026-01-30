# Google API Setup voor Automatisch Beheer

## Doel

Dit document beschrijft hoe je API toegang instelt zodat scripts automatisch Google Tag Manager en Google Analytics kunnen beheren.

## Stap 1: Google Cloud Project Aanmaken

1. **Ga naar:** https://console.cloud.google.com/
2. **Login** met je Google account (dezelfde als GTM/GA4)
3. **Klik** op project dropdown (linksboven)
4. **Klik** "NEW PROJECT"
5. **Naam:** `MaasISO-Analytics-Management`
6. **Klik** "CREATE"

## Stap 2: APIs Inschakelen

Ga naar **APIs & Services → Library** en enable deze APIs:

### Voor Google Tag Manager:
1. Zoek: "Tag Manager API"
2. Klik op resultaat
3. Klik "ENABLE"

### Voor Google Analytics:
1. Zoek: "Google Analytics Admin API"
2. Klik "ENABLE"

2. Zoek: "Google Analytics Data API"  
3. Klik "ENABLE"

## Stap 3: Service Account Aanmaken

1. **Ga naar:** APIs & Services → Credentials
2. **Klik:** "CREATE CREDENTIALS" → "Service account"
3. **Vul in:**
   - Service account name: `maasiso-analytics-bot`
   - Service account ID: (automatisch)
   - Description: `Automated analytics management for MaasISO`
4. **Klik:** "CREATE AND CONTINUE"
5. **Role:** Skip (we geven toegang in GTM/GA4 zelf)
6. **Klik:** "DONE"

## Stap 4: JSON Key Downloaden

1. **Klik** op de zojuist aangemaakte service account
2. **Ga naar** "KEYS" tab
3. **Klik:** "ADD KEY" → "Create new key"
4. **Type:** JSON
5. **Klik:** "CREATE"
6. **Bestand wordt gedownload** (bewaar veilig!)

## Stap 5: Toegang Geven in Google Tag Manager

1. **Ga naar:** https://tagmanager.google.com/
2. **Open** container GTM-556J8S8K
3. **Klik:** Admin (tandwiel icoon)
4. **Klik:** "User Management"
5. **Klik:** "+" → "Add users"
6. **Email:** Het email adres van de service account  
   (te vinden in de JSON key, veld: `client_email`)
   Ziet eruit als: `maasiso-analytics-bot@maasiso-analytics-management.iam.gserviceaccount.com`
7. **Container permissions:** "Publish"
8. **Klik:** "INVITE"

## Stap 6: Toegang Geven in Google Analytics 4

1. **Ga naar:** https://analytics.google.com/
2. **Open** je MaasISO property
3. **Klik:** Admin (tandwiel)
4. **Property kolom:** "Property Access Management"
5. **Klik:** "+" → "Add users"
6. **Email:** Dezelfde service account email als hierboven
7. **Role:** "Editor" (of "Administrator" voor volledige controle)
8. **Klik:** "ADD"

## Stap 7: JSON Key Opslaan in Project

**BELANGRIJK:** De JSON key moet NOOIT in git komen!

1. **Maak bestand:** `.env.local` (in project root)
2. **Voeg toe:**
```
GOOGLE_APPLICATION_CREDENTIALS=./secrets/google-service-account.json
```

3. **Maak map:** `secrets/` (in project root)
4. **Kopieer** de gedownloade JSON key naar `secrets/google-service-account.json`
5. **Check** dat `secrets/` in `.gitignore` staat!

## Stap 8: Verificatie

Na deze setup kan ik scripts maken die:

- ✅ GTM containers lezen en bewerken
- ✅ Tags aanmaken/wijzigen/verwijderen
- ✅ Triggers configureren
- ✅ GA4 properties beheren
- ✅ GA4 data opvragen
- ✅ Custom reports genereren

## Benodigde Informatie

Als je dit hebt ingesteld, deel dan met mij (veilig, niet in git!):

1. **JSON key bestand** → Zet in `secrets/google-service-account.json`
2. **GTM Container ID:** GTM-556J8S8K (hebben we al)
3. **GA4 Property ID:** G-XXXXXXX (heb ik nodig)
4. **GA4 Account ID:** (te vinden in Admin → Account Settings)

## Tijdsinschatting

| Stap | Tijd |
|------|------|
| Cloud Project maken | 2 min |
| APIs inschakelen | 3 min |
| Service Account maken | 3 min |
| Key downloaden | 1 min |
| GTM toegang geven | 2 min |
| GA4 toegang geven | 2 min |
| **Totaal** | **~15 min** |

## Veiligheid

- JSON key = wachtwoord! Behandel het zo.
- Nooit in git, nooit delen via chat
- Gebruik environment variables
- Roteer de key jaarlijks

---

**Zodra je dit hebt gedaan, kan ik automatische scripts maken voor:**
- GTM tag management
- GA4 configuratie controle
- Automated reporting
- Consent Mode verificatie
