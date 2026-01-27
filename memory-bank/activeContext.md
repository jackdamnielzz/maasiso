# Active Context - SEO/GEO Enhancement Project

## Current Status (2026-01-27)

### AuthorBox Component - Redesigned as Business Card ✅

**Updated (2026-01-27 15:36):**

The AuthorBox component has been completely redesigned to display author information as a professional "business card" (visitekaartje) on blog posts:

**Design Features:**
- **Section Header**: "Geschreven door" label with subtle styling
- **Card Design**: Gradient background (slate-50 → white → blue-50) with rounded corners and shadow
- **Profile Image**: Rounded square (2xl radius) with ring effect and hover zoom
- **Author Info**: Name (linked to profile), credentials, bio (line-clamped to 3 lines)
- **Expertise Tags**: Blue badges showing up to 5 skills with "+X meer" indicator
- **Action Buttons**: LinkedIn (branded blue), Email (gray), "Bekijk profiel" link
- **Author Link**: Niels Maas now links to `/over-niels-maas` instead of `/auteurs/niels-maas`

**Technical Updates:**
- [`src/components/features/AuthorBox.tsx`](src/components/features/AuthorBox.tsx:1) - Complete redesign with business card styling
- [`src/lib/api.ts`](src/lib/api.ts:181) - Updated `mapAuthor()` to support both Strapi v4 (nested) and v5 (flat) structures

**Data Flow:**
1. Blog post fetched via `getBlogPostBySlug()` with `populate[4]=author&populate[5]=author.profileImage`
2. Author data mapped by `mapAuthor()` function (supports string, v4 nested, v5 flat)
3. AuthorBox component renders the business card with all available fields

---

### relatedPosts Feature - FULLY WORKING ✅

**Final Status (2026-01-27 02:31):**

The relatedPosts feature is now fully functional:
1. ✅ **Database linking** works via direct PostgreSQL script
2. ✅ **API returns relatedPosts** with explicit populate parameters
3. ✅ **Bottom section** shows related posts (RelatedPosts component)
4. ✅ **Sidebar** shows actual relatedPosts instead of random posts

