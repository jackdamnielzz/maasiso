# STRAPI CMS IMPLEMENTATION GUIDE
## Step-by-Step Instructions for Blog Post SEO/GEO Enhancement

**Version**: 1.0
**Date**: 2026-01-26
**Estimated Time**: 6-8 hours
**Difficulty**: Intermediate

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] Access to Strapi Admin Panel (https://peaceful-insight-production.up.railway.app/admin)
- [ ] Admin or Super Admin permissions in Strapi
- [ ] Backup of your Strapi database (CRITICAL!)
- [ ] Basic understanding of Strapi Content-Type Builder
- [ ] Access to the Railway deployment dashboard (for rollback if needed)

---

## ⚠️ IMPORTANT: Create Backup First!

**DO NOT SKIP THIS STEP!**

1. Log into Railway dashboard
2. Go to your Strapi service
3. Navigate to the database tab
4. Create a manual backup snapshot
5. Download the backup locally
6. Verify the backup file is not corrupted

---

## 🎯 Implementation Overview

This guide will walk you through:
1. Creating the Authors collection (30 mins)
2. Creating reusable components (20 mins)
3. Adding new fields to Blog Post (40 mins)
4. Migrating existing author data (60 mins)
5. Testing and verification (30 mins)

**Total estimated time**: 3-4 hours

---

## PART 1: CREATE AUTHORS COLLECTION

### Step 1.1: Create the Authors Collection Type

1. Log into Strapi Admin Panel
2. Navigate to **Content-Type Builder** (wrench icon in left sidebar)
3. Click **Create new collection type**
4. Enter collection name: `author` (singular, lowercase)
5. Click **Continue**

### Step 1.2: Add Fields to Authors Collection

Add the following fields one by one:

#### Field 1: Name
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `name`
- Advanced Settings:
  - ✅ Required field
  - Maximum length: 100
- Click **Finish**

#### Field 2: Slug
- Click **Add another field**
- Select **UID**
- Name: `slug`
- Attached field: `name`
- Advanced Settings:
  - ✅ Required field
- Click **Finish**

#### Field 3: Bio
- Click **Add another field**
- Select **Text** → **Long text**
- Name: `bio`
- Advanced Settings:
  - ✅ Required field
  - Maximum length: 500
- Click **Finish**

#### Field 4: Credentials
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `credentials`
- Advanced Settings:
  - ❌ NOT required
  - Maximum length: 150
- Click **Finish**

#### Field 5: Expertise
- Click **Add another field**
- Select **JSON**
- Name: `expertise`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

#### Field 6: Profile Image
- Click **Add another field**
- Select **Media** → **Single media**
- Name: `profileImage`
- Advanced Settings:
  - ❌ NOT required
  - Allowed types: Images only
- Click **Finish**

#### Field 7: LinkedIn
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `linkedIn`
- Advanced Settings:
  - ❌ NOT required
  - Format: URL validation (if available)
- Click **Finish**

#### Field 8: Email
- Click **Add another field**
- Select **Email**
- Name: `email`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

### Step 1.3: Save Authors Collection

1. Click **Save** in the top right
2. Wait for Strapi to restart (this may take 30-60 seconds)
3. Refresh the page
4. Verify the Authors collection appears in the left sidebar

---

## PART 2: CREATE REUSABLE COMPONENTS

### Step 2.1: Create TldrItem Component

1. In Content-Type Builder, click **Create new component**
2. Category: `blog` (create new category)
3. Name: `tldrItem`
4. Click **Continue**

#### Add Field to TldrItem:
- Click **Add another field to this component**
- Select **Text** → **Long text**
- Name: `point`
- Advanced Settings:
  - ✅ Required field
  - Maximum length: 300
- Click **Finish**
- Click **Save**

### Step 2.2: Create FaqItem Component

1. In Content-Type Builder, click **Create new component**
2. Category: `blog` (select existing)
3. Name: `faqItem`
4. Click **Continue**

#### Field 1: Question
- Click **Add another field to this component**
- Select **Text** → **Short text**
- Name: `question`
- Advanced Settings:
  - ✅ Required field
  - Maximum length: 200
- Click **Finish**

#### Field 2: Answer
- Click **Add another field to this component**
- Select **Text** → **Long text**
- Name: `answer`
- Advanced Settings:
  - ✅ Required field
  - Maximum length: 1000
- Click **Finish**
- Click **Save**

---

## PART 3: UPDATE BLOG POST CONTENT TYPE

### Step 3.1: Add Critical Fields

Navigate to Content-Type Builder → Blog Post, then add:

#### Field 1: Excerpt
- Click **Add another field**
- Select **Text** → **Long text**
- Name: `excerpt`
- Advanced Settings:
  - ✅ Required field
  - Maximum length: 160
- Click **Finish**

#### Field 2: TL;DR
- Click **Add another field**
- Select **Component** → **Repeatable component**
- Name: `tldr`
- Select component: `blog.tldrItem`
- Advanced Settings:
  - ❌ NOT required
  - Minimum: 3
  - Maximum: 7
- Click **Finish**

#### Field 3: FAQ
- Click **Add another field**
- Select **Component** → **Repeatable component**
- Name: `faq`
- Select component: `blog.faqItem`
- Advanced Settings:
  - ❌ NOT required
  - Minimum: 0 (no minimum)
  - Maximum: 20
- Click **Finish**

### Step 3.2: Add High Priority Fields

#### Field 4: Related Posts
- Click **Add another field**
- Select **Relation**
- Left side: `Blog Post`
- Relation type: **Many to many** (blog-posts ↔ blog-posts)
- Right side display field: `title`
- Name: `relatedPosts`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

#### Field 5: Schema Type
- Click **Add another field**
- Select **Enumeration**
- Name: `schemaType`
- Values (add one by one):
  - `Article`
  - `HowTo`
  - `FAQPage`
- Default value: `Article`
- Advanced Settings:
  - ✅ Required field
- Click **Finish**

#### Field 6: Primary Keyword
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `primaryKeyword`
- Advanced Settings:
  - ❌ NOT required
  - Maximum length: 100
- Click **Finish**

### Step 3.3: Add Optional Fields

#### Field 7: Search Intent
- Click **Add another field**
- Select **Enumeration**
- Name: `searchIntent`
- Values:
  - `Informational`
  - `Commercial`
  - `Transactional`
- Default value: `Informational`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

#### Field 8: CTA Variant
- Click **Add another field**
- Select **Enumeration**
- Name: `ctaVariant`
- Values:
  - `contact`
  - `download`
  - `newsletter`
  - `none`
- Default value: `none`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

#### Field 9: Robots Index
- Click **Add another field**
- Select **Boolean**
- Name: `robotsIndex`
- Default value: `true`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

#### Field 10: Robots Follow
- Click **Add another field**
- Select **Boolean**
- Name: `robotsFollow`
- Default value: `true`
- Advanced Settings:
  - ❌ NOT required
- Click **Finish**

#### Field 11: OG Image
- Click **Add another field**
- Select **Media** → **Single media**
- Name: `ogImage`
- Advanced Settings:
  - ❌ NOT required
  - Allowed types: Images only
- Click **Finish**

#### Field 12: Video URL
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `videoUrl`
- Advanced Settings:
  - ❌ NOT required
  - Format: URL validation
- Click **Finish**

#### Field 13: Video Title
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `videoTitle`
- Advanced Settings:
  - ❌ NOT required
  - Maximum length: 100
- Click **Finish**

#### Field 14: Video Duration
- Click **Add another field**
- Select **Text** → **Short text**
- Name: `videoDuration`
- Advanced Settings:
  - ❌ NOT required
  - Maximum length: 20
  - Placeholder: "PT5M30S"
- Click **Finish**

### Step 3.4: Save Blog Post Updates

1. Click **Save** in the top right
2. Wait for Strapi to restart
3. Refresh the page

---

## PART 4: MIGRATE AUTHOR DATA

### Step 4.1: Create Author Entries

1. Go to **Content Manager** → **Authors** (newly created)
2. Click **Create new entry**
3. Fill in the author details for "Niels Maas":
   - Name: `Niels Maas`
   - Slug: `niels-maas` (auto-generated)
   - Bio: `Niels Maas is een ervaren ISO-consultant met meer dan 10 jaar ervaring in kwaliteitsmanagement en informatiebeveiliging.`
   - Credentials: `Lead Auditor ISO 27001`
   - Expertise: `["ISO 9001", "ISO 27001", "ISO 14001", "AVG", "BIO"]`
   - LinkedIn: (add if available)
   - Email: (add if available)
4. Upload a profile image if available
5. Click **Save** and **Publish**

### Step 4.2: Add Author Relation to Blog Post

1. Go back to **Content-Type Builder** → **Blog Post**
2. Click **Add another field**
3. Select **Relation**
4. Left side: `Blog Post`
5. Relation type: **Many to one** (blog-posts → authors)
6. Right side: `Author`
7. Right side display field: `name`
8. Name: `newAuthor` (temporary name to avoid conflict)
9. Advanced Settings:
  - ✅ Required field
10. Click **Finish**
11. Click **Save**

### Step 4.3: Update Existing Blog Posts

1. Go to **Content Manager** → **Blog Posts**
2. For each blog post:
   - Click **Edit**
   - In the `newAuthor` field, select "Niels Maas"
   - Click **Save** and **Publish**
3. Repeat for all blog posts

**TIP**: If you have many blog posts, you may need to do this in batches to avoid timeouts.

### Step 4.4: Remove Old Author Field

⚠️ **ONLY DO THIS AFTER ALL BLOG POSTS ARE UPDATED!**

1. Go to **Content-Type Builder** → **Blog Post**
2. Find the old `Author` text field
3. Click the **Delete** icon (trash can)
4. Confirm deletion
5. Rename `newAuthor` to `author`:
   - Click on the `newAuthor` field
   - Change name to `author`
   - Click **Finish**
6. Click **Save**

---

## PART 5: VERIFICATION

### Step 5.1: Create Test Blog Post

1. Go to **Content Manager** → **Blog Posts**
2. Click **Create new entry**
3. Fill in ALL fields:
   - Title: "Test SEO Blog Post"
   - Slug: "test-seo-blog-post"
   - Content: (add some sample content)
   - Excerpt: "This is a test excerpt for SEO optimization"
   - Author: Select "Niels Maas"
   - Categories: Select at least one
   - Tags: Add at least one
   - Featured Image: Upload an image
   - Featured Image Alt Text: "Test alt text"
   - TL;DR: Add 3-5 points
   - FAQ: Add 2-3 questions and answers
   - Schema Type: Select "Article"
   - Robots Index: true
   - Robots Follow: true
4. Click **Save** and **Publish**

### Step 5.2: Test API Response

1. Open a new browser tab
2. Go to: `https://peaceful-insight-production.up.railway.app/api/blog-posts?populate=*&filters[slug][$eq]=test-seo-blog-post`
3. Verify the JSON response includes:
   - ✅ `excerpt` field with your text
   - ✅ `tldr` array with your points
   - ✅ `faq` array with your questions/answers
   - ✅ `author` object (not string) with relation data
   - ✅ `schemaType` with "Article"
   - ✅ All other new fields

### Step 5.3: Verify in Frontend

1. Go to: `https://maasiso.nl/blog/test-seo-blog-post`
2. Verify you can see:
   - ✅ TL;DR block near the top
   - ✅ FAQ section with expandable questions
   - ✅ Author box with full details
   - ✅ All metadata in page source

### Step 5.4: Delete Test Post

1. Go back to Strapi
2. Delete or unpublish the test blog post
3. Verify it's removed from the frontend

---

## 📊 IMPLEMENTATION CHECKLIST

Copy this checklist and mark items as you complete them:

```
COLLECTIONS:
☐ Authors collection created
☐ Author test entry created
☐ All existing blog posts migrated to new author relation

COMPONENTS:
☐ tldrItem component created
☐ faqItem component created

BLOG POST FIELDS - CRITICAL:
☐ excerpt (Long text, required, max 160)
☐ tldr (Repeatable component, min 3, max 7)
☐ faq (Repeatable component)
☐ author (Relation to Authors, required)

BLOG POST FIELDS - HIGH PRIORITY:
☐ relatedPosts (Relation to Blog Posts)
☐ schemaType (Enumeration, required)
☐ primaryKeyword (Short text)

BLOG POST FIELDS - OPTIONAL:
☐ searchIntent (Enumeration)
☐ ctaVariant (Enumeration)
☐ robotsIndex (Boolean, default true)
☐ robotsFollow (Boolean, default true)
☐ ogImage (Media)
☐ videoUrl (Short text)
☐ videoTitle (Short text)
☐ videoDuration (Short text)

TESTING:
☐ Test blog post created with all fields
☐ API response verified
☐ Frontend rendering verified
☐ Test post deleted
☐ Production blog posts spot-checked

CLEANUP:
☐ Old Author text field removed
☐ Database backup created after migration
☐ Documentation updated
```

---

## 🚨 TROUBLESHOOTING

### Problem: Strapi won't restart after adding fields

**Solution**:
1. Check the Railway logs for errors
2. If there's a database schema error, restore from backup
3. Try adding fields one at a time instead of all at once
4. Ensure you're using Strapi 4.x compatible field types

### Problem: API returns 500 error

**Solution**:
1. Check Strapi server logs in Railway
2. Verify all required fields have values
3. Check that relations are properly configured
4. Clear Strapi cache: Settings → Global settings → Clear cache

### Problem: Migration taking too long

**Solution**:
1. Update blog posts in batches of 10-20
2. Save work frequently
3. Use Strapi's bulk actions if available

### Problem: Old author data lost

**Solution**:
1. Restore from the backup you created in Prerequisites
2. Follow migration steps more carefully
3. Don't delete old Author field until ALL posts are migrated

---

## 📞 NEED HELP?

If you encounter issues:
1. Check the Strapi documentation: https://docs.strapi.io/
2. Review the CMS Audit Report in `docs/cms-audit-report.md`
3. Check the implementation code in the frontend components
4. Contact the development team

---

## ✅ NEXT STEPS AFTER COMPLETION

Once all Strapi changes are complete:

1. **Update the API mappers** in `src/lib/api.ts` to handle new fields
2. **Test the frontend** thoroughly with real blog posts
3. **Update existing blog posts** gradually:
   - Add excerpts to all posts
   - Add TL;DR sections to popular posts
   - Add FAQ sections where relevant
   - Fill in author details
4. **Monitor performance**:
   - Check Google Search Console for improvements
   - Monitor IndexNow submissions
   - Track organic search traffic
5. **Iterate and improve**:
   - Analyze which posts perform best
   - Refine TL;DR and FAQ content
   - Update metadata based on search queries

---

**Document Version**: 1.0
**Last Updated**: 2026-01-26
**Maintained By**: Development Team
