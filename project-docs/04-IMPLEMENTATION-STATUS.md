# Implementation Status - Railway Migration

## Features
- Railway Strapi Backend Integration: 100%
- Environment Variable Update: 100%
- Image URL Strategy Update: 100%
- Next.js 16 Upgrade: 100%
- Vercel Deployment: 100% ✅
- Blog Page Improvements: 100% ✅
- Blog Overview Page Fix: 100% ✅
- Blog Tags-as-Categories + Dynamic Search: 100% ✅
- Search: Relevance + Field Scope Filtering (Design): 100% ✅
- Search: Relevance + Field Scope Filtering (Backend/API): 100% ✅
- Search: Relevance + Field Scope Filtering (UI): 100% ✅
- Search: Relevance + Field Scope Filtering (Testing): 60% 🧪
- Onze Voordelen Page Redesign: 100% ✅
- Over Ons Page Spectacular Redesign: 100% ✅
- WWW to non-WWW Redirect Implementation: 100% ✅
- JSON-LD Structured Data Improvements: 100% ✅
- Author Page (/over-niels-maas): 100% ✅
- Internal Linking & Author ID Verification: 100% ✅
- Final Domain Unification Check (non-WWW): 100% ✅
- Verification Script (scripts/verify-entities.js): 100% ✅
- Repository Sync: 100% ✅
- Canonical Tags Implementation: 100% ✅
- Sitemap & SEO Verification Sync: 100% ✅
- SEO Redirects Cleanup: 100% ✅
- Claude Code Installation: 100% ✅
- SEO/GEO Enhancement - Database Migration: 100% ✅
- SEO/GEO Enhancement - Author Data Migration: 100% ✅
- SEO/GEO Enhancement - Strapi Content-Type Schema: 100% ✅
- SEO/GEO Enhancement - Full Author Relation: 100% ✅
- SEO/GEO Enhancement - Phase 2 Complete: 100% ✅
- relatedPosts Self-Referencing Fix: 100% ✅
- relatedPosts Frontend Display: 100% ✅
- AuthorBox Business Card Redesign: 100% ✅

### Search & Filtering (100%)
- [x] Basic search functionality with Strapi integration
- [x] Content type filtering (blog/news)
- [x] Date range filtering
- [x] **NEW: Relevance-based scoring** (title > summary > content)
- [x] **NEW: Field scope filtering** (search in specific fields)
- [x] Search analytics tracking
- [x] Query validation and sanitization
- [x] Paginated search results

## Recent Updates (2026-01-27)

### Over Niels Maas Page - Strapi Data Expansion (2026-01-27) 🔧
- **Data Source**: Added `getAuthorBySlug('niels-maas')` in [`src/lib/api.ts`](src/lib/api.ts:1038) to fetch full author details from Strapi.
- **Page Update**: [`app/over-niels-maas/page.tsx`](app/over-niels-maas/page.tsx) now renders author name, bio, credentials, expertise, LinkedIn, email, and profile image from Strapi.

### AuthorBox Business Card Redesign (2026-01-27) ✅
- **UI Refresh**: Redesigned [`src/components/features/AuthorBox.tsx`](src/components/features/AuthorBox.tsx) as a compact business card with header, profile image, bio, expertise tags, and action buttons.
- **Data Support**: Updated `mapAuthor()` in [`src/lib/api.ts`](src/lib/api.ts:181) to handle both Strapi v4 nested data and Strapi v5 flat data.
- **Author Link**: Niels Maas now links to `/over-niels-maas` instead of `/auteurs/niels-maas`.

### relatedPosts Frontend Display - FULLY WORKING (2026-01-27) ✅
- **API Fix**: Added explicit populate for relatedPosts in [`src/lib/api.ts`](src/lib/api.ts:953)
- **Type Fix**: Added `RelatedPost` type to [`src/lib/types.ts`](src/lib/types.ts:157)
- **Mapping Fix**: `mapRelatedPosts` now handles both Strapi v4 (nested) and v5 (flat) structures
- **Sidebar Fix**: [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:34) now uses actual `post.relatedPosts` instead of random posts
- **User Tools Created**:
  - Desktop shortcut: "Link Blog Posts"
  - Batch file: [`scripts/run-link-posts.bat`](scripts/run-link-posts.bat:1)
  - Interactive script: [`scripts/link-gerelateerde-posts.js`](scripts/link-gerelateerde-posts.js:1)
  - Documentation: [`scripts/README-gerelateerde-posts.md`](scripts/README-gerelateerde-posts.md:1)
  - **NEW:** Inspect-by-selection option (menu 7) shows relatedPosts + relatedFrom