**Frontend Fixes Applied:**
- [`src/lib/api.ts`](src/lib/api.ts:953) - Added explicit populate for relatedPosts in `getBlogPostBySlug`
- [`src/lib/types.ts`](src/lib/types.ts:157) - Added `RelatedPost` type
- [`src/components/features/RelatedPosts.tsx`](src/components/features/RelatedPosts.tsx:1) - Uses RelatedPost type
- [`src/components/features/BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:34) - Sidebar now uses `post.relatedPosts` directly

**Strapi v5 Admin UI Bug (Still Present):**

The Strapi v5 Admin UI has a **confirmed bug** with self-referencing manyToMany relations. The Admin UI cannot save these relations due to i18n/document validation issues.

**Workaround: Direct Database Script**

Created [`scripts/direct-link-related-posts.js`](scripts/direct-link-related-posts.js:1) that bypasses the Admin UI entirely and writes directly to the PostgreSQL join table.

**Usage:**
```bash
# List all blog posts with IDs
node scripts/direct-link-related-posts.js --list

# Verify a post's current relations
node scripts/direct-link-related-posts.js --verify <slug>

# Link posts (source → targets)
node scripts/direct-link-related-posts.js <source-slug> <target-slug1> [target-slug2...]
```

**User-Friendly Tool:**
- Desktop shortcut: "Link Blog Posts" on user's desktop
- Batch file: [`scripts/run-link-posts.bat`](scripts/run-link-posts.bat:1)
- Interactive script: [`scripts/link-gerelateerde-posts.js`](scripts/link-gerelateerde-posts.js:1)
- Documentation: [`scripts/README-gerelateerde-posts.md`](scripts/README-gerelateerde-posts.md:1)

**Latest Update (2026-01-27):**
- Added **menu option 7** to inspect a blog post by selection list (numbered list) in [`scripts/link-gerelateerde-posts.js`](scripts/link-gerelateerde-posts.js:1).
- The report shows title, slug, documentId, publish status, **relatedPosts (outgoing)** and **relatedFrom (incoming)**.

**Schema (bidirectional relation in [`schema.json`](../maasiso-strapi-railway/src/api/blog-post/content-types/blog-post/schema.json:100)):**
```json
"relatedPosts": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::blog-post.blog-post",
  "inversedBy": "relatedFrom",
  "description": "Manual internal linking for topical authority - outgoing links"
},
"relatedFrom": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::blog-post.blog-post",
  "mappedBy": "relatedPosts",
  "description": "Incoming links from other posts - auto-populated inverse"
}
```

---

### Confirmed Strapi v5 Bug (Research Summary)

**Root Cause:** Strapi v5 Admin UI sends `isTemporary: true` and `locale: null` when saving self-referencing relations, causing validation to fail.

**Known Issues:**
- GitHub Issue #22050: Self-referencing manyToMany relations broken in v5
- GitHub Issue #22051: Admin UI sends incorrect payload for self-relations
- Strapi Forum: Multiple reports of "Document with id ... locale null not found"

**Symptoms:**
1. **Admin UI Error**: `ValidationError: Document with id "...", locale "null" not found`
2. **REST API Silent Failure**: API returns 200 OK but relation is NOT persisted

**Workarounds Available:**
1. ✅ **Direct Database Script** (implemented) - Bypasses Admin UI entirely
2. ⚠️ Custom controller/service - More complex, requires Strapi code changes
3. ⚠️ Wait for Strapi fix - No ETA from Strapi team

**Diagnostic Tools Created:**
- [`scripts/link-related-posts.js`](scripts/link-related-posts.js:1) - Tests multiple API formats
- [`scripts/direct-link-related-posts.js`](scripts/direct-link-related-posts.js:1) - **Working solution**

---

### Previous: TL;DR Position & Markdown Rendering FIXED ✅

**Fixed (2026-01-26 23:28):**
- Moved TL;DR block from above the page to inside [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:71), positioned directly after "Terug naar Blog" link
- Added `parseMarkdownBold()` function to [`TldrBlock.tsx`](src/components/features/TldrBlock.tsx:15) to render `**bold**` as `<strong>bold</strong>`
- Added `parseMarkdownBold()` and `markdownBoldToHtml()` functions to [`FaqSection.tsx`](src/components/features/FaqSection.tsx:15) for both question and answer fields
- Updated [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:31) to accept `tldrItems` prop and render TldrBlock component
- Removed duplicate TldrBlock rendering from [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx:285)

**Update (2026-01-26):**
- Moved TL;DR block to render between the featured image and the intro content in [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:103).

**Commit:** `3d5dba8`

**Build Status:** ✅ PASSING (`npm run build` completed successfully)

### TypeScript Build Errors FIXED ✅

**Fixed (2026-01-26 22:28):**
- Added missing `Author`, `TldrItem`, `FaqItem` types to [`src/lib/types.ts`](src/lib/types.ts:122)
- Extended `BlogPost` interface with new fields: `ogImage`, `excerpt`, `featuredImageAltText`, `robotsIndex`, `robotsFollow`, `tldr`, `faq`, `relatedPosts`, `primaryKeyword`, `schemaType`, `searchIntent`, `ctaVariant`, `videoUrl`, `videoTitle`, `videoDuration`
- Updated `BlogPost.author` to support both `Author | string` for backward compatibility
- Fixed [`RelatedPosts.tsx`](src/components/features/RelatedPosts.tsx:9) to accept `posts` prop alongside `currentSlug`
- Fixed [`AuthorBox.tsx`](src/components/features/AuthorBox.tsx:58) type narrowing for `profileImage`
- Fixed [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:89) to extract author name from object or string
- Fixed [`BlogPostPerformance.tsx`](src/components/features/BlogPostPerformance.tsx:43) author type handling
- Changed `TldrItem.text` to `TldrItem.point` to match component usage

**Build Status:** ✅ PASSING

### SEO/GEO Enhancement - Phase 2 COMPLETE ✅

**Completed:**
- Author content type created and deployed to production
- Author "Niels Maas" created with full bio, credentials, expertise
- All 36 blog posts linked to author
- TL;DR and FAQ components added to blog-post schema
- Railway connected to GitHub for automatic deployments

**API Endpoints Working:**
- `/api/authors` - Returns author data (Niels Maas with full profile)
- `/api/blog-posts?populate=author,tldr,faq` - Returns posts with all relations

**Production Verification (2026-01-26):**
- ✅ Authors endpoint: Returns Niels Maas with bio, credentials, 12 expertise areas
- ✅ Blog posts: All 36 posts linked to author (documentId: `l0hgoajocoeqk2zlfb2s1gmr`)
- ✅ TL;DR component: Returns array of points (visible in blog posts)
- ✅ FAQ component: Schema ready (empty arrays until content added)

**Next Steps:**
- Add meaningful TL;DR content to blog posts (currently placeholder text)
- Add FAQ content to blog posts
- Test frontend AuthorBox, TldrBlock, FaqSection components with production data
- Add profileImage to author via Strapi Admin UI

---

## Previous: Strapi Database Migration & Author Setup (2026-01-26)
- **Goal**: Apply missing Strapi schema changes directly to Railway PostgreSQL.
- **Status**: ✅ COMPLETED - Database migration executed successfully.
- **Accomplishments**:
  - Created and executed [`scripts/strapi-db-migration.sql`](scripts/strapi-db-migration.sql:1) with all required tables
  - Created [`scripts/run-strapi-migration.js`](scripts/run-strapi-migration.js:1) to execute the migration
  - Successfully migrated Railway PostgreSQL database
  - New tables: `authors`, `components_blog_tldr_items`, `components_blog_faq_items`, link tables
  - New columns added to `blog_posts` table
  - `/api/authors` endpoint now returns 200 (was 404 before)
  - Created [`scripts/migrate-authors.js`](scripts/migrate-authors.js:1) to update blog posts
  - Updated all 36 blog posts with Author="Niels Maas"

## Recently Completed: Canonical Tags Implementation (2026-01-25)
- **Metadata Base**: Set `metadataBase` to `https://maasiso.nl` in `app/layout.tsx`.
- **Default Canonical**: Added `alternates: { canonical: '/' }` to `app/layout.tsx` to ensure every page has a canonical tag by default.
- **Static Pages**: Updated all major static pages with explicit relative canonical paths (e.g., `/over-ons`, `/contact`, `/diensten`, `/blog`, `/news`, etc.).
- **Dynamic Routes**: Implemented canonical tags for `blog/[slug]` and `news/[slug]` routes.
- **Consistency**: Verified `next.config.js` has `trailingSlash: false`, matching the canonical tag strategy.

