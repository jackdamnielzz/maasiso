# Progress - Redesign Cycle (Onze Voordelen & Over Ons)

## Milestones
- [x] Update all environment files
- [x] Next.js 16 Upgrade
- [x] **Vercel deployment successful** ✅
- [x] **Relevance-Based Search Implementation** (2026-01-23) ✅
  - [x] Designed relevance scoring (title > summary > content)
  - [x] Implemented `/api/search` with server-side scoring
  - [x] Added scope filtering (all/title/summary/content)
  - [x] Updated UI with scope filter buttons
- [x] **Diensten Page Layout Refresh** (2026-01-23) ✅
  - [x] Implemented alternating section layouts
  - [x] Added visual methodology timeline (`ProcessTimeline`)
  - [x] Transformed lists into Bento Grid style
  - [x] Added ScrollReveal entrance animations
  - [x] Enhanced expertise grid and premium footer CTA
- [x] **Onze Voordelen Page Redesign** (2026-01-23) ✅
  - [x] Created new `OnzeVoordelenContent.tsx` component
  - [x] Applied same styling patterns as DienstenContent
  - [x] Added 5 advantage cards with custom SVG icons
  - [x] Implemented stats section and quote block
  - [x] Added ScrollReveal animations throughout
- [x] **Over Ons Page Spectacular Redesign** (2026-01-23) ✅
  - [x] Created new `OverOnsContent.tsx` with spectacular visual effects
  - [x] Implemented Parallax Hero and directional ScrollReveal
  - [x] Interactive expertise cards with expandable information
  - [x] Modern story and floating values layout
- [x] **SEO & Redirect Integrity** (2026-01-25)
  - [x] Check WWW vs non-WWW redirects
  - [x] Identify canonical domain version
  - [x] Implement permanent redirect to non-WWW

## Recent Changes
- COMPLETED: Checked WWW vs non-WWW redirects. Found that both secure variants return 200 OK.
- COMPLETED: Implemented WWW to non-WWW redirect in `next.config.js` to ensure canonical domain usage.
- NEW: `src/components/features/OverOnsContent.tsx` - Spectacular redesign of the "Over Ons" page.
- MODIFIED: `app/over-ons/page.tsx` - Updated to use the new OverOnsContent component.
- NEW: `src/components/features/OnzeVoordelenContent.tsx` - Complete redesign of the Onze Voordelen page with modern styling matching DienstenContent.
- MODIFIED: `app/onze-voordelen/page.tsx` - Simplified to use the new OnzeVoordelenContent component.
- DESIGNED: Added 5 custom SVG icons to `src/components/features/DienstenContent.tsx` representing each expertise area (Quality, Security, Privacy, Environment, Info Management).
- REFINED: `src/components/features/DienstenContent.tsx` - Polished the expertise grid to be "strak" and corporate, using the MaasISO huisstijl colors and premium typography.
- REFACTORED: `src/components/features/DienstenContent.tsx` - Changed expertise explorer to a modern responsive grid.
- IMPROVED: Parsing logic for expertise items to handle complex content structures.
- MODIFIED: `app/diensten/page.tsx` - Full dynamic redesign
- MODIFIED: `src/app/globals.css` - Animation styles
- NEW: `src/lib/utils/searchScoring.ts` - Scoring logic
- NEW: `app/api/search/route.ts` - API endpoint
- MODIFIED: `src/components/features/SearchFilters.tsx` - Scope UI

## Impact
- Meest relevante resultaten komen nu eerst bij het zoeken.
- De dienstenpagina voelt veel professioneler en minder repetitief door de dynamische layouts en animaties.
- De werkwijze van MaasISO is nu visueel en makkelijk te begrijpen.
