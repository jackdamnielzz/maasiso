# Strapi Schema Files - SEO/GEO Enhancement

Complete Strapi schema definitions for the MaasISO blog SEO/GEO enhancement project.

## What's Included

### 📁 Schema Files

```
strapi-schemas/
├── api/
│   ├── author/                          # NEW: Authors collection
│   │   └── content-types/
│   │       └── author/
│   │           └── schema.json
│   └── blog-post/                       # UPDATED: Enhanced blog posts
│       └── content-types/
│           └── blog-post/
│               └── schema.json
├── components/
│   └── blog/
│       ├── tldr-item.json              # NEW: TL;DR component
│       └── faq-item.json               # NEW: FAQ component
└── scripts/
    └── migrate-authors.js              # Migration script for existing posts
```

### 🎯 What This Adds to Strapi

**New Collections:**
- **Authors**: Complete author profiles with E-E-A-T optimization
  - Name, slug, bio, credentials, expertise
  - Profile image, LinkedIn, email
  - One-to-many relation with blog posts

**New Components:**
- **TldrItem**: Key takeaway points (3-7 per post)
- **FaqItem**: Question & answer pairs for FAQPage schema

**Enhanced Blog Post Fields (14 new fields):**
- `excerpt` (text, required, 160 chars) - For meta descriptions and AI snippeting
- `author` (relation) - Replaces old string field
- `tldr` (component, 3-7 items required) - TL;DR section
- `faq` (component, optional) - FAQ section
- `relatedPosts` (relation) - Internal linking
- `schemaType` (enum: Article/HowTo/FAQPage) - Schema control
- `primaryKeyword` (string) - SEO tracking
- `searchIntent` (enum) - Content strategy
- `ctaVariant` (enum) - Dynamic CTAs
- `robotsIndex` (boolean) - Index control per post
- `robotsFollow` (boolean) - Follow control per post
- `ogImage` (media) - Open Graph override
- `videoUrl`, `videoTitle`, `videoDuration` - Video schema support

## Quick Start

### Prerequisites

1. ✅ You have a Strapi backend repository (separate from this frontend repo)
2. ✅ Your Strapi is deployed to Railway: `https://peaceful-insight-production.up.railway.app`
3. ✅ You have Git access to your Strapi repository
4. ✅ You have a valid Strapi API token with write permissions

### Deployment (3 Options)

#### Option 1: Automated Copy Script (Recommended)

**Windows (PowerShell):**
```powershell
# Navigate to this directory
cd "D:\Programmeren\MaasISO\New without errors\maasiso - Copy\strapi-schemas"

# Run copy script (replace path with your Strapi repo location)
.\copy-to-strapi.ps1 -StrapiPath "C:\path\to\your\strapi-backend"
```

**macOS/Linux:**
```bash
# Navigate to this directory
cd "/path/to/maasiso/strapi-schemas"

# Run copy script
./copy-to-strapi.sh /path/to/your/strapi-backend
```

The script will:
- ✅ Copy all schema files to correct locations
- ✅ Create necessary directories
- ✅ Show you exactly what was copied
- ✅ Provide next steps for Git commit/push

#### Option 2: Manual Copy

See [DEPLOYMENT-INSTRUCTIONS.md](./DEPLOYMENT-INSTRUCTIONS.md) for detailed manual steps.

#### Option 3: Direct Git Operations

If your Strapi repo is on the same machine:
```bash
# Find your Strapi repo
cd ..
find . -name "strapi" -type d

# Or search by package.json content
grep -r "@strapi/strapi" --include="package.json"
```

### After Copying Files

1. **Review changes in your Strapi repository:**
   ```bash
   cd /path/to/strapi-backend
   git status
   git diff src/api/blog-post/content-types/blog-post/schema.json
   ```

2. **Commit and push:**
   ```bash
   git add src/api/ src/components/ scripts/
   git commit -m "feat: add SEO/GEO enhanced schemas with Authors collection"
   git push origin main
   ```

3. **Monitor Railway deployment:**
   - Railway auto-deploys on push (3-5 minutes)
   - Watch logs for successful schema application
   - Strapi will automatically create/update database tables

4. **Run migration script:**
   ```bash
   # Set environment variables
   export STRAPI_URL=https://peaceful-insight-production.up.railway.app
   export STRAPI_TOKEN=9ff727d730447da883cad384524bc2e9891de14e526d0273c0785710762dc0ef2aa6900a855948e3fa6ed72a1927178b6c725fa34605959aac8cb69794463c1484cd0325548fc3a5c88898cb9099ac114e40c19bb6755c8d2f7d9110330be97031587152e34f6e37992eb31faef66c92f60df20b32b80b95029744047504f9f9

   # Run migration
   node scripts/migrate-authors.js
   ```

   This will:
   - Create default "Niels Maas" author if none exists
   - Migrate all existing blog posts to use author relation
   - Show detailed progress and summary

5. **Verify in Strapi Admin:**
   - Go to `https://peaceful-insight-production.up.railway.app/admin`
   - Check Content-Type Builder for new fields/collections
   - Create a test blog post with all new fields

6. **Test API response:**
   ```bash
   curl "https://peaceful-insight-production.up.railway.app/api/blog-posts?populate=*&pagination[limit]=1"
   ```

## Frontend Integration Status

✅ **COMPLETE** - All frontend components are already implemented in this repository:

- ✅ TypeScript types updated ([src/lib/types/index.ts](../src/lib/types/index.ts))
- ✅ TldrBlock component ([src/components/features/TldrBlock.tsx](../src/components/features/TldrBlock.tsx))
- ✅ FaqSection component ([src/components/features/FaqSection.tsx](../src/components/features/FaqSection.tsx))
- ✅ AuthorBox component ([src/components/features/AuthorBox.tsx](../src/components/features/AuthorBox.tsx))
- ✅ SchemaMarkup enhanced ([src/components/ui/SchemaMarkup.tsx](../src/components/ui/SchemaMarkup.tsx))
- ✅ Blog template updated ([app/blog/[slug]/page.tsx](../app/blog/[slug]/page.tsx))
- ✅ API mapper updated ([src/lib/api.ts](../src/lib/api.ts))
- ✅ Sitemap optimized ([app/sitemap.ts](../app/sitemap.ts))
- ✅ IndexNow integration ([src/lib/indexnow.ts](../src/lib/indexnow.ts))

**The frontend is ready** - it just needs the Strapi backend to provide the new fields!

## Migration Strategy

The migration script handles backward compatibility:

1. **Existing posts** with old `Author` string field:
   - ✅ Will be migrated to new `author` relation
   - ✅ All linked to default "Niels Maas" author
   - ✅ Old field can be removed after verification

2. **New posts** created after deployment:
   - ✅ Must have author selected (required field)
   - ✅ Must have excerpt (required)
   - ✅ Must have 3-7 TL;DR items (required)
   - ✅ FAQ is optional but recommended

3. **Gradual rollout**:
   - Deploy schemas first (adds fields)
   - Run migration (fills required fields for existing posts)
   - Populate new fields gradually in Strapi Admin

## Troubleshooting

### Can't Find Strapi Repository?

Try these commands:

**Windows:**
```powershell
# Search entire drive
Get-ChildItem -Path C:\ -Filter "package.json" -Recurse -ErrorAction SilentlyContinue | Where-Object { (Get-Content $_.FullName -Raw) -match "@strapi/strapi" }
```

**macOS/Linux:**
```bash
# Search home directory
find ~ -name "package.json" -type f -exec grep -l "@strapi/strapi" {} \;
```

**Check Git hosting:**
```bash
# If using GitHub
gh repo list | grep -i strapi

# Or check all your projects
ls -la ~/Projects/ | grep -i strapi
```

### Schema Not Applying After Push?

1. Check Railway logs for errors
2. Verify file paths are exactly correct
3. Try rebuilding Strapi: `npm run build`
4. Restart Railway service from dashboard

### Database Migration Errors?

1. **Backup database first!** (Railway has automatic backups)
2. Check for conflicting field names
3. Review Strapi migration logs
4. May need to manually adjust database schema

See [DEPLOYMENT-INSTRUCTIONS.md](./DEPLOYMENT-INSTRUCTIONS.md) for detailed troubleshooting.

## Documentation

- **[DEPLOY.md](./DEPLOY.md)** - Quick deployment guide with step-by-step instructions
- **[DEPLOYMENT-INSTRUCTIONS.md](./DEPLOYMENT-INSTRUCTIONS.md)** - Comprehensive 50-page deployment guide
- **[scripts/migrate-authors.js](./scripts/migrate-authors.js)** - Automated migration script with comments
- **[../docs/cms-audit-report.md](../docs/cms-audit-report.md)** - Complete audit of current vs. required state
- **[../docs/STRAPI-IMPLEMENTATION-GUIDE.md](../docs/STRAPI-IMPLEMENTATION-GUIDE.md)** - Manual implementation guide
- **[../docs/IMPLEMENTATION-SUMMARY.md](../docs/IMPLEMENTATION-SUMMARY.md)** - Executive summary

## Success Checklist

After deployment, verify:

- ☐ Strapi starts without errors
- ☐ Authors collection exists in Content Manager
- ☐ Blog Post has all 27 fields (14 new ones)
- ☐ Components exist: `blog.tldr-item`, `blog.faq-item`
- ☐ Can create test author
- ☐ Can create test blog post with all fields
- ☐ API returns populated data correctly
- ☐ Frontend displays TL;DR, FAQ, Author box
- ☐ JSON-LD schema includes author details
- ☐ Meta tags include new fields

## Next Steps After Deployment

1. **Populate existing content**:
   - Add excerpts to all blog posts
   - Add 3-7 TL;DR items to each post
   - Add FAQ sections where relevant
   - Create author profiles for all writers

2. **Test SEO improvements**:
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)
   - Lighthouse SEO audit
   - Test AI search citations (ChatGPT, Perplexity)

3. **Monitor metrics**:
   - SERP rankings for target keywords
   - Click-through rates from search
   - AI search citations and mentions
   - Time on page, bounce rate

4. **Optimize content**:
   - Use `searchIntent` field for content strategy
   - Populate `relatedPosts` for internal linking
   - Add videos with proper schema markup
   - Customize CTA variants per post intent

---

**Ready to deploy?** Run the copy script or follow [DEPLOY.md](./DEPLOY.md)!

**Questions?** See [DEPLOYMENT-INSTRUCTIONS.md](./DEPLOYMENT-INSTRUCTIONS.md) for comprehensive guide.

**Implementation complete!** 🎉 Frontend is ready, backend schemas are ready. Just deploy and test!