## Recently Completed: Canonical Tags & Final Sync (2026-01-25)
- **Git Push**: Successfully pushed all canonical tag implementations and documentation updates to the remote repository.
- **Changes Included**: Server-rendered canonical tags for all static and dynamic pages, `metadataBase` setup.
- **Commit Message**: `feat: add server-rendered canonical tags across all pages`

## Recently Completed: Author Page Creation (2026-01-25)
- **New Page**: Created `/over-niels-maas` author page with professional biography and publication links.
- **Content**: Dutch language, highlighting expertise in ISO 9001, 27001, AVG, and BIO.
- **SEO**: Implemented `Person` JSON-LD schema with stable `@id` and link to `ProfessionalService` schema.

## Recently Completed: JSON-LD Structured Data Improvements (2026-01-25)
- **ProfessionalService Identity**: Updated site-wide schema in `app/layout.tsx` to `ProfessionalService` with stable `@id` (`https://maasiso.nl/#professionalservice`) and non-WWW URLs.
- **Contact Details**: Updated JSON-LD with real phone number (+31623578344) and email (info@maasiso.nl).
- **Blog SEO**: Implemented `BlogPosting` and `BreadcrumbList` schemas in `app/blog/[slug]/page.tsx`, linked to `ProfessionalService` publisher.
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
- **Schema Unification**: Ensured all structured data uses non-WWW URLs and refers to the `ProfessionalService` entity.

## Recently Completed: Internal Linking & Author Schema Verification (2026-01-25)
- **Over Ons Integration**: Added a dedicated "Over Niels Maas" section to the [`src/components/features/OverOnsContent.tsx`](src/components/features/OverOnsContent.tsx) component, providing a visible Dutch description and a crawlable internal link to `/over-niels-maas`.
- **Author ID Consistency**: Verified and updated [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx) to ensure the `Person` schema uses the stable `@id`: `https://maasiso.nl/over-niels-maas#author`.

