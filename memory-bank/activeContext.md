# Active Context - Redesign Cycle (Onze Voordelen & Over Ons)

## Recently Completed: JSON-LD Structured Data Improvements (2026-01-25)
- **Organization Identity**: Fixed site-wide `Organization` schema in `app/layout.tsx` with stable `@id` (`https://maasiso.nl/#organization`) and non-WWW URLs.
- **Blog SEO**: Implemented `BlogPosting` and `BreadcrumbList` schemas in `app/blog/[slug]/page.tsx`.
- **Schema Reusability**: Extended `SchemaMarkup` component to support `Article` and `BreadcrumbList` types.

## Recently Completed: SEO & Redirect Consolidation (2026-01-25)
- **Domain Consolidation**: Fixed content duplication and signal splitting by forcing all traffic to `https://maasiso.nl/`.
- **Implementation**: Added host-based redirects in [`next.config.js`](next.config.js) and fixed build-time prerendering issues.
- **Search Page Sync**: Synchronized root `app/search/page.tsx` with modern server-side implementation and fixed TypeScript prop mismatches.

## Recently Completed: Over Ons Page Spectacular Redesign (2026-01-23)
- **Spectacular Visuals**: Completely transformed the "Over Ons" page with premium styling.
- **Advanced UI Features**:
  - Parallax Hero section with animated blur effects.
  - Interactive "Expertise" grid with expandable cards and color gradients.
  - Direction-aware ScrollReveal animations for all content.
  - Modern Story section with stylized mission statement.
  - Floating values section with hover-transformed circular icons.
  - Full-width premium CTA with dual buttons and animated pulses.
- **Technical Implementation**: Created [`src/components/features/OverOnsContent.tsx`](src/components/features/OverOnsContent.tsx:1) using Framer-motion style interactions (via React hooks and CSS).

## Recently Completed: Onze Voordelen Page Redesign (2026-01-23)
- **Visual Overhaul**: Completely redesigned the "Onze Voordelen" page to match the modern styling of the Diensten page.
- **New Component**: Created `src/components/features/OnzeVoordelenContent.tsx` with:
  - Modern hero section with decorative background elements
  - Introduction section with centered typography and accent dividers
  - 5 advantage cards in a responsive grid layout (3+2 pattern)
  - Each card features: custom SVG icon, title, description, benefits list, and CTA link
  - Quote section with gradient left border
  - Stats section with 3 key metrics (100% success, 15+ years, MKB focus)
  - Premium CTA section with dual buttons
- **Styling Patterns**: Applied same corporate color scheme (#091E42, #00875A, #FF8B00) and card styles as DienstenContent
- **Animations**: Integrated ScrollReveal for smooth entrance animations
- **Simplified Page**: Reduced `app/onze-voordelen/page.tsx` to just import the new component

## Previously Completed: Custom SVG Icons for Expertise (2026-01-23)
- **Visual Identity**: Replaced generic emojis with handcrafted, professional SVG icons for all 5 expertise areas.
- **Icon Strategy**:
  - ISO 9001: Shield with checkmark (Quality assurance)
  - ISO 27001: Digital lock (Information security)
  - AVG: Secure document/Identity shield (Privacy protection)
  - ISO 14001: Global ecosystem (Environmental management)
  - ISO 16175: Organized digital infrastructure (Information management)
- **Styling**: Integrated icons into the existing corporate card system with dynamic color states and hover animations.

## Recently Completed: Corporate Expertise Grid Refinement (2026-01-23)
- **Strakker Design**: Refined the "Expertisegebieden" section to be more professional and aligned with the MaasISO corporate identity.
- **Huisstijl Colors**: Replaced the playful gradients with a clean, high-contrast palette using MaasISO corporate colors (#091E42, #00875A, #FF8B00).
- **Premium Cards**: Implemented cards with thick left-border accents, subtle shadows, and a soft background color (#F4F7F9) for the section.
- **Typography**: Upgraded typography to be bolder and more spacious, improving readability and perceived quality.
- **Interaction**: Maintained smooth hover states including a subtle vertical lift, icon colorization, and animated CTA underlines.

## Recently Completed: Playful Bento Grid for Expertise (2026-01-23)
- **Bento Grid Layout**: Transformed the "Expertisegebieden" section into a playful, colorful bento-style grid with varying card sizes.
- **Color Variety**: Each expertise card now has its own gradient color scheme (emerald, blue, amber, purple, rose, cyan).
- **Dynamic Sizing**: First and fourth cards span 2 columns on desktop for visual interest.
- **Animated Interactions**: Added hover effects with scaling icons, decorative circles that grow, and smooth transitions.
- **Clickable Cards**: Entire cards are now clickable links for better UX.

## Recently Completed: Dynamic Diensten Page Refresh (2026-01-23)
- **Visual Variety**: Broke the repetitive pattern by implementing alternating layouts (left/right) for all expertise sections.
- **Methodology Visualization**: Introduced `ProcessTimeline` for "Onze Manier van Werken", making the consultancy process interactive and easy to follow.
- **Bento Grid Lists**: Transformed plain text lists into modern, icon-based Bento Grids for better scannability.
- **Premium Hero**: Enhanced the hero section with interactive value badges and bolder typography.
- **Dynamic Animations**: Integrated `ScrollReveal` with direction-aware slide-ins and staggered delays for a premium experience.
- **Refined Expertise Grid**: Added "Featured" highlighting and improved card depths and hover effects.
- **High-Impact CTA**: Rebuilt the footer CTA as a premium gradient card with 3D-like shadows.

## Recently Completed: Relevance-Based Search Implementation
- **Functionality**: Intelligent search with relevance ranking and field scope filtering.
- **Features**:
  - Relevance scoring: matches in title (weight=10) > summary (weight=5) > content (weight=1).
  - Field scope filters: "Alles", "Alleen titel", "Titel + samenvatting", "Alleen tekst".
  - Automatic sorting on relevance score (with date as tie-breaker).
- **Implementation Details**:
  - Backend: `/api/search` endpoint.
  - Scoring logic: `src/lib/utils/searchScoring.ts`.
  - API client: `searchV2()` in `src/lib/api.ts`.
  - UI: Scope filters in `src/components/features/SearchFilters.tsx`.

## Key Decisions
- Results remain sectioned (Blog vs News) for the existing UI structure.
- Scope parameter: `scope=all|title|title-summary|content` with default `all`.
- Use specialized components (`ProcessTimeline`, `BenefitCallout`) dynamically based on block content.

## Artefacts
- Search Architecture: [`/plans/relevance-search-architecture.md`](plans/relevance-search-architecture.md)
- Search Guide: [`/src/lib/utils/README-search.md`](src/lib/utils/README-search.md)

## Testing Status
- Unit tests: `npm test -- searchScoring.test.ts` passed (4/4).
- API smoke tests: All search scenarios returned 200.
- Layout: Verified alternating layouts and dynamic rendering of timeline/grid.

## Recently Completed: SEO & Redirect Integrity (2026-01-25)
- **WWW to non-WWW Redirect**: Implemented a forced permanent redirect from `www.maasiso.nl` to `maasiso.nl` in [`next.config.js`](next.config.js).
- **Domain Consolidation**: Resolved content duplication issues by ensuring only the non-WWW version serves content.

## Next Steps
- Manual browser verification of the new diensten grid layout on different screen sizes.
- Monitor Vercel deployment for any CSS issues with ScrollReveal.
