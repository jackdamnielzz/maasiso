# Page Governance (Core structuur)

Doel: de nieuwe structuur afdwingen in code zodat core pagina’s niet kunnen verwateren.

## Paginarollen

- `hub` (core): topic-overzichten met links naar onderliggende detailpagina’s
- `detail` (core): norm/dienst pagina’s met vaste secties
- `blog` (CMS-first): blog index + blogpost detail
- `conversion`: overige conversion/utility pagina’s (niet onderdeel van core governance in Strapi)

## Templates (in code)

- Hub template: `src/components/templates/core/CoreHubPageTemplate.tsx`
- Detail template: `src/components/templates/core/CoreDetailPageTemplate.tsx`
- Breadcrumbs (schema + UI): `src/components/templates/core/CoreBreadcrumbBar.tsx`
- Core Markdown renderer (headings worden genegeerd): `src/components/templates/core/CoreMarkdown.tsx`

## Route mapping (bron van waarheid)

Core routes en hun rol/template staan in `src/lib/governance/coreRoutes.ts`.

## Core detailpagina’s: CMS alleen als “data”

Core detailpagina’s halen content uit Strapi `pages` (op slug), maar **layout/secties/headings worden niet door Strapi bepaald**.

### Strapi componenten (layout)

Voor core detailpagina’s wordt Strapi `pages.layout` gelezen als **datasource**. De template bepaalt altijd de structuur (secties/headings), niet Strapi.

Toegestane Strapi componenten in `layout`:

- `page-blocks.text-block` (bron voor definitie + uitleg; headings worden gestript)
- `page-blocks.fact-block` (wordt gebruikt in de sectie **Kosten**)
- `page-blocks.feature-grid` (bron voor **Stappenplan**; als ontbreekt toont de template een placeholder)
- `page-blocks.faq-section` (bron voor **FAQ**; als ontbreekt toont de template fallback)
- `page-blocks.key-takeaways` (optioneel; wordt getoond als “highlights” binnen **Uitleg**)
- `page-blocks.hero` en `page-blocks.button` worden genegeerd (hero/CTA liggen vast in code)

Validatie zit in `src/lib/governance/coreContent.ts`.

### Governance strict mode

- Default: `strict` in productie, `warn` in development
- Override: zet `GOVERNANCE_STRICT=0` (warn) of `GOVERNANCE_STRICT=1` (strict)

## Blog governance

- Blog blijft CMS-first.
- Bij het renderen van `/blog/:slug` wordt gelogd als de post geen interne link naar een core page bevat.
  - Check: `src/lib/governance/blogContent.ts`

## Generic CMS pages (uitgeschakeld)

De route `app/[slug]/page.tsx` was een generieke Strapi “page builder”.
Om governance te voorkomen is dit standaard dichtgezet via een allowlist.

- Allowlist staat in `app/[slug]/page.tsx` (`ALLOWED_CMS_PAGE_SLUGS`)
- Core slugs zijn altijd geblokkeerd (`isReservedSingleSlug`)

## Verificatie

Run `npm run verify` om governance checks te draaien (routes + template usage).