## In Progress: ISO 45001 Landing + Diensten Redirects (2026-01-25)
- **Redirects**: Added 301 mapping for 7 legacy `/diensten/...` URLs (incl. `/diensten/iso-45001`) to their new service pages via [`src/middleware.ts`](src/middleware.ts).
- **New Landing**: Added placeholder `/iso-45001` page with Dutch intro + contact CTA and canonical metadata in [`app/iso-45001/page.tsx`](app/iso-45001/page.tsx) + [`app/iso-45001/metadata.ts`](app/iso-45001/metadata.ts).
- **Sitemap**: Included `/iso-45001` in static pages + excluded from dynamic slugs in [`app/sitemap.ts`](app/sitemap.ts).
- **Schema Component Support**: Enhanced [`src/components/ui/SchemaMarkup.tsx`](src/components/ui/SchemaMarkup.tsx) to support the `id` property in the author object, ensuring proper JSON-LD output.

## Recently Completed: Legacy URL Soft-404 Fixes (2026-01-25)
- **Redirects**: Added permanent redirects for `/index.html` → `/` and `/algemene-voorwaarden` → `/terms-and-conditions` via [`src/middleware.ts`](src/middleware.ts).
- **Garbage URL Handling**: Return a real `404` for `/$` (no redirect) to eliminate Soft 404 noise.

## Recently Completed: Final Domain Unification Check (2026-01-25)
- **Codebase Verification**: Performed a recursive search for `www.maasiso.nl` across `app/` and `src/` directories.
- **Results**: Confirmed 0 occurrences in source code. All metadata, JSON-LD schemas, sitemaps, and robots.txt files are verified to use the unified `https://maasiso.nl` domain.
- **Entity Integrity**: Verified that `ProfessionalService` and `Person` schemas use stable, non-WWW `@id`s consistently.

## Recently Completed: Automated Verification (2026-01-25)
- **Tooling**: Created and executed [`scripts/verify-entities.js`](scripts/verify-entities.js) to automate the verification of the redesign's technical SEO requirements.
- **Verification Status**: PASSED. Confirmed page existence, schema IDs, author links, and domain unification across the codebase.

## Recently Completed: Project Metadata Analysis (2026-01-25)
- **Active Directory**: Confirmed root `app/` is the active directory for the Next.js App Router (overriding `src/app/`).
- **Metadata Inventory**:
  - `app/layout.tsx`: Missing `metadataBase`.
  - `next.config.js`: `trailingSlash` is `false` (default).
  - `app/blog/[slug]/page.tsx`: Lacks canonical tag in `generateMetadata`.
  - Static pages (e.g., `iso-9001`): Lack canonical tags.
- **Goal**: Findings will be used to implement consistent canonical tags across the site to prevent duplicate content issues.

## Next Steps
- Monitor Vercel deployment for any SEO-related crawl issues.

## Recently Completed: Git Deployment & Final SEO Sync (2026-01-25)
- **Git Push**: Successfully pushed the latest changes including sitemap fixes, SEO script updates, and project configuration to GitHub.
- **Sitemap URL Formatting Fix**: Normalized `<loc>` URLs, removed `/home` and ensured full coverage of all content types (blog, news, whitepapers, pages).
- **Cleanup**: Removed `app/test-deploy/page.tsx` as part of the production readiness.

## Recently Completed: Redirect Cleanup (2026-01-25)
- **Legacy HTML Redirect**: Added 301 redirect for `/contact.html` to `/contact` via `src/middleware.ts`.
- **Blog Content Redirect**: Added 301 redirect for `/blog/iso-27001-checklist` to `/blog/iso-27001-checklist-augustus-2025` to resolve "crawled not indexed" issues.

## Recently Completed: Claude Code Installation (2026-01-26)
- **Installation**: Successfully installed Claude Code version 2.1.19.
- **Environment Configuration**: Added `C:\Users\niels\.local\bin` to the User PATH environment variable to allow global access to the `claude` command.
- **Verification**: Confirmed successful installation and PATH configuration by running `claude --version`.