- **Verified**: relatedPosts display correctly in both bottom section AND sidebar

### relatedPosts Self-Referencing Bug - SOLVED WITH DATABASE WORKAROUND (2026-01-27) ✅
- **Issue**: Strapi v5 `relatedPosts` manyToMany self-referencing relation caused ValidationError: "Document with id ..., locale null not found"
- **Root Cause**: Strapi v5 has a **confirmed bug** with self-referencing manyToMany relations - Admin UI sends `isTemporary: true` and `locale: null` which causes validation to fail
- **Known Issues**:
  - GitHub Issue #22050: Self-referencing manyToMany relations broken in v5
  - GitHub Issue #22051: Admin UI sends incorrect payload for self-relations
  - Strapi Forum: Multiple reports of "Document with id ... locale null not found"

**Attempted Fixes (All Failed in Admin UI):**
1. Removed `mappedBy` attribute - didn't solve persistence issue
2. Bidirectional relation (`relatedPosts` + `relatedFrom`) - Admin UI still fails

**Schema (bidirectional, commit `6c716e9`):**
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

**FINAL SOLUTION: Direct Database Script** ✅
- Created [`scripts/direct-link-related-posts.js`](scripts/direct-link-related-posts.js:1) that bypasses Admin UI entirely
- Writes directly to PostgreSQL join table `blog_posts_related_posts_lnk`
- **Test Success**: Linked "avg-beeldmateriaal-toestemming" (ID: 30) → "checklist-iso-14001" (ID: 41)

**Usage:**
```bash
# List all blog posts with IDs
node scripts/direct-link-related-posts.js --list

# Verify a post's current relations
node scripts/direct-link-related-posts.js --verify <slug>

# Link posts (source → targets)
node scripts/direct-link-related-posts.js <source-slug> <target-slug1> [target-slug2...]
```

**Diagnostic Tools Created:**
- [`scripts/link-related-posts.js`](scripts/link-related-posts.js:1) - Tests multiple API formats (all fail)
- [`scripts/direct-link-related-posts.js`](scripts/direct-link-related-posts.js:1) - **Working solution** via direct database access

## Previous Updates (2026-01-26)

### TL;DR Position + Markdown Bold Rendering (2026-01-26) ✅
- **TL;DR placement**: Moved TL;DR block to render directly under "Terug naar Blog" inside [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:71).
- **Markdown bold rendering**: Added `parseMarkdownBold()` for TL;DR in [`TldrBlock.tsx`](src/components/features/TldrBlock.tsx:15) and bold parsing utilities in [`FaqSection.tsx`](src/components/features/FaqSection.tsx:15) so `**bold**` is rendered correctly.
- **Cleanup**: Removed duplicate TL;DR rendering from [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx:285).
- **Build**: ✅ Successful.
- **Commit**: `3d5dba8`.

