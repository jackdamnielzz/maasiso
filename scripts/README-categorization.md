# Blog Post Categorization Scripts

Deze scripts helpen bij het automatisch toewijzen van categorieën en tags aan blog posts op basis van hun inhoud.

## Scripts

### 1. `clear-blog-categories-tags.js`
Verwijdert alle bestaande categorieën en tags van alle blog posts.

### 2. `categorize-blog-posts.js`
Analyseert de inhoud van elke blog post en wijst automatisch de meest relevante categorie en tags toe.

## Gebruik

### Stap 1: Eerst alle bestaande categorieën en tags verwijderen
```bash
node scripts/clear-blog-categories-tags.js
```

### Stap 2: Automatisch nieuwe categorieën en tags toewijzen
```bash
node scripts/categorize-blog-posts.js
```

## Hoe werkt het?

Het categorisatie script analyseert de titel en inhoud van elke blog post en:

1. **Bepaalt de beste categorie** door te zoeken naar specifieke keywords die bij elke categorie horen
2. **Selecteert relevante tags** op basis van gevonden termen in de content
3. **Update de blog post** via de Strapi API

## Categorieën

Het script kent de volgende categorieën:

- **ISO 9001 Kwaliteitsmanagement** - Voor artikelen over kwaliteitsmanagementsystemen
- **ISO 27001 Informatiebeveiliging** - Voor content over informatiebeveiliging en cybersecurity
- **AVG / GDPR Privacywetgeving** - Voor privacy en gegevensbescherming onderwerpen
- **ISO 14001 Milieu** - Voor milieu en duurzaamheid gerelateerde content
- **ISO 45001 Arbomanagement** - Voor veiligheid en gezondheid op het werk
- **ISO 50001 Energiebeheer** - Voor energiemanagement onderwerpen
- **ISO 16175 Informatiebeheer** - Voor documentbeheer en archivering
- **Control and Risk Self-Assessment (CRSA)** - Voor risicobeoordeling content
- **Algemene Kwaliteitszorg & KAM** - Voor algemene kwaliteitszorg onderwerpen
- **Consultancy & Implementatie** - Voor advies en implementatie artikelen
- **Wet- & Regelgeving** - Voor juridische en compliance onderwerpen
- **Cases & Praktijkvoorbeelden** - Voor case studies en praktijkvoorbeelden
- **Tools & Software** - Voor artikelen over tools en software oplossingen

## Tags

Het script kan meer dan 100 verschillende tags toewijzen, waaronder:
- ISO norm specifieke tags (iso-9001, iso-27001, etc.)
- Onderwerp tags (audit, risicomanagement, compliance, etc.)
- Proces tags (implementatie, certificering, training, etc.)
- Tool tags (dashboard, software, checklist, etc.)

## Aanpassen

### Nieuwe categorie toevoegen
Voeg een nieuwe entry toe aan het `CATEGORIES` object in `categorize-blog-posts.js`:

```javascript
'nieuwe-categorie-slug': {
  name: 'Nieuwe Categorie Naam',
  keywords: ['keyword1', 'keyword2', 'keyword3']
}
```

### Nieuwe tag toevoegen
Voeg een nieuwe entry toe aan het `TAG_KEYWORDS` object:

```javascript
'nieuwe-tag': ['zoekterm1', 'zoekterm2', 'zoekterm3']
```

## Belangrijk

- Het script gebruikt keyword matching, geen AI. Voor betere resultaten kun je de keywords per categorie uitbreiden.
- Elke blog post krijgt exact 1 categorie toegewezen
- Elke blog post kan maximaal 10 tags krijgen
- Er wordt een kleine delay (100ms) gebruikt tussen API calls om overbelasting te voorkomen

## Troubleshooting

Als het script faalt:
1. Controleer of de API token nog geldig is
2. Controleer of Strapi draait op het juiste adres (153.92.223.23:1337)
3. Controleer of alle categorieën en tags bestaan in Strapi
4. Bekijk de error logs voor specifieke foutmeldingen 