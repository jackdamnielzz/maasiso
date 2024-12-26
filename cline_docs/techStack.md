# MaasISO Website Technologie Stack

## Huidige Stack
- HTML5
- CSS3 (vanilla CSS, geen preprocessor)
- JavaScript (ES6+, vanilla JS)
- Git voor versiebeheer
- GitHub Pages voor hosting

## Frontend Features

### Bestaand
- Vanilla HTML/CSS/JS
- Component-gebaseerde structuur
- Responsive design

### Cookie Management Systeem
- Vanilla JavaScript cookie consent manager
- Modulair ontwerp
- Configureerbare cookie types:
  - Noodzakelijke cookies
  - Analytische cookies (Google Analytics)
  - Functionele cookies
- Features:
  - Consent opslag (1 jaar)
  - Granulaire cookie controle
  - Settings modal
  - Responsive design
  - Toegankelijkheid

### Nieuwe Features (Gepland)
- Dynamisch content laden
- Client-side routing
- Content caching
- Lazy loading voor media

## Voorgestelde CMS Integratie

### Primaire Optie: Headless CMS
- Strapi
  - Node.js gebaseerd
  - Open-source
  - Flexibel content model
  - RESTful API
  - GraphQL ondersteuning
  - Zelf te hosten

Voordelen:
- Gebruiksvriendelijke admin interface
- Aanpasbare content types
- Uitgebreide API mogelijkheden
- Sterke beveiliging
- Active community

### Alternatieve Opties
1. WordPress (headless mode)
   - Bekend admin interface
   - Groot ecosysteem
   - WordPress REST API

2. NetlifyCMS
   - Git-gebaseerd
   - Markdown files
   - Eenvoudige setup

## Backend Vereisten

### API Laag
- RESTful endpoints
- Content type definities
- Media handling
- Authenticatie

### Database
- Document-based storage
- Content relaties
- Media assets beheer

## Content Hub Architectuur
- Nieuws systeem
- Blog platform
- Whitepapers repository
- Kennisbank
- Zoekfunctionaliteit
- Categorisatie systeem

## Prestaties en SEO
- Statische site generatie
- CDN integratie
- Cache management
- Meta tags optimalisatie

## Ontwikkeltools
- VS Code als primaire editor
- Git voor versiebeheer
- GitHub voor repository hosting

## Beveiliging
- Cookie consent management
- SSL certificaat
- API authenticatie
- CSRF bescherming
- Rate limiting

Deze tech stack combineert de bestaande lichtgewicht aanpak met moderne content management mogelijkheden, waarbij de focus ligt op gebruiksgemak voor content beheerders zonder in te leveren op prestaties of beveiliging.
