# Strapi SEO Updates — Exact in te vullen in het CMS

> Gebaseerd op Google Search Console data (90 dagen).
> De zoekwoorden in de titles en descriptions zijn gekozen op basis van
> werkelijke zoekintentie en impressievolume.

---

## Waarom deze wijzigingen?

Je pagina's krijgen **duizenden impressies** in Google maar bijna geen clicks.
De huidige meta titles zijn te generiek ("ISO 9001 Certificering | MaasISO")
en bevatten niet de woorden waar mensen op zoeken (kosten, checklist, voorbeeld).

Een goede title:
- Bevat het **hoofdzoekwoord** vooraan
- Belooft een **concreet antwoord** (kosten, checklist, voorbeeld)
- Is **max 60 tekens** (anders kapt Google het af)

Een goede description:
- Bevat **2-3 zoekwoorden** die Google dikgedrukt toont
- Geeft een **reden om te klikken** (gratis, template, stapsgewijs)
- Is **max 155 tekens**

---

## SERVICE PAGINA'S (in Strapi > Pages)

### ISO 9001 (slug: iso-9001)
**seoMetadata.metaTitle:**
```
ISO 9001 Certificering: Kosten, Eisen & Begeleiding | MaasISO
```

**seoMetadata.metaDescription:**
```
Wat kost ISO 9001 certificering? Transparant kostenoverzicht, duidelijke eisen en stapsgewijze begeleiding voor MKB. Van nulmeting tot certificaat in 3-6 maanden.
```

**Waarom:** Top zoekwoorden zijn "iso 9001 certificering kosten" (170 impr), "iso 9001 kosten" (153 impr), "iso 9001 eisen" (142 impr). De huidige title mist al deze woorden.

---

### ISO 27001 (slug: iso-27001)
**seoMetadata.metaTitle:**
```
ISO 27001 Certificering: Kosten, Stappenplan & Advies | MaasISO
```

**seoMetadata.metaDescription:**
```
Wat kost ISO 27001 certificering? Compleet overzicht van kosten, doorlooptijd en eisen. Pragmatische begeleiding voor MKB van nulmeting tot audit.
```

**Waarom:** "iso 27001 certificering kosten" (476 impr, pos 29), "iso 27001 kosten" (262 impr, pos 25). De kostenvraag domineert. Positie 25-29 is haalbaar om naar pagina 1 te brengen.

---

### ISO 14001 (slug: iso-14001)
**seoMetadata.metaTitle:**
```
ISO 14001 Certificering: Kosten, Checklist & Begeleiding | MaasISO
```

**seoMetadata.metaDescription:**
```
ISO 14001 certificering voor milieumanagement. Wat zijn de kosten, eisen en stappen? Pragmatische begeleiding voor MKB van nulmeting tot certificaat.
```

---

### ISO 45001 (slug: iso-45001)
**seoMetadata.metaTitle:**
```
ISO 45001 Certificering: Kosten, Eisen & Arbo-management | MaasISO
```

**seoMetadata.metaDescription:**
```
ISO 45001 certificering voor gezond en veilig werken. Wat kost het? Welke eisen? Praktische begeleiding bij arbomanagement voor MKB-bedrijven.
```

---

### BIO (slug: bio)
**seoMetadata.metaTitle:**
```
BIO (Baseline Informatiebeveiliging Overheid): Advies & Begeleiding | MaasISO
```

**seoMetadata.metaDescription:**
```
BIO-compliance voor overheidsorganisaties. Van BIR naar BIO: praktische begeleiding bij implementatie, gap-analyse en naleving.
```

---

### AVG (slug: avg)
**seoMetadata.metaTitle:**
```
AVG Compliance: Privacy & GDPR Begeleiding voor MKB | MaasISO
```

**seoMetadata.metaDescription:**
```
AVG/GDPR compliance voor uw organisatie. Van verwerkingsregister tot privacybeleid: praktische begeleiding bij het voldoen aan de AVG.
```

---

## BLOG POSTS (in Strapi > Blog-posts)

### taak-risico-analyse-voorbeeld-excel
**seoTitle:**
```
TRA Voorbeeld Excel: Gratis Taak Risico Analyse Template [2026]
```