### TL;DR Position Adjustment (2026-01-26) ✅
- **TL;DR placement**: Now renders between the featured image and the intro content in [`BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:103).

### SEO/GEO Enhancement - Phase 2 COMPLETE (2026-01-26) ✅
- **Author Content Type**: Created and deployed to production Railway Strapi
- **Author Profile**: "Niels Maas" created with:
  - Full bio describing role and expertise
  - Credentials: Lead Auditor for ISO 9001, 14001, 27001, 45001, 50001, 16175, VCA
  - Expertise array: 12 areas including ISO standards, Kwaliteitsmanagement, Informatiebeveiliging, BIO, AI
- **Blog Posts Linked**: All 36 blog posts connected to author via relation
- **TL;DR Component**: Schema deployed and working (returns array of points)
- **FAQ Component**: Schema deployed and ready (awaiting content)
- **Railway Deployment**: Connected to GitHub for automatic deployments

**Production API Verification:**
- ✅ `/api/authors?populate=*` - Returns Niels Maas with full profile and linked blog posts
- ✅ `/api/blog-posts?populate=author,tldr,faq` - Returns posts with all relations populated

**Scripts Created:**
- [`scripts/setup-production-author.js`](scripts/setup-production-author.js:1) - Creates author and links blog posts
- [`scripts/link-blog-posts-to-author.js`](scripts/link-blog-posts-to-author.js:1) - Links posts to author

### SEO/GEO Enhancement - Database Migration Completed (2026-01-26) ✅
- **SQL Migration**: Created and executed [`scripts/strapi-db-migration.sql`](scripts/strapi-db-migration.sql:1) with all required tables.
- **Runner**: Created [`scripts/run-strapi-migration.js`](scripts/run-strapi-migration.js:1) using `pg` to execute the SQL against Railway Postgres.
- **Migration Executed**: Successfully migrated Railway PostgreSQL database.
- **New Tables Created**:
  - `authors` - Author profiles with bio, credentials, expertise
  - `components_blog_tldr_items` - TL;DR summary items
  - `components_blog_faq_items` - FAQ question/answer pairs
  - Link tables for component relationships
- **New Columns**: Added to `blog_posts` table for SEO/GEO fields.
- **API Status**: `/api/authors` endpoint now returns 200 (was 404 before).

### Author Data Migration (2026-01-26) ✅
- **Script**: Created [`scripts/migrate-authors.js`](scripts/migrate-authors.js:1) to update blog posts.
- **Execution**: Updated all 36 blog posts with Author="Niels Maas".
- **Idempotent**: Script is safe to run multiple times.

### Important Finding: Schema Architecture
- **Current State**: Strapi schema has `Author` as a **string field**, not a relation.
- **Database Ready**: Tables exist for full author relation.
- **Next Step**: Update Strapi content-type schema in `maasiso-strapi-railway` repository.
- **Impact**: Full author features (bio, credentials, expertise) require Strapi schema update and redeploy.

### Strapi Database Migration Scripts (2026-01-26) ✅
- **SQL Migration**: Added [`scripts/strapi-db-migration.sql`](scripts/strapi-db-migration.sql:1) to create missing tables, link tables, and new Blog Post columns.
- **Runner**: Added [`scripts/run-strapi-migration.js`](scripts/run-strapi-migration.js:1) using `pg` to execute the SQL against Railway Postgres.
- **Status**: ✅ Migration executed successfully.

### Claude Code Installation (2026-01-26) ✅
- **Installation**: Successfully installed Claude Code version 2.1.19 to `C:\Users\niels\.local\bin`.
- **PATH Configuration**: Added the installation directory to the User PATH environment variable.
- **Verification**: Verified accessibility via `claude --version`.

## Previous Updates (2026-01-25)

### Sitemap URL Formatting Fix (2026-01-25) ✅
- **Normalization**: Added URL normalization helpers to guarantee clean `<loc>` values (trim base/path/result, single `/` separator).
- **Canonical Cleanup**: Excluded `/home` from sitemap output to avoid non-canonical URLs.
- **Completeness**: Implemented pagination loops for blog posts, news articles, whitepapers, and pages to include all published content.

### Canonical Tags Implementation (2026-01-25) ✅
- **Metadata Base**: Established `https://maasiso.nl` as the `metadataBase` in the root layout.
- **Default Logic**: Configured `alternates: { canonical: '/' }` in `app/layout.tsx` to provide a fallback canonical for all pages.
- **Static Page Coverage**: Manually implemented canonical tags for all major static pages including:
  - Home (`/`)
  - Diensten (`/diensten`)
  - ISO Norms (`/iso-9001`, `/iso-27001`, etc.)
  - Blog & News Overviews (`/blog`, `/news`)
  - Policy Pages (`/privacy-policy`, `/cookie-policy`)
  - Information Pages (`/over-ons`, `/contact`, `/onze-voordelen`, `/over-niels-maas`)
- **Dynamic Route Coverage**: Implemented canonical tags in `generateMetadata` for:
  - `app/blog/[slug]/page.tsx` → `/blog/${slug}`
  - `app/news/[slug]/page.tsx` → `/news/${slug}`
- **Validation**: Confirmed non-WWW and no trailing slash consistency.

### Repository Sync & Final SEO Sync (2026-01-25) ✅
- **Git Push**: Successfully synchronized all canonical tag implementations, final SEO fixes, sitemap formatting improvements, and verification scripts with the remote repository.
- **Scope**: Includes all JSON-LD improvements, author page, domain unification, server-rendered canonical tags, sitemap pagination/normalization, and entity verification scripts.

### Author Page Creation (2026-01-25)
- **New Page**: Created `/over-niels-maas` to serve as the official author profile for Niels Maas.
- **Biography**: Dutch content covering his role as Oprichter & Lead Consultant, and expertise in ISO 9001, 27001, AVG, and BIO.
- **Curated Publications**: Manually linked to top-performing blog posts about ISO handbooks, risk-based thinking, and checklists.
- **Structured Data**: Integrated `Person` JSON-LD schema with stable ID and connection to the main ProfessionalService schema.

### Internal Linking & Author ID Verification (2026-01-25)
- **Over Ons Page**: Added "Over Niels Maas" section to `OverOnsContent.tsx` with description and link to `/over-niels-maas`.
- **Blog Schema**: Verified and fixed author `@id` in `app/blog/[slug]/page.tsx` to match `https://maasiso.nl/over-niels-maas#author`.
- **Schema Component**: Extended `SchemaMarkup.tsx` to support `@id` for Person objects.

### JSON-LD Structured Data Improvements (2026-01-25)
- **ProfessionalService Schema**: Updated site-wide identity in `app/layout.tsx` to use `ProfessionalService` with a stable `@id` (`https://maasiso.nl/#professionalservice`) and unified non-WWW URLs.
- **Contact Details**: Integrated real phone number (+31623578344) and email into global schema.
- **Blog Templates**: Added `BlogPosting` and `BreadcrumbList` schemas to `app/blog/[slug]/page.tsx`, linked to the primary `ProfessionalService` entity.
- **Component Extension**: Enhanced `SchemaMarkup.tsx` to handle Article and Breadcrumb data structures.

### SEO & Redirect Integrity (2026-01-25)
- **WWW to non-WWW Redirect**: Implemented forced permanent redirect from `www.maasiso.nl` to `maasiso.nl` in `next.config.js`. This resolves content duplication and signal splitting issues.

### Legacy URL Soft-404 Fixes (2026-01-25) ✅
- **Permanent Redirects**: Added `/index.html` → `/` and `/algemene-voorwaarden` → `/terms-and-conditions` in [`src/middleware.ts`](src/middleware.ts).
- **Garbage URL Handling**: Configured `/$` to return a real `404` (no redirect) via middleware to stop Soft 404 noise.

### ISO 45001 Landing + Diensten Redirects (2026-01-25)
- **301 Redirects**: Added 7 legacy `/diensten/...` routes mapping 1-op-1 to their new service pages (incl. `/diensten/iso-45001`) in [`src/middleware.ts`](src/middleware.ts).
- **New Landing Page**: Created `/iso-45001` placeholder with Dutch intro + contact CTA and canonical metadata in [`app/iso-45001/page.tsx`](app/iso-45001/page.tsx) and [`app/iso-45001/metadata.ts`](app/iso-45001/metadata.ts).
- **Sitemap**: Added `/iso-45001` to static sitemap entries and excluded it from dynamic slugs in [`app/sitemap.ts`](app/sitemap.ts).

### SEO Redirects Cleanup (2026-01-25) ✅
- **Legacy Cleanup**: Added 301 redirects to eliminate "crawled not indexed" noise for `/contact.html` and old blog slugs in `src/middleware.ts`.

### Final Domain Unification Check (2026-01-25)
- **Codebase Sweep**: Verified that no `www.maasiso.nl` occurrences remain in `app/` and `src/` source files.
- **Metadata Audit**: Re-confirmed that `app/layout.tsx`, `app/over-niels-maas/page.tsx`, and `app/blog/[slug]/page.tsx` use the correct stable `@id`s and non-WWW URLs.
- **Environment Verification**: Confirmed all `.env` files and `sitemap.ts` use the canonical `https://maasiso.nl` domain.

### Verification Script (2026-01-25)
- **Script Creation**: Developed `scripts/verify-entities.js` to automate validation of canonical entities and JSON-LD standards.
- **Automated Checks**:
  - Existence of `/over-niels-maas` page.
  - Presence of `ProfessionalService` and stable `@id` in root layout.
  - Link to author profile in blog posts.
  - Visible link to author page in "Over Ons" component.
  - Recursive codebase sweep for legacy `www.maasiso.nl` domain.
- **Results**: Verified all checks passed (PASS).

### Project Metadata Analysis (2026-01-25)
- **Status**: Completed analysis of current metadata structure.
- **Findings**:
  - Root `app/` is the active directory.
  - Missing `metadataBase` in root layout.
  - Dynamic routes (blog, news) lack canonical metadata.
  - Static service pages lack canonical metadata.
  - `next.config.js` has `trailingSlash: false`.

## Previous Updates (2026-01-23)

### Onze Voordelen Page Redesign
- Created new [`src/components/features/OnzeVoordelenContent.tsx`](src/components/features/OnzeVoordelenContent.tsx:1) component
- Applied same styling patterns as DienstenContent (corporate colors, card styles, ScrollReveal animations)
- Features:
  - Modern hero section with decorative background elements
  - Introduction section with centered typography and accent dividers
  - 5 advantage cards in responsive grid layout (3+2 pattern)
  - Each card: custom SVG icon, title, description, benefits list, CTA link
  - Quote section with gradient left border
  - Stats section (100% success, 15+ years, MKB focus)
  - Premium CTA section with dual buttons
- Simplified [`app/onze-voordelen/page.tsx`](app/onze-voordelen/page.tsx:1) to use the new component

### Custom SVG Icons for Expertise
- Designed and implemented 5 custom SVG icons tailored to each specific ISO norm and expertise area.
- Integrated icons with dynamic corporate coloring and interactive hover animations.

### Corporate Expertise Grid Refinement (Final)
- Refined the "Expertisegebieden" section to be professional and "strak", fully aligned with the MaasISO corporate identity.
- Applied corporate color palette: #091E42 (Dark Blue), #00875A (Green), #FF8B00 (Orange).
- Implemented high-contrast white cards with thick left-border accents and subtle hover elevation.
- Improved spacing and typography (text-xl for descriptions, text-4xl for headings) for a more premium feel.

### Expertise Grid Refinement
- Transformed "Expertisegebieden" from a Master-Detail Explorer into a responsive 3-column grid in [`src/components/features/DienstenContent.tsx`](src/components/features/DienstenContent.tsx:139)
- Improved expertise parsing logic to handle multi-paragraph blocks (like BIO) correctly, ensuring clean titles and icons.
- Added hover effects and consistent card heights for a more premium look.

### Diensten Page Layout Refresh
- Improved hero typography and added value badges in [`app/diensten/page.tsx`](app/diensten/page.tsx:112)
- Upgraded text blocks to rounded cards with optional title display in [`app/diensten/page.tsx`](app/diensten/page.tsx:145)
- Replaced desktop services carousel with a 3-column grid and kept mobile carousel in [`app/diensten/page.tsx`](app/diensten/page.tsx:189)

### Search API v2 (Relevance + Scope)
- Added v2 search types in [`src/lib/types.ts`](src/lib/types.ts:260)
- Added scoring utility [`src/lib/utils/searchScoring.ts`](src/lib/utils/searchScoring.ts:1)
- Added API route handler [`app/api/search/route.ts`](app/api/search/route.ts:1)
- Added client function `searchV2` in [`src/lib/api.ts`](src/lib/api.ts:922)
- Verified `GET /api/search` works locally (HTTP 200)
- Executed API smoke tests for scope filters (`all`, `title`, `title-summary`, `content`), type filter, and multi-word query (HTTP 200).

### Search Testing (In Progress)
- Added unit tests for relevance scoring in [`src/lib/utils/__tests__/searchScoring.test.ts`](src/lib/utils/__tests__/searchScoring.test.ts:1)
- `npm test -- searchScoring.test.ts` ✅ (4/4 passed)
- Note: Jest warns about haste-map naming collision between `.next/standalone/package.json` and `package.json`

### Search UI v2 (Relevance + Scope)
- Added scope filter buttons in [`src/components/features/SearchFilters.tsx`](src/components/features/SearchFilters.tsx:1)
- Updated search page to use `searchV2` with scope validation in [`src/app/search/page.tsx`](src/app/search/page.tsx:1)
- Adjusted results rendering to consume scored results in [`src/components/features/SearchResults.tsx`](src/components/features/SearchResults.tsx:1)
- Added development-only relevance score display in [`src/components/features/SearchResultItem.tsx`](src/components/features/SearchResultItem.tsx:1)
- Preserved scope parameter in search input navigation in [`src/components/common/SearchInput.tsx`](src/components/common/SearchInput.tsx:1)

### Blog Tags-as-Categories + Dynamic Search (Latest)
**Root Cause 1**: Blog posts have `tags` in the API, but the blog overview page extracted/filtered by `categories`, resulting in an empty sidebar.

**Root Cause 2**: Blog overview page was statically cached, so query param changes didn’t trigger a new render; `searchQuery` never affected the server-filtered result.

**Solution (in** [`app/blog/page.tsx`](app/blog/page.tsx:1) **):**
- Force dynamic rendering: `export const dynamic = 'force-dynamic'` and `export const revalidate = 0`
- Treat tags as categories:
  - extract categories from `post.tags`
  - category filter checks `post.tags`
  - search filter also matches tag names
  - tag slug derived via `createSlug(tag.name)` (fallback) for stable URL filtering

### Blog Overview Page Fix (Latest)
**Root Cause**: Next.js prioritizes `/app` directory over `/src/app` directory. The incomplete implementation in `/app/blog/page.tsx` was being used instead of the complete one in `/src/app/blog/page.tsx`.

**Solution**:
- Backed up original `/app/blog/page.tsx` to `/app/blog/page.tsx.backup`
- Copied complete implementation from `/src/app/blog/page.tsx` to `/app/blog/page.tsx`
- Fixed import path for prefetch (changed from relative `../../lib/prefetch` to `@/lib/prefetch`)

**Result**: Blog overview page now includes:
- ✅ BlogSidebar component with category filtering (left sidebar)
- ✅ Search bar with URL parameter support
- ✅ Responsive flexbox layout (sidebar + main content)
- ✅ Category extraction from blog posts
- ✅ Search filtering by title, content, and summary
- ✅ Pagination with prefetching

### Vercel Deployment
- Upgraded Next.js from 15.1.7 to 16.1.4 (CVE-2025-66478 fix)
- Added Turbopack configuration for Next.js 16
- Fixed TypeScript types for Next.js 16 compatibility
- Removed duplicate middleware file
- Fixed Edge Runtime compatibility
- Added `.nvmrc` for Node.js 20 requirement
- Added `.npmrc` with legacy-peer-deps
- Added `vercel.json` for build configuration
- **Vercel deployment successful** (commit `698e08d`)

### Blog Page Improvements
- **Blog Grid Images**: Fixed Cloudinary URL handling in `BlogPostCard.tsx`
- **Categories Sidebar**: Created new `BlogSidebar.tsx` component
- **Search Bar**: Added search functionality to blog page
- **Featured Image**: Fixed Cloudinary URLs in `BlogPostContent.tsx`
- **Related Posts**: Fixed image URLs in `RelatedPosts.tsx`
- **Config Update**: Added Cloudinary to `next.config.js` remotePatterns

### Files Modified
- `src/app/blog/page.tsx` - Added sidebar layout with categories and search
- `src/components/features/BlogSidebar.tsx` - NEW component
- `src/components/features/BlogPostCard.tsx` - Cloudinary URL fix
- `src/components/features/BlogPostContent.tsx` - Cloudinary URL fix
- `src/components/features/RelatedPosts.tsx` - Cloudinary URL fix
- `next.config.js` - Added Cloudinary to remotePatterns

## Image URL Handling Pattern
All image components now use this pattern:
```javascript
src={
  imageUrl.startsWith('http')
    ? imageUrl  // Direct Cloudinary URL
    : `/api/proxy/assets/uploads/${imageUrl.split('/uploads/').pop()}`  // Proxy for local
}
```

## Technical Debt
- Some old IP references might still exist in legacy scripts/documentation (verified and replaced in active frontend code).
- ESLint 8 is deprecated; consider upgrading to ESLint 9 in future
