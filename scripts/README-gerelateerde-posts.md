# 🔗 Gerelateerde Blog Posts Linken - Handleiding

## Waarom deze tools?

De Strapi Admin UI heeft een bug waardoor je geen gerelateerde posts kunt selecteren. We hebben twee oplossingen:

1. **🌐 Web-based Tool** (aanbevolen) - Gebruiksvriendelijke interface
2. **📟 CLI Script** - Voor gevorderden of automatisering

---

## 🌐 Optie 1: Web-based Tool (Aanbevolen)

### Hoe te openen

1. Start je Next.js development server:
   ```cmd
   npm run dev
   ```

2. Ga naar: **http://localhost:3000/admin/related-posts**

### Wat kun je doen?

- ✅ Alle blog posts bekijken
- ✅ Zoeken in posts
- ✅ Gerelateerde posts selecteren met één klik
- ✅ Wijzigingen direct opslaan
- ✅ Visuele feedback over status

### Vereisten voor opslaan

De web tool heeft directe database toegang nodig. Voeg toe aan je `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**Railway database URL vind je in:**
Railway Dashboard → Project → PostgreSQL → Connect → Connection String

---

## ✅ Testen van de web tool (API)

Gebruik dit script om te verifiëren dat de web tool echt kan lezen + schrijven in de database:

```cmd
# 1) Start de Next.js dev server (nodig voor /api/related-posts)
npm run dev

# 2) Toon of je posts kunt ophalen
node scripts/test-related-posts-webtool.js --list

# 3) Test opslaan + persistence
#    Vervang door echte documentId waarden
node scripts/test-related-posts-webtool.js --source <documentId> --targets <docId1,docId2>
```

**Wat het script controleert:**
1. De tool kan blogposts ophalen via `/api/related-posts?action=list`
2. De tool kan relatedPosts opslaan via `POST /api/related-posts`
3. De relaties blijven bestaan (direct opnieuw ophalen na opslaan)

**Let op:**
- Voor stap 3 is `DATABASE_URL` verplicht (anders is de API read-only)
- De `documentId` waarden vind je via de lijst in stap 2 of via de web tool dropdown

---

## 📟 Optie 2: CLI Script

### Hoe te starten

#### Dubbelklik (makkelijkst)

1. Ga naar: `D:\Programmeren\MaasISO\New without errors\maasiso-strapi-railway\scripts`
2. Dubbelklik op: **`run-link-posts.bat`**
3. Het interactieve menu opent automatisch

#### Via Terminal

1. Open een terminal (Command Prompt of PowerShell)
2. Voer uit:
   ```cmd
   cd "D:\Programmeren\MaasISO\New without errors\maasiso-strapi-railway"
   node scripts/link-gerelateerde-posts.js
   ```

### Menu opties

| Optie | Functie |
|-------|---------|
| **1** | Alle blog posts bekijken (met slugs) |
| **2** | Blog post zoeken op titel of slug |
| **3** | Gerelateerde posts toevoegen aan een post |
| **4** | Bekijken welke posts al gelinkt zijn |
| **5** | Een gerelateerde post verwijderen |
| **6** | Instructies lezen |
| **0** | Afsluiten |

---

## 📝 Stap-voor-stap: Posts linken

### Via Web Tool (aanbevolen)

1. Open http://localhost:3000/admin/related-posts
2. Selecteer een blog post uit de dropdown
3. Klik op posts in de linker kolom om ze te selecteren
4. Bekijk je selectie in de rechter kolom
5. Klik op "Opslaan"

### Via CLI Script

1. **Start het script** (dubbelklik op `run-link-posts.bat`)

2. **Kies optie 3** (Gerelateerde posts toevoegen)

3. **Voer de slug in** van je nieuwe post
   - Voorbeeld: `iso-9001-certificering`
   - De slug vind je in de URL van je blog post

4. **Voer de slugs in** van gerelateerde posts (één per regel)
   - Voorbeeld:
     ```
     checklist-iso-9001
     iso-9001-handboek
     kwaliteitsmanagement-systeem
     ```
   - Druk op **Enter** (lege regel) om te stoppen

5. **Klaar!** Het script toont welke links zijn aangemaakt

---

## 🎯 Hoeveel posts linken?

| Minimum | Optimaal | Maximum |
|---------|----------|---------|
| 2-3 posts | 3-5 posts | 7 posts |

**Tip:** Kwaliteit > kwantiteit. Link alleen naar echt relevante content!

---

## 📚 Voorbeeld: Topical Authority Clusters

### ISO 9001 Cluster
```
iso-9001-certificering
├── checklist-iso-9001
├── iso-9001-handboek
├── kwaliteitsmanagement-systeem
└── interne-audit-iso-9001
```

### ISO 27001 Cluster
```
iso-27001-certificering
├── checklist-iso-27001
├── informatiebeveiliging-beleid
├── risicobeoordeling-iso-27001
└── iso-27001-augustus-2025
```

### AVG/Privacy Cluster
```
avg-compliance
├── avg-beeldmateriaal-toestemming
├── privacy-beleid-opstellen
├── verwerkersovereenkomst
└── dpia-uitvoeren
```

---

## ❓ Veelgestelde vragen

### Hoe vind ik de slug van een post?

De slug is het laatste deel van de URL:
- URL: `https://maasiso.nl/blog/iso-9001-certificering`
- Slug: `iso-9001-certificering`

