# Active Context - SEO/GEO Enhancement Project

## Current Status (2026-01-30)

## Current Focus (2026-02-03)

### Architecture Control & Validation Phase (started)

Single source of truth: [`001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md`](001-HEILIG-ARCHITECTUUR/ARCHITECTURE-TOTAL-PICTURE-3-FEB2026.md:1)

Work started on page-by-page validation (strict compare vs wireframes/rules). Findings are tracked in:
- [`001-HEILIG-ARCHITECTUUR/CONTROL-VALIDATION-PROGRESS.md`](001-HEILIG-ARCHITECTUUR/CONTROL-VALIDATION-PROGRESS.md:1)

Immediate technical fix discovered during validation:
- Header main nav “Informatiebeveiliging” incorrectly linked to detail page `/informatiebeveiliging/iso-27001` (should link to hub `/informatiebeveiliging`).
  - Fixed in [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx:54)


### 🎯 Google Analytics & Tag Manager API Access - FULL CONTROL ✅

**Updated (2026-01-30):**

We now have **programmatic API access** to Google Tag Manager and Google Analytics 4. This allows automated management of tags, triggers, variables, and analytics configuration without manual UI interaction.

**Complete Documentation:** [`/google-analytics-management/`](google-analytics-management/)

**What We Can Do:**
| GTM | GA4 |
|-----|-----|
| Create/edit/delete tags | Read property settings |
| Create/edit triggers | Create conversions |
| Create/edit variables | Create custom dimensions |
| Publish changes | Create audiences |
| Version control | Generate reports |

**Key Configuration:**
- **GTM Container:** GTM-556J8S8K (Account: 6303356117, Container: 224608008)
- **GA4 Property:** Property ID 467095380, Measurement ID: **G-QHY9D9XR7G**
- **Service Account:** `maasiso-analytics-bot@gen-lang-client-0994431140.iam.gserviceaccount.com`
- **Credentials:** `secrets/google-service-account.json` (in .gitignore)

**Verification Script:**
```bash
node scripts/check-google-analytics.js
```

**Files Created:**
- [`google-analytics-management/README.md`](google-analytics-management/README.md) - Main documentation
- [`google-analytics-management/CAPABILITIES.md`](google-analytics-management/CAPABILITIES.md) - API capabilities detail
- [`google-analytics-management/CURRENT-STATE.md`](google-analytics-management/CURRENT-STATE.md) - Current GTM/GA4 state
- [`scripts/check-google-analytics.js`](scripts/check-google-analytics.js) - Verification script

---

### Google Consent Mode v2 Implemented ✅

**Updated (2026-01-30):**

Implemented Google Consent Mode v2 for AVG/GDPR compliance. Analytics tracking is now blocked by default until user consent.

**Implementation:**
- [`app/layout.tsx`](app/layout.tsx:72) - Consent defaults (all denied)
- [`src/lib/cookies/cookieManager.ts`](src/lib/cookies/cookieManager.ts:14) - Sends consent updates to Google
- [`src/types/gtag.d.ts`](src/types/gtag.d.ts) - TypeScript types for consent commands

**Behavior:**
- On page load: `analytics_storage: denied`, `ad_storage: denied`
- After accept: `gtag('consent', 'update', { analytics_storage: 'granted', ... })`
- No tracking until explicit consent

---

### Enhanced Analytics Tracking ✅

**Updated (2026-01-30):**

Complete analytics implementation with page views, scroll depth, and engagement tracking.

**Features:**
- Page view tracking to GA4
- Scroll depth tracking (25%, 50%, 75%, 90%, 100% milestones)
- Engagement tracking (time on page, max scroll on leave)
- Helper functions: `trackDownload()`, `trackSearch()`, `trackFormSubmission()`, `trackOutboundLink()`

**Files Modified:**
- [`src/lib/analytics.ts`](src/lib/analytics.ts) - Complete tracking implementation
- [`src/components/common/Analytics.tsx`](src/components/common/Analytics.tsx) - Page tracking component

---

### Download Tracking via GA4/GTM for CTA Buttons ✅

**Updated (2026-01-29):**

Implemented client-side download tracking for CTA buttons that link to files. The tracking pushes a `file_download` event to the GTM `dataLayer` only when analytics consent is granted (based on the `analytics_enabled` localStorage flag set by the cookie consent flow).

