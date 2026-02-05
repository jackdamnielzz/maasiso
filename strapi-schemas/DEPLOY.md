# Quick Deployment Guide

## Architecture Overview

- **Frontend (This Repo)**: Next.js application deployed to Vercel
- **Backend (Separate Repo)**: Strapi CMS deployed to Railway at `https://peaceful-insight-production.up.railway.app`

## Deployment Steps

### Step 1: Locate Your Strapi Repository

Your Strapi backend is deployed separately. You need to find the Strapi repository on your local machine or clone it from your Git hosting (GitHub/GitLab/etc.).

Common locations to check:
```bash
# Check parent directory
cd ..
ls -la | grep -i strapi

# Or search your entire Programmeren folder
dir /s /b | findstr /i "strapi" | findstr /i "backend\|cms\|api"
```

### Step 2: Copy Schema Files

Once you've located your Strapi repository, copy the schema files:

```bash
# Navigate to this frontend project
cd "D:\Programmeren\MaasISO\New without errors\maasiso - Copy"

# Set your Strapi repo path (REPLACE THIS PATH)
set STRAPI_PATH=C:\path\to\your\strapi-backend

# Copy authors schema
xcopy /Y "strapi-schemas\api\author\*" "%STRAPI_PATH%\src\api\author\" /E

# Copy updated blog-post schema
xcopy /Y "strapi-schemas\api\blog-post\*" "%STRAPI_PATH%\src\api\blog-post\" /E

# Copy components
xcopy /Y "strapi-schemas\components\blog\*" "%STRAPI_PATH%\src\components\blog\" /E

# Copy migration script
xcopy /Y "strapi-schemas\scripts\migrate-authors.js" "%STRAPI_PATH%\scripts\" /E
```

**macOS/Linux:**
```bash
# Set your Strapi repo path (REPLACE THIS PATH)
STRAPI_PATH="/path/to/your/strapi-backend"

# Copy everything
cp -r strapi-schemas/api/author "$STRAPI_PATH/src/api/"
cp -r strapi-schemas/api/blog-post/content-types/blog-post/schema.json "$STRAPI_PATH/src/api/blog-post/content-types/blog-post/"
cp -r strapi-schemas/components/blog/* "$STRAPI_PATH/src/components/blog/"
mkdir -p "$STRAPI_PATH/scripts"
cp strapi-schemas/scripts/migrate-authors.js "$STRAPI_PATH/scripts/"
```

### Step 3: Commit and Deploy

```bash
# Navigate to Strapi repository
cd %STRAPI_PATH%

# Review changes
git status
git diff src/api/blog-post/content-types/blog-post/schema.json

# Commit
git add src/api/ src/components/ scripts/
git commit -m "feat: add SEO/GEO enhanced schemas with Authors collection

- Add Authors collection with E-E-A-T optimization
- Add TldrItem and FaqItem components
- Enhance BlogPost schema with 14 new fields:
  * excerpt, tldr, faq, relatedPosts
  * author relation (replacing string field)
  * schemaType, searchIntent, ctaVariant
  * robotsIndex, robotsFollow
  * ogImage, video fields
- Include migration script for existing posts

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to trigger Railway deployment
git push origin main
```

### Step 4: Monitor Deployment

1. **Watch Railway logs**: Railway will auto-deploy when you push
2. **Expected timeline**: 3-5 minutes for deployment
3. **Strapi will automatically**:
   - Create new database tables
   - Add new columns to existing tables
   - Register new components

### Step 5: Create Default Author

Once deployment succeeds, create the default author entry:

**Option A: Via Strapi Admin UI**
1. Go to `https://peaceful-insight-production.up.railway.app/admin`
2. Navigate to Content Manager → Authors
3. Click "Create new entry"
4. Fill in:
   - Name: `Niels Maas`
   - Slug: `niels-maas`
   - Bio: `Niels Maas is een ervaren ISO-consultant met meer dan 10 jaar ervaring in kwaliteitsmanagement en informatiebeveiliging.`
   - Credentials: `Lead Auditor ISO 27001`
   - Expertise: `["ISO 9001", "ISO 27001", "ISO 14001", "AVG", "BIO"]`
5. Save and Publish