Of gebruik de web tool of **optie 1/2** in het CLI script om alle slugs te zien.

### Kan ik meerdere posts tegelijk linken?

- **Web tool:** Ja, klik op meerdere posts en sla dan op
- **CLI script:** Ja, voer meerdere slugs in (één per regel)

### Wat als ik een verkeerde link heb gemaakt?

- **Web tool:** Klik op de ✕ naast de post en sla op
- **CLI script:** Gebruik **optie 5** om een link te verwijderen

### Werkt dit ook voor de productie database?

Ja! Beide tools gebruiken de database credentials uit je `.env` of `.env.local` bestand. Zorg dat je de juiste credentials hebt voor productie (Railway).

### Waarom werkt de Strapi Admin UI niet?

Strapi v5 heeft een bug met "self-referencing" relaties. De Admin UI geeft een foutmelding: `Document with id "...", locale "null" not found`. Dit is een bekend probleem dat nog niet is opgelost door Strapi.

### Web tool toont "Read-only (Strapi API)"

Dit betekent dat DATABASE_URL niet is geconfigureerd. Voeg de database URL toe aan `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## 🔧 Troubleshooting

### Web tool: "Cannot save relations"

1. Controleer of DATABASE_URL is ingesteld in `.env.local`
2. Controleer of de database URL correct is
3. Herstart de development server na wijzigingen in `.env.local`

### CLI: "Database configuratie niet gevonden"

Zorg dat je in de juiste folder bent:
```cmd
cd "D:\Programmeren\MaasISO\New without errors\maasiso-strapi-railway"
```

En dat `.env` of `.env.local` bestaat met database credentials.

### "Node.js is niet gevonden"

Installeer Node.js van: https://nodejs.org/

### "Post niet gevonden"

Controleer of:
- De slug correct is gespeld
- De post is gepubliceerd (niet draft)

---

## 📁 Bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `/admin/related-posts` | Web-based tool (Next.js pagina) |
| `/api/related-posts` | API endpoint voor web tool |
| `link-gerelateerde-posts.js` | CLI script met interactief menu |
| `run-link-posts.bat` | Dubbelklik om CLI te starten |
| `README-gerelateerde-posts.md` | Deze handleiding |
| `direct-link-related-posts.js` | Origineel CLI script (voor gevorderden) |

---

## 💡 Tips voor SEO

1. **Link bidirectioneel**: Als A linkt naar B, link B ook naar A
2. **Gebruik relevante anchors**: De titel van de gelinkte post wordt automatisch gebruikt
3. **Bouw clusters**: Groepeer posts per onderwerp (ISO 9001, AVG, etc.)
4. **Update regelmatig**: Voeg nieuwe posts toe aan bestaande clusters

---

## 🔒 Database URL vinden (Railway)

1. Ga naar https://railway.app/dashboard
2. Open je project
3. Klik op de PostgreSQL service
4. Ga naar "Connect" tab
5. Kopieer de "Connection String"
6. Plak in `.env.local` als `DATABASE_URL=...`