**Behavior:**
- Detects common download file extensions on CTA button links
- Pushes metadata for analytics: file name, extension, URL, page path, content group, blog slug (if applicable), and download method
- Preserves existing button navigation behavior

**Files Modified:**
- [`src/components/features/ComponentRegistry.tsx`](src/components/features/ComponentRegistry.tsx:1) - Added download detection + GTM event push on CTA button clicks

### Download Tracking for Links in Blog Content ✅

**Updated (2026-01-29):**

Added download tracking for file links inside blog post content (Markdown links). Links pointing to common file types now push a `file_download` event to GTM `dataLayer` on click, respecting analytics consent.

**Files Modified:**
- [`src/components/features/BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:1) - Added download detection + GTM event push on markdown links
- [`src/types/gtag.d.ts`](src/types/gtag.d.ts:1) - Added `dataLayer` typing on `window`

### GTM Container Added for maasiso.nl ✅

**Updated (2026-01-29):**

Injected GTM container `GTM-556J8S8K` into the root layout so Tag Assistant can connect on `https://maasiso.nl` and events can flow to GA4.

**Files Modified:**
- [`app/layout.tsx`](app/layout.tsx:1) - Added GTM script via `next/script` and noscript iframe

### Fixed: Blog Post Dates No Longer Change on Deploy ✅

**Updated (2026-01-29):**

Fixed a bug where all blog posts showed January 28th (yesterday's deployment date) as their "last updated" date instead of the actual dates stored in Strapi.

**Root Cause:**
The `mapBlogPost()` function and other mappers in `src/lib/api.ts` used `new Date().toISOString()` as fallback when `updatedAt` was falsy:
```typescript
// OLD (problematic)
updatedAt: data.updatedAt || new Date().toISOString(),
```
This meant if Strapi didn't return an `updatedAt` field (or it was null/undefined), the current date was used instead of the Strapi-stored date.

**Solution:**
Changed all date fallback logic to use Strapi's `publishedAt` or `createdAt` as fallback, never the current date:
```typescript
// NEW (fixed)
updatedAt: data.updatedAt || data.publishedAt || data.createdAt,
```

**Files Modified:**
- [`src/lib/api.ts`](src/lib/api.ts:285) - Fixed `mapBlogPost`, `mapAuthor`, `mapNewsArticle`, `mapWhitepaper`, `mapPage`, `mapImage`, and all inline mapping functions
- [`src/lib/featureExtractor.ts`](src/lib/featureExtractor.ts:37) - Fixed `mapImage` function
- [`src/lib/api/mappers/image.ts`](src/lib/api/mappers/image.ts:23) - Fixed `mapImage` export

**Impact:**
- Blog posts now correctly show their Strapi `updatedAt` date
- News articles now correctly show their Strapi `updatedAt` date
- Sitemap `lastModified` dates now reflect actual content changes, not deployment time
- SEO freshness signals are now accurate

---

### "Laatst bijgewerkt" Date Added to Blog Posts ✅

**Updated (2026-01-28 20:27):**

Added "Last Updated" (Bijgewerkt) date display to blog posts on the frontend for improved SEO and user experience.

**Implementation:**
- Modified [`src/components/features/BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:60) to show both publication and update dates
- "Bijgewerkt" date only shows if it differs from "Gepubliceerd" by at least 1 day
- Changed date format from English to Dutch locale (`nl-NL`)
- Also updated related posts sidebar to use Dutch date formatting

**Display Format:**
```
Gepubliceerd: 15 januari 2025 | Bijgewerkt: 28 januari 2025 • Niels Maas
```

**Technical Details:**
- Uses Strapi's automatic `updatedAt` field (already mapped in `mapBlogPost()`)
- TypeScript types already include `updatedAt` in `BaseContent` interface
- Semantic `<time>` elements with `dateTime` attributes for SEO
- Comparison logic prevents showing "Bijgewerkt" for minor edits (< 1 day)

**Files Changed:**
- [`src/components/features/BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:60) - Added update date display with Dutch labels

---

### DATABASE_URL Added to Vercel Production ✅

**Updated (2026-01-28 16:55):**

The `DATABASE_URL` environment variable has been added to Vercel production, enabling the Related Posts Manager to save relations directly to the PostgreSQL database.

**Problem:**
- The Related Posts Manager on https://maasiso.nl/admin/related-posts showed error:
  ```
  DATABASE_URL not configured. Cannot save relations without direct database access.
  ```

**Solution:**
- Added `DATABASE_URL` to Vercel project `maasiso-copy-2` for production environment
- Value: `postgresql://postgres:pgdTOwRehSRwOVocgKXAVIhJTHXEdaEQ@centerbeam.proxy.rlwy.net:52159/railway`
- Note: Uses the **public proxy URL** (not internal Railway URL) because Vercel needs external access

**Verification:**
- API now returns `"source":"database"` confirming direct database access
- Test: `curl "https://maasiso.nl/api/related-posts?action=list"` returns posts from database
- Related Posts Manager can now save relations on production

**Commands Used:**
```bash
# Remove incorrect internal URL
npx vercel env rm DATABASE_URL production --yes

# Add correct external proxy URL
echo postgresql://postgres:...@centerbeam.proxy.rlwy.net:52159/railway | npx vercel env add DATABASE_URL production

# Trigger deployment
npx vercel --prod
```

---

### Related Posts Manager - PRODUCTION CONFIGURED ✅

**Updated (2026-01-28 16:45):**

Production environment for the Related Posts Manager is now fully configured:

**Problem Found & Fixed:**
- The `ADMIN_PASSWORD` environment variable was added to the wrong Vercel project
- `maasiso.nl` domain is hosted on project `maasiso-copy-2`, NOT `maasiso-copy`
- After adding the env var to the correct project, authentication works

**Production Configuration:**
- **Vercel Project**: `maasiso-copy-2` (linked to `maasiso.nl`)
- **Environment Variables**:
  - `ADMIN_PASSWORD` - Authentication for the web tool
  - `DATABASE_URL` - PostgreSQL connection for direct database access
- **Password**: Same as local `.env.local` (`MaasISO2024!Admin`)
- **API Endpoint**: `https://maasiso.nl/api/admin-auth` ✅ Working
- **Web Tool URL**: `https://maasiso.nl/admin/related-posts`

**Vercel Projects Overview:**
| Project | Domain | Purpose |
|---------|--------|---------|
| `maasiso-copy-2` | maasiso.nl | **Production** |
| `maasiso-copy` | maasiso-copy.vercel.app | Development/Preview |
| `iso-selector` | iso-selector.maasiso.nl | ISO selector tool |

**How to Add Environment Variables:**
```bash
# Link to the correct project first
npx vercel link --project maasiso-copy-2 --yes

# Then add the variable
echo "YourValue" > env_value.txt
type env_value.txt | npx vercel env add VAR_NAME production

# Trigger a deployment
git commit --allow-empty -m "chore: trigger deployment" && git push
```

---

### Related Posts Web Tool - UI UPGRADED & SECURED ✅

**Updated (2026-01-28 16:13):**

The web-based related posts tool has been upgraded with improved UI and security:

**New Features:**
1. ✅ **Searchable Post Selector** - Search by title or slug instead of simple dropdown
2. ✅ **Alphabetical Sorting** - Posts sorted A-Z by title (Dutch locale)
3. ✅ **Slug Display** - Each post shows both title and slug (e.g., `/iso-27001-certificering`)
4. ✅ **"Terug naar begin" Button** - Reset to start page when editing a post
5. ✅ **Password Authentication** - Secure login required before accessing the tool
6. ✅ **Session Management** - Token-based auth with 24-hour expiry
7. ✅ **Logout Button** - Clear session and return to login screen

**Security Implementation:**
- Password stored in environment variable `ADMIN_PASSWORD` (not in code)
- Server-side authentication via [`app/api/admin-auth/route.ts`](app/api/admin-auth/route.ts:1)
- Token stored in sessionStorage (cleared on browser close)
- Token expires after 24 hours

**Configuration:**
Add to `.env.local`:
```env
ADMIN_PASSWORD=YourSecurePassword
```

**Files Updated:**
- [`app/admin/related-posts/page.tsx`](app/admin/related-posts/page.tsx:1) - Complete UI overhaul with auth
- [`app/api/admin-auth/route.ts`](app/api/admin-auth/route.ts:1) - New authentication API endpoint
- [`.env.local`](.env.local:8) - Added ADMIN_PASSWORD variable

---

### Related Posts Web Tool - FULLY TESTED ✅

**Tested (2026-01-28 15:40):**

The web-based related posts tool has been fully tested and verified working:

**Test Results:**
1. ✅ **List Posts** - Successfully retrieved 36 posts from database
2. ✅ **Save Relations** - Successfully linked 2 related posts to 2 versions (draft + published)
3. ✅ **Persistence** - Relations confirmed persisted after re-fetch

**Configuration Fix Applied:**
- Changed `DATABASE_URL` from internal Railway URL (`postgres.railway.internal`) to public proxy URL (`centerbeam.proxy.rlwy.net:52159`)
- Internal URLs only work within Railway network; public proxy required for local development

**Test Script:**
```bash
# List all posts
node scripts/test-related-posts-webtool.js --list

# Save relations (example)
node scripts/test-related-posts-webtool.js --source afg9frnaefhlgak63piqrpc2 --targets aqa988euutjs64a097t4ryoo,awrbw0p9tzoxruu3nigikuj0
```

**Files Updated:**
- [`.env.local`](.env.local:5) - DATABASE_URL now uses public proxy
- [`scripts/test-related-posts-webtool.js`](scripts/test-related-posts-webtool.js:1) - Test script for automated verification

---

## Previous Status (2026-01-27)

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

**Over Niels Maas Page Upgrade (In Progress):**
- Fetches author details from Strapi via `getAuthorBySlug('niels-maas')`
- Uses Strapi data (name, bio, credentials, expertise, LinkedIn, email, profile image)
- Renders expanded hero with author image + contact chips
- Overrides title display to "Senior Consultant" for Niels Maas (replaces Lead Auditor wording)

---

### relatedPosts Feature - FULL WEB-BASED TOOL (2026-01-27 21:19)

**Status: ✅ Complete Web-Based Solution Implemented**

The Strapi v5 Admin UI has a **confirmed bug** with self-referential manyToMany relations. Both bidirectional and unidirectional configurations fail with:
```
Document with id "...", locale "null" not found
```

**Solution: Full Web-Based Management Tool with Direct Database Access**

Instead of fighting the Admin UI bug, we've implemented a complete web-based workaround:

**1. Next.js API Route (Direct Database Access):**
- File: [`app/api/related-posts/route.ts`](app/api/related-posts/route.ts:1)
- Endpoints:
  - `GET /api/related-posts?action=list` - List all posts
  - `GET /api/related-posts?documentId=xxx` - Get related posts for a document
  - `POST /api/related-posts` - Save related posts (body: `{documentId, relatedDocumentIds[]}`)
- Uses `pg` package for direct PostgreSQL access
- Falls back to Strapi API for read-only if DATABASE_URL not configured

**2. Web-Based Management Tool:**
- URL: `/admin/related-posts`
- File: [`app/admin/related-posts/page.tsx`](app/admin/related-posts/page.tsx:1)
- Features:
  - ✅ Select a blog post from dropdown
  - ✅ Search/filter posts
  - ✅ Two-column layout: available posts (left) + selected posts (right)
  - ✅ Click to toggle selection
  - ✅ Visual indicators for new vs existing relations
  - ✅ Unsaved changes warning
  - ✅ Save with one click
  - ✅ No scripts needed!

**How to Use:**
1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/admin/related-posts`
3. Select a blog post from the dropdown
4. Click on posts in the left column to add/remove relations
5. Click "Opslaan" to save
6. Done! The relations are saved directly to the database

**Configuration Required:**
Add to `.env.local`:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**Why This Works:**
- Bypasses the Strapi Admin UI entirely
- Writes directly to the PostgreSQL join table (`blog_posts_related_posts_lnk`)
- Updates ALL versions (draft + published) of a document
- Works for ALL blog posts, not just one
- No lifecycle hooks or middleware needed
- Simple, reliable, and maintainable

**Schema (unidirectional):**
```json
"relatedPosts": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::blog-post.blog-post"
}
```

**Documentation:**
- [`scripts/README-gerelateerde-posts.md`](scripts/README-gerelateerde-posts.md:1) - Complete user guide

**Testing (2026-01-28):**
- Added test script [`scripts/test-related-posts-webtool.js`](scripts/test-related-posts-webtool.js:1) to verify list/save/persistence via `/api/related-posts`
- README updated with step-by-step test instructions

**Frontend (unchanged):**
- [`src/lib/api.ts`](src/lib/api.ts:953) - Explicit populate for relatedPosts
- [`src/components/features/RelatedPosts.tsx`](src/components/features/RelatedPosts.tsx:1) - Renders related posts
- [`src/components/features/BlogPostContent.tsx`](src/components/features/BlogPostContent.tsx:34) - Sidebar uses relatedPosts

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