**seoDescription:**
```
Download een gratis TRA voorbeeld in Excel. Compleet taak risico analyse formulier met invulinstructies. Direct te gebruiken voor uw RI&E en veiligheidsanalyse.
```

**seoKeywords:** `taak risico analyse voorbeeld excel, tra voorbeeld, tra formulier excel, risico analyse voorbeeld excel, taak risico analyse excel`

**Waarom:** Dit is je best presterende pagina (26 clicks). "TRA" is de meest gebruikte afkorting (88 impr voor "tra voorbeeld"). "Excel" in de title heeft de hoogste CTR (10-25%). De huidige title mist waarschijnlijk "TRA" en "gratis".

---

### interne-audit-iso-9001-voorbeeld
**seoTitle:**
```
Interne Audit ISO 9001: Voorbeeld Checklist & Auditvragen [Gratis]
```

**seoDescription:**
```
Gratis voorbeeld voor uw interne audit ISO 9001. Inclusief checklist, auditvragen en stappenplan. Direct toepasbaar voor uw kwaliteitsmanagementsysteem.
```

**seoKeywords:** `interne audit iso 9001 voorbeeld, interne audit checklist, iso 9001 audit vragen, audit checklist iso 9001, interne audit vragenlijst`

**Waarom:** 1.680 impressies maar slechts 3 clicks. Je staat op positie 2.3 voor "interne audit iso 9001 voorbeeld" (44 impr) maar 0 clicks — de huidige title/description overtuigt niet. "Checklist" (63 impr) en "auditvragen" (63 impr) zijn de sleutelwoorden die ontbreken.

---

### directiebeoordeling-iso-9001-voorbeeld
**seoTitle:**
```
Directiebeoordeling ISO 9001: Voorbeeld Template & Uitleg
```

**seoDescription:**
```
Compleet voorbeeld van een directiebeoordeling ISO 9001. Inclusief template, agendapunten en uitleg. Direct bruikbaar voor uw managementreview.
```

**seoKeywords:** `directiebeoordeling iso 9001 voorbeeld, directiebeoordeling voorbeeld, iso 9001 directiebeoordeling, directiebeoordeling`

**Waarom:** Je staat op positie 3-5 voor "directiebeoordeling iso 9001" (341 gecombineerde impressies) maar de CTR is 0% voor generieke varianten. Maak duidelijk dat er een template/voorbeeld beschikbaar is.

---

### leveranciersbeoordeling-iso-9001
**seoTitle:**
```
Leveranciersbeoordeling ISO 9001: Voorbeeld & Checklist
```

**seoDescription:**
```
Voorbeeld leveranciersbeoordeling voor ISO 9001. Inclusief beoordelingscriteria, scoremodel en template. Voldoe aan de eisen van clausule 8.4.
```

**seoKeywords:** `leveranciersbeoordeling iso 9001, iso 9001 leveranciersbeoordeling, leveranciersbeoordeling voorbeeld`

**Waarom:** 458 impressies, 9 clicks. Je staat op positie 1.3-1.4 voor de kernzoekwoorden. Met een betere description kan de CTR van 2% naar 10%+.

---

### beleidsverklaring-iso-9001
**seoTitle:**
```
Beleidsverklaring ISO 9001: Voorbeeld & Schrijfhulp
```

**seoDescription:**
```
Hoe schrijf je een beleidsverklaring voor ISO 9001? Voorbeeld, template en tips. Voldoe aan de eisen van clausule 5.2 met een krachtig kwaliteitsbeleid.
```

**seoKeywords:** `beleidsverklaring iso 9001, iso 9001 beleidsverklaring, beleidsverklaring, beleidsverklaring voorbeeld`

**Waarom:** "beleidsverklaring" staat op positie 2.0 met 53 impressies maar 0 clicks. "iso 9001 beleidsverklaring" positie 2.4, 41 impressies, 0 clicks. De title moet duidelijker beloven wat de bezoeker krijgt.

---

### context-van-de-organisatie-iso-9001
**seoTitle:**
```
Context van de Organisatie ISO 9001: Uitleg & Voorbeeld
```