**Option B: Run Migration Script** (Recommended - Creates author AND migrates all posts)
```bash
cd %STRAPI_PATH%

# Set environment variables
set STRAPI_URL=https://peaceful-insight-production.up.railway.app
set STRAPI_TOKEN=[REDACTED_STRAPI_TOKEN]

# Run migration
node scripts/migrate-authors.js
```

### Step 6: Verify Deployment

```bash
# Test API endpoint
curl "https://peaceful-insight-production.up.railway.app/api/blog-posts?populate=*&pagination[limit]=1"
```

Verify response includes:
- ✅ `excerpt` field
- ✅ `author` object (not string)
- ✅ `tldr` array
- ✅ `faq` array
- ✅ `relatedPosts` array
- ✅ `schemaType`, `robotsIndex`, `robotsFollow`

### Step 7: Test Frontend Integration

All frontend components are already implemented in this repository. Test the integration:

1. Create a test blog post in Strapi Admin with:
   - Author (select from dropdown)
   - Excerpt (required)
   - At least 3 TL;DR items
   - Optional FAQ items

2. Navigate to the blog post on your frontend: `https://maasiso.nl/blog/your-test-post`

3. Verify:
   - ✅ TL;DR block appears before content
   - ✅ FAQ section appears after content (if added)
   - ✅ Author box displays with profile
   - ✅ Meta tags include new fields
   - ✅ JSON-LD schema includes author details

## Troubleshooting

### Can't Find Strapi Repository

Check your Git hosting:
```bash
# List all your repositories
gh repo list

# Or check Railway projects
railway projects
```

If you can't find it, the Strapi instance might be:
1. Deployed from a different machine
2. Deployed directly via Railway without Git
3. In a different location on your system

### Alternative: Direct Railway Deployment

If you have Railway CLI access:

```bash
# Clone the Railway project
railway link
railway run bash

# Inside the Railway container
cd /app/src/api
# Manually upload files via SFTP or Railway dashboard
```

### Schema Deployment Issues

If schema files don't apply after pushing:
1. Check Railway logs for errors
2. Ensure file paths are exactly:
   - `src/api/author/content-types/author/schema.json`
   - `src/api/blog-post/content-types/blog-post/schema.json`
   - `src/components/blog/tldr-item.json`
   - `src/components/blog/faq-item.json`
3. Restart Strapi: `railway restart`

## What's Already Done in This Frontend

✅ **TypeScript Types**: All interfaces updated in [src/lib/types/index.ts](../src/lib/types/index.ts)
✅ **Components Created**:
  - [src/components/features/TldrBlock.tsx](../src/components/features/TldrBlock.tsx)
  - [src/components/features/FaqSection.tsx](../src/components/features/FaqSection.tsx)
  - [src/components/features/AuthorBox.tsx](../src/components/features/AuthorBox.tsx)
✅ **Schema Markup Enhanced**: [src/components/ui/SchemaMarkup.tsx](../src/components/ui/SchemaMarkup.tsx)
✅ **Blog Template Updated**: [app/blog/[slug]/page.tsx](../app/blog/[slug]/page.tsx)
✅ **API Mapper Updated**: [src/lib/api.ts](../src/lib/api.ts)
✅ **Sitemap Optimized**: [app/sitemap.ts](../app/sitemap.ts)
✅ **IndexNow Integration**: [src/lib/indexnow.ts](../src/lib/indexnow.ts)

## Next Steps After Deployment

1. **Populate existing blog posts**:
   - Add excerpts to all posts
   - Add 3-7 TL;DR items to each post
   - Add FAQ sections where relevant
   - Link all posts to author

2. **Test SEO improvements**:
   - Google Rich Results Test: https://search.google.com/test/rich-results
   - Schema.org Validator: https://validator.schema.org/
   - Lighthouse SEO audit

3. **Monitor performance**:
   - Track SERP rankings for target keywords
   - Monitor AI search citations (ChatGPT, Perplexity)
   - Analyze click-through rates from search

4. **Optional enhancements**:
   - Add more authors as needed
   - Populate `relatedPosts` for internal linking
   - Add video fields to posts with embedded videos
   - Customize CTA variants per post

---

**Questions?** See detailed instructions in [DEPLOYMENT-INSTRUCTIONS.md](./DEPLOYMENT-INSTRUCTIONS.md)
