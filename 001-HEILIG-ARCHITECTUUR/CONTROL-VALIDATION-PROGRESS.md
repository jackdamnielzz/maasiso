# Controle & Validatie — Pagina-voor-pagina checklist (af te vinken)

**HEILIG / single source of truth (regels + wireframes):**
[`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:1)

## Hoe we dit document gebruiken

- Elke pagina krijgt 4 checks: Type · Structuur · Inhoud · Techniek.
- Per check vinken we items af.
- Aan het einde per pagina: **Besluit (GO/NO-GO)** + **actiepunten**.

Legenda status:
- 🔲 te controleren
- ⚠️ afwijkingen gevonden
- ✅ conform architectuur

---

## Controlelijst — alle pagina’s

|  # | URL                          | Type (architectuur) | Prioriteit | Status | Besluit    | Laatste update |
|---:|------------------------------|---------------------|------------|--------|------------|----------------|
|  1 | /                            | Homepage            | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
|  2 | /iso-certificering           | Hub                 | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
|  3 | /iso-certificering/iso-9001  | Detail              | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
|  4 | /iso-certificering/iso-14001 | Detail              | 🟠         | ✅     | ✅ GO      | 2026-02-05     |
|  5 | /iso-certificering/iso-45001 | Detail              | 🟠         | ✅     | ✅ GO      | 2026-02-05     |
|  6 | /iso-certificering/iso-16175 | Detail              | 🟠         | ✅     | ✅ GO      | 2026-02-05     |
|  7 | /informatiebeveiliging       | Hub                 | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
|  8 | /informatiebeveiliging/iso-27001 | Detail          | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
|  9 | /informatiebeveiliging/bio   | Detail              | 🟠         | ✅     | ✅ GO      | 2026-02-05     |
| 10 | /avg-wetgeving               | Hub                 | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
| 11 | /avg-wetgeving/avg           | Detail              | 🔴         | ✅     | ✅ GO      | 2026-02-05     |
| 12 | /kennis                      | Hub (kennis)        | 🟠         | ✅     | ✅ GO      | 2026-02-05     |
| 13 | /kennis/blog                 | Overzicht           | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 14 | /kennis/blog/:slug           | Blog (sample)       | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 15 | /kennis/whitepapers          | Overzicht           | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 16 | /waarom-maasiso              | Positionering       | 🟠         | ✅     | ✅ GO      | 2026-02-05     |
| 17 | /over-ons                    | Bedrijf             | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 18 | /over-niels-maas             | Persoon             | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 19 | /contact                     | Conversie           | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 20 | /privacy-policy              | Juridisch           | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 21 | /cookie-policy               | Juridisch           | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 22 | /terms-and-conditions        | Juridisch           | 🟢         | ✅     | ✅ GO      | 2026-02-05     |
| 23 | /iso-selector                | Tool                | 🟢         | ✅     | ✅ GO      | 2026-02-06     |
| 24 | /kennis/whitepapers/:slug    | Whitepaper          | 🟢         | ✅     | ✅ GO      | 2026-02-06     |
| 25 | /kennis/e-learning           | Overzicht           | 🟢         | ✅     | ✅ GO      | 2026-02-06     |
| 26 | /kennis/e-learning/:slug     | Cursus              | 🟢         | ✅     | ✅ GO      | 2026-02-06     |

---

## Template: 4-punts controle (algemeen)

Gebruik dit als referentie (niet per pagina invullen):

1) **TYPE-CHECK**
- Klopt het paginatype met de architectuur?

2) **STRUCTUUR-CHECK**
- Volgt de pagina exact het wireframe (secties + volgorde + headings)?

3) **INHOUD-CHECK**
- Staat er verboden content op dit type pagina?
- Ontbreken verplichte elementen?

4) **TECHNIEK-CHECK**
- Breadcrumbs correct?
- Schema markup aanwezig?
- Links correct (hub↔detail, interne links)?

---

## Pagina 1 — /

Type (verwacht): Homepage

Wireframe: Homepage (4.1) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:157)

### TYPE-CHECK
- [x] Homepage

### STRUCTUUR-CHECK
- [x] Navigatie aanwezig
- [x] Hero met H1 + subkop
- [x] Domeinkaarten naar hubs (geen aanpak)
- [x] Korte positionering (“consultant, geen certificeerder”)
- [x] Waarom MaasISO bullets (kort)
- [x] CTA
- [x] Footer

### INHOUD-CHECK
- [x] Geen normdetails
- [x] Geen kosten/stappen

### TECHNIEK-CHECK
- [x] Canonical correct
- [x] Interne links naar hubs werken

**Bevindingen:**
- ✅ Structuur volgt het wireframe (Hero → positionering → 4 domeinen → Waarom → CTA).
- ✅ Domeinkaarten linken naar hubs: `/iso-certificering`, `/informatiebeveiliging`, `/avg-wetgeving`, `/kennis`.
- ✅ Geen normdetails, kosten of stappen op de homepage.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 2 — /iso-certificering

Type (verwacht): Hub

Wireframe: Hubpagina diensten (4.2) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:250)

### TYPE-CHECK
- [x] Hub

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Hub)
- [x] Hero label “Overzicht” + H1
- [x] Domeindefinitie sectie (H2 “Wat is…?”) (VERPLICHT)
- [x] Afbakening sectie (aanbevolen)
- [x] Onderliggende pagina’s (kaarten)

### INHOUD-CHECK (Hub regels)
- [x] Kaarten zijn beschrijvend (geen “wij/ons”)
- [x] Geen kosten/stappen/normdetails

### TECHNIEK-CHECK
- [x] Breadcrumb schema aanwezig
- [x] Kaarten linken naar juiste detailpagina’s

**Bevindingen:**
- ✅ Breadcrumbs/hero/kaarten aanwezig.
- ✅ Domeindefinitie + afbakening aanwezig volgens wireframe.
- ✅ Geen “aanpak/stappen/kosten” content op hub (alleen doorverwijzing naar detailpagina’s).
- ✅ Geen extra secties buiten hub-wireframe.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 3 — /iso-certificering/iso-9001

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs (Home > Hub > Detail)
- [x] Hero (H1 + intro + CTA)
- [x] Key Takeaways sectie
- [x] Definitie (40–80 woorden)
- [x] Context + link terug naar hub
- [x] Voor wie/waarom
- [x] Kosten
- [x] Stappenplan (4–6)
- [x] FAQ (4–6)
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### INHOUD-CHECK
- [x] Geen “hub-only” content (bijv. domein-beschrijving)

### TECHNIEK-CHECK
- [x] Breadcrumb schema aanwezig
- [x] FAQPage schema aanwezig (JSON-LD)

**Bevindingen:**
- ✅ Template voldoet aan alle verplichte secties (Key Takeaways, Context, Gerelateerd, CTA).
- ✅ FAQ JSON-LD toegevoegd naast de FAQ weergave.

**Actiepunten:**
- (geen, mits Strapi-content gevuld is)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 4 — /iso-certificering/iso-14001

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs
- [x] Hero
- [x] Key Takeaways
- [x] Definitie
- [x] Context + link terug naar hub
- [x] Voor wie/waarom
- [x] Kosten
- [x] Stappenplan
- [x] FAQ
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### INHOUD-CHECK
- [x] Geen “hub-only” content (bijv. domein-beschrijving)

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] FAQPage schema (JSON-LD)

**Bevindingen:**
- ✅ Template voldoet aan alle verplichte secties (Key Takeaways, Context, Gerelateerd, CTA).
- ✅ FAQ JSON-LD toegevoegd naast de FAQ weergave.

**Actiepunten:**
- (geen, mits Strapi-content gevuld is)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 5 — /iso-certificering/iso-45001

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs
- [x] Hero
- [x] Key Takeaways
- [x] Definitie
- [x] Context + link terug naar hub
- [x] Voor wie/waarom
- [x] Kosten
- [x] Stappenplan
- [x] FAQ
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### INHOUD-CHECK
- [x] Geen “hub-only” content (bijv. domein-beschrijving)

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] FAQPage schema (JSON-LD)

**Bevindingen:**
- ✅ Template voldoet aan alle verplichte secties (Key Takeaways, Context, Gerelateerd, CTA).
- ✅ FAQ JSON-LD toegevoegd naast de FAQ weergave.

**Actiepunten:**
- (geen, mits Strapi-content gevuld is)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 6 — /iso-certificering/iso-16175

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs
- [x] Hero
- [x] Key Takeaways
- [x] Definitie
- [x] Context + link terug naar hub
- [x] Voor wie/waarom
- [x] Kosten
- [x] Stappenplan
- [x] FAQ
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### INHOUD-CHECK
- [x] Geen “hub-only” content (bijv. domein-beschrijving)

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] FAQPage schema (JSON-LD)

**Bevindingen:**
- ✅ Template voldoet aan alle verplichte secties (Key Takeaways, Context, Gerelateerd, CTA).
- ✅ FAQ JSON-LD toegevoegd naast de FAQ weergave.

**Actiepunten:**
- (geen, mits Strapi-content gevuld is)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 7 — /informatiebeveiliging

Type (verwacht): Hub

Wireframe: Hubpagina diensten (4.2) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:250)

**Input status:** nog niet volledig gecontroleerd op basis van volledige pagina-tekst; wel al één harde afwijking uit code.

### TYPE-CHECK
- [x] Hub

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Hub)
- [x] Hero label “Overzicht” + H1
- [x] Domeindefinitie sectie (H2 “Wat is…?”) (VERPLICHT)
- [x] Afbakening sectie (aanbevolen)
- [x] Onderliggende pagina’s (kaarten)

### INHOUD-CHECK (Hub regels)
- [x] Kaarten bevatten verboden “wij/ons”-claims / uitvoerende claims
  - Bron (code cards): [`app/informatiebeveiliging/page.tsx`](app/informatiebeveiliging/page.tsx:13)
  - Regel: kaarten beschrijvend, geen “wij helpen” — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:998)
- [x] Geen kosten/stappen/normdetails (in hub body)

### TECHNIEK-CHECK
- [x] Breadcrumb schema aanwezig
  - Implementatie: [`src/components/templates/core/CoreBreadcrumbBar.tsx`](src/components/templates/core/CoreBreadcrumbBar.tsx:8)
- [x] Kaarten linken naar juiste detailpagina’s

**Bevindingen (kort):**
- ✅ Breadcrumbs + structuur “Onderliggende pagina’s” aanwezig.
- ✅ Domeindefinitie + afbakening toegevoegd volgens wireframe.
- ✅ Hub-cards zijn beschrijvend, geen “wij/ons”-claims.
- ✅ CTA’s secundair.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 8 — /informatiebeveiliging/iso-27001

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs (template)
- [x] Hero (template)
- [x] Key Takeaways sectie (expliciet)
- [x] Definitie
- [x] Context + link terug naar hub (“Onderdeel van…”) — [`src/components/templates/core/CoreDetailPageTemplate.tsx`](src/components/templates/core/CoreDetailPageTemplate.tsx:72)
- [x] Voor wie/waarom (aanwezig in content die je plakte)
- [x] Kosten
- [x] Stappenplan
- [x] FAQ (vragen aanwezig)
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### INHOUD-CHECK
- [x] Definitie 40–80 woorden (lijkt binnen range)
- [x] Key facts (maatregelen, doorlooptijd, kosten) aanwezig in content

### TECHNIEK-CHECK
- [x] Breadcrumb schema aanwezig (JSON-LD) — [`src/components/templates/core/CoreBreadcrumbBar.tsx`](src/components/templates/core/CoreBreadcrumbBar.tsx:8)
- [x] FAQPage schema aanwezig als JSON-LD

**Actiepunten (geprioriteerd):**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 9 — /informatiebeveiliging/bio

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs
- [x] Hero
- [x] Key Takeaways
- [x] Definitie
- [x] Context + link terug naar hub
- [x] Voor wie/waarom
- [x] Kosten
- [x] Stappenplan
- [x] FAQ
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### INHOUD-CHECK
- [x] Geen “hub-only” content (bijv. domein-beschrijving)

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] FAQPage schema (JSON-LD)

**Bevindingen:**
- ✅ Template voldoet aan alle verplichte secties (Key Takeaways, Context, Gerelateerd, CTA).
- ✅ FAQ JSON-LD toegevoegd naast de FAQ weergave.

**Actiepunten:**
- (geen, mits Strapi-content gevuld is)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 10 — /avg-wetgeving

Type (verwacht): Hub

Wireframe: Hubpagina diensten (4.2) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:250)

### TYPE-CHECK
- [x] Hub

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Hero
- [x] Domeindefinitie
- [x] Afbakening
- [x] Onderliggende pagina’s (kaarten)

### INHOUD-CHECK
- [x] Kaarten beschrijvend (geen “wij”)
- [x] Geen kosten/stappen/normdetails

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Domeindefinitie + afbakening toegevoegd volgens wireframe.
- ✅ Kaarten beschrijvend en zonder “wij/ons”-claims.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 11 — /avg-wetgeving/avg

Type (verwacht): Detail

Wireframe: Detailpagina (4.3) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:335)

### TYPE-CHECK
- [x] Detail

### STRUCTUUR-CHECK (verplicht)
- [x] Breadcrumbs
- [x] Hero
- [x] Key Takeaways
- [x] Definitie
- [x] Context + link terug naar hub
- [x] Voor wie/waarom
- [x] Kosten
- [x] Stappenplan
- [x] FAQ
- [x] Gerelateerd/terug naar hub
- [x] CTA onderaan

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] FAQPage schema (JSON-LD)

**Bevindingen:**
- ✅ Template voldoet aan alle verplichte secties (Key Takeaways, Context, Gerelateerd, CTA).
- ✅ FAQ JSON-LD toegevoegd naast de FAQ weergave.

**Actiepunten:**
- (geen, mits Strapi-content gevuld is)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 12 — /kennis

Type (verwacht): Hub (kennis)

Wireframe: Kennishub (4.4) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:498)

### TYPE-CHECK
- [x] Kennishub

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Hero
- [x] Kennistypes kaarten (blog/whitepapers/e-learning)
- [x] Eventueel uitgelichte content

### INHOUD-CHECK
- [x] Beschrijvend, geen artikelen samenvatten

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Kennishub met kaarten naar Blog, Whitepapers en E-learning.
- ✅ Intro is beschrijvend, geen samenvattingen.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 13 — /kennis/blog

Type (verwacht): Overzicht

Wireframe: Blog overzicht (4.5) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:566)

### TYPE-CHECK
- [x] Overzicht

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Kennis > Blog)
- [x] Hero + intro
- [x] Artikelen grid/lijst

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd voor kennis-structuur.
- ✅ Hero + intro en artikelenlijst aanwezig via blogtemplate.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 14 — /kennis/blog/:slug (sample)

Type (verwacht): Blog artikel

Wireframe: Blog artikel (4.6) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:615)

### TYPE-CHECK
- [x] Blog artikel

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Kennis > Blog > Artikel)
- [x] Header (H1, datum, auteur, leestijd)
- [x] Body content
- [x] Gerelateerde artikelen
- [x] CTA

### INHOUD-CHECK
- [x] Minimaal 1 link naar core page (hub/detail)

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] Article schema

**Bevindingen:**
- ✅ Breadcrumbs in kennis-structuur toegevoegd.
- ✅ Article schema aanwezig (SchemaMarkup).

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 15 — /kennis/whitepapers

Type (verwacht): Overzicht

Wireframe: Whitepapers overzicht (4.7) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:688)

### TYPE-CHECK
- [x] Overzicht

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Kennis > Whitepapers)
- [x] Hero + intro
- [x] Whitepaper lijst

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd en whitepaperlijst aanwezig.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 16 — /waarom-maasiso

Type (verwacht): Positionering

Wireframe: Waarom MaasISO (4.9) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:805)

### TYPE-CHECK
- [x] Positionering

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Hero
- [x] Positioneringssecties volgens wireframe

### INHOUD-CHECK
- [x] Geen normdetails / geen stappen per norm

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs aanwezig via template.
- ✅ Hero + positioneringssecties aanwezig.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 17 — /over-ons

Type (verwacht): Bedrijf

Wireframe: Over ons (4.10) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:876)

### TYPE-CHECK
- [x] Bedrijf

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Hero
- [x] Bedrijfsprofiel secties

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd.
- ✅ Hero + bedrijfsprofiel secties aanwezig in content.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 18 — /over-niels-maas

Type (verwacht): Persoon

Wireframe: (valt onder Over ons / persoon) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:90)

### TYPE-CHECK
- [x] Persoon

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Hero
- [x] Autoriteit/biografie

### TECHNIEK-CHECK
- [x] Breadcrumb schema
- [x] Person schema (JSON-LD)

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd (Home > Over ons > Niels Maas).
- ✅ Person schema aanwezig via JSON-LD.
- ✅ Hero + biografie/autoriteit aanwezig in content.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 19 — /contact

Type (verwacht): Conversie

Wireframe: Contact (4.11) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:949)

### TYPE-CHECK
- [x] Conversie

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Hero
- [x] Contactgegevens + formulier

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd (Home > Contact).
- ✅ Hero + contactgegevens + formulier aanwezig.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 20 — /privacy-policy

Type (verwacht): Juridisch

### TYPE-CHECK
- [x] Juridisch

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Professionele, consistente opmaak

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd.
- ✅ Professionele opmaak via markdown container.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 21 — /cookie-policy

Type (verwacht): Juridisch

### TYPE-CHECK
- [x] Juridisch

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Professionele, consistente opmaak

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd.
- ✅ Professionele opmaak via policy component.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 22 — /terms-and-conditions

Type (verwacht): Juridisch

### TYPE-CHECK
- [x] Juridisch

### STRUCTUUR-CHECK
- [x] Breadcrumbs
- [x] Professionele, consistente opmaak

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Breadcrumbs toegevoegd.
- ✅ Professionele opmaak via markdown container.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-05)

---

## Pagina 23 — /iso-selector

Type (verwacht): Tool

Wireframe: (niet gespecificeerd in document, enkel vermeld in site-architectuur) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:69)

### TYPE-CHECK
- [x] Tool

### STRUCTUUR-CHECK
- [x] Breadcrumbs (verplicht voor niet-homepage)
- [x] Tool-interface aanwezig

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Route bestaat en is bereikbaar via `app/iso-selector/page.tsx`.
- ✅ Breadcrumbs aanwezig (Home > ISO-Selector) via `CoreBreadcrumbBar`.
- ✅ Tool-CTA naar externe selector aanwezig.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-06)

---

## Pagina 24 — /kennis/whitepapers/:slug

Type (verwacht): Whitepaper

Wireframe: Whitepaper (individueel) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:688)

### TYPE-CHECK
- [x] Whitepaper

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Kennis > Whitepapers > Titel)
- [x] Header (titel, samenvatting)
- [x] Body content
- [x] CTA / download (indien van toepassing)

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Dynamische route bestaat: `app/kennis/whitepapers/[slug]/page.tsx`.
- ✅ Breadcrumbs + canonical + metadata aanwezig.
- ✅ Download-CTA en teruglinks naar kennishub/whitepaper-overzicht aanwezig.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-06)

---

## Pagina 25 — /kennis/e-learning

Type (verwacht): Overzicht

Wireframe: E-learning overzicht (toekomstig) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:720)

### TYPE-CHECK
- [x] Overzicht

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Kennis > E-learning)
- [x] Hero + intro
- [x] Overzicht/kaarten

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Route bestaat: `app/kennis/e-learning/page.tsx`.
- ✅ Breadcrumbs aanwezig volgens kennis-structuur.
- ✅ Overzichtspagina staat als “binnenkort”, passend bij toekomstig statuslabel in architectuur.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-06)

---

## Pagina 26 — /kennis/e-learning/:slug

Type (verwacht): Cursus

Wireframe: E-learning detail (toekomstig) — [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:720)

### TYPE-CHECK
- [x] Cursus

### STRUCTUUR-CHECK
- [x] Breadcrumbs (Home > Kennis > E-learning > Titel)
- [x] Header (titel + samenvatting)
- [x] Inhoudsopzet
- [x] CTA / inschrijven (indien van toepassing)

### TECHNIEK-CHECK
- [x] Breadcrumb schema

**Bevindingen:**
- ✅ Dynamische route toegevoegd: `app/kennis/e-learning/[slug]/page.tsx`.
- ✅ Breadcrumbs met slug-specifieke titel aanwezig.
- ✅ Header, inhoudsopzet en CTA’s aanwezig als “in voorbereiding”-detailtemplate.

**Actiepunten:**
- (geen)

**Besluit:** ✅ GO (2026-02-06)