**seoDescription:**
```
Wat is de context van de organisatie volgens ISO 9001? Uitleg van clausule 4, stakeholderanalyse en SWOT-voorbeeld. Stapsgewijze aanpak voor uw organisatie.
```

**seoKeywords:** `contextanalyse iso 9001, context van de organisatie iso 9001, iso 9001 context, stakeholderanalyse iso 9001`

**Waarom:** "contextanalyse iso 9001" heeft 47 impressies op positie 14.7. Met goede meta tags en content-verrijking is top 5 haalbaar.

---

### avg-beeldmateriaal-toestemming
**seoTitle:**
```
AVG & Beeldmateriaal: Wanneer Heb Je Toestemming Nodig?
```

**seoDescription:**
```
Wanneer mag je foto's en video's gebruiken volgens de AVG? Uitleg over toestemming, grondslagen en praktische richtlijnen voor beeldmateriaal op de werkvloer.
```

**seoKeywords:** `avg beeldmateriaal toestemming, avg foto's werknemers, beeldmateriaal avg, toestemming foto's avg`

---

### iso-27001-checklist-augustus-2025
**seoTitle:**
```
ISO 27001 Checklist: Compleet Overzicht Annex A Controls [2026]
```

**seoDescription:**
```
Uitgebreide ISO 27001 checklist met alle Annex A maatregelen. Controleer uw informatiebeveiliging en bereid uw organisatie voor op certificering.
```

**seoKeywords:** `iso 27001 checklist, annex a iso 27001, iso 27001 controls, iso 27001 maatregelen checklist`

**Waarom:** 863 impressies op de /kennis/blog/ variant, 835 op de maasiso.nl variant. Enorm potentieel maar positie 50+ en CTR <0.5%. "iso 27001 checklist" heeft 388 impressies.

---

### wat-is-een-isms
**seoTitle:**
```
Wat is een ISMS? Betekenis, Opzet & Implementatie Uitgelegd
```

**seoDescription:**
```
Wat is een ISMS (Information Security Management System)? Duidelijke uitleg over de betekenis, opzet en implementatie. Inclusief relatie met ISO 27001.
```

**seoKeywords:** `isms betekenis, wat is een isms, isms, information security management system`

**Waarom:** "isms betekenis" heeft 86 impressies op positie 19.3. Met een betere title die "betekenis" bevat, kan deze pagina naar pagina 1 stijgen.

---

## STAPPEN OM DIT IN TE VOEREN

1. Log in op je Strapi admin panel
2. Ga naar **Content Manager > Pages**
3. Open elke page (iso-9001, iso-27001, etc.)
4. Scroll naar het **SEO** of **seoMetadata** gedeelte
5. Vul **metaTitle** en **metaDescription** in zoals hierboven
6. Klik **Save** en **Publish**
7. Ga naar **Content Manager > Blog-posts**
8. Open elke blogpost en vul **seoTitle**, **seoDescription** en **seoKeywords** in
9. Save en Publish

Na het opslaan worden de wijzigingen binnen 24 uur (pages) of 30 minuten (blogs) zichtbaar door ISR.

---

## VERWACHT RESULTAAT

| Pagina | Huidige CTR | Verwachte CTR | Extra clicks/maand |
|--------|------------|--------------|-------------------|
| /iso-certificering/iso-9001/ | 0.0% | 2-4% | 30-65 |
| /informatiebeveiliging/iso-27001/ | 0.3% | 2-4% | 30-60 |
| /kennis/blog/interne-audit-iso-9001-voorbeeld/ | 0.2% | 3-5% | 50-85 |
| /kennis/blog/taak-risico-analyse-voorbeeld-excel/ | 1.5% | 4-8% | 45-115 |
| /kennis/blog/directiebeoordeling-iso-9001-voorbeeld/ | 1.8% | 5-10% | 20-55 |
| /kennis/blog/leveranciersbeoordeling-iso-9001/ | 2.0% | 8-12% | 25-45 |

**Totaal geschat extra organisch verkeer: 200-425 clicks per maand**

Dit is meer dan 10x wat Google Ads opleverde (23 sessies/maand) — en het is gratis.
