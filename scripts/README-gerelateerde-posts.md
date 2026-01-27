# 🔗 Gerelateerde Blog Posts Linken - Handleiding

## Waarom dit script?

De Strapi Admin UI heeft een bug waardoor je geen gerelateerde posts kunt selecteren. Dit script omzeilt die bug door direct naar de database te schrijven.

---

## 🚀 Hoe te starten

### Optie 1: Dubbelklik (makkelijkst)

1. Ga naar: `D:\Programmeren\MaasISO\New without errors\maasiso-strapi-railway\scripts`
2. Dubbelklik op: **`run-link-posts.bat`**
3. Het interactieve menu opent automatisch

### Optie 2: Via Terminal

1. Open een terminal (Command Prompt of PowerShell)
2. Voer uit:
   ```cmd
   cd "D:\Programmeren\MaasISO\New without errors\maasiso-strapi-railway"
   node scripts/link-gerelateerde-posts.js
   ```

---

## 📋 Wat kun je doen?

Het script heeft een interactief menu met deze opties:

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

### Na het publiceren van een nieuwe blog post:

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

Of gebruik **optie 1** of **optie 2** in het script om alle slugs te zien.

### Kan ik meerdere posts tegelijk linken?

Ja! Bij optie 3 kun je meerdere slugs invoeren (één per regel).

### Wat als ik een verkeerde link heb gemaakt?

Gebruik **optie 5** om een link te verwijderen.

### Werkt dit ook voor de productie database?

Ja, het script gebruikt de database credentials uit je `.env` bestand. Zorg dat je de juiste credentials hebt voor productie (Railway).

### Waarom werkt de Strapi Admin UI niet?

Strapi v5 heeft een bug met "self-referencing" relaties. De Admin UI geeft een foutmelding: `Document with id "...", locale "null" not found`. Dit is een bekend probleem dat nog niet is opgelost door Strapi.

---

## 🔧 Troubleshooting

### "Database configuratie niet gevonden"

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
| `link-gerelateerde-posts.js` | Het hoofdscript met interactief menu |
| `run-link-posts.bat` | Dubbelklik om te starten |
| `README-gerelateerde-posts.md` | Deze handleiding |
| `direct-link-related-posts.js` | Origineel CLI script (voor gevorderden) |

---

## 💡 Tips voor SEO

1. **Link bidirectioneel**: Als A linkt naar B, link B ook naar A
2. **Gebruik relevante anchors**: De titel van de gelinkte post wordt automatisch gebruikt
3. **Bouw clusters**: Groepeer posts per onderwerp (ISO 9001, AVG, etc.)
4. **Update regelmatig**: Voeg nieuwe posts toe aan bestaande clusters
