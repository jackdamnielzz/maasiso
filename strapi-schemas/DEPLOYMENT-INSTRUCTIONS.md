# STRAPI SCHEMA DEPLOYMENT INSTRUCTIONS

## 📋 Overview

This folder contains complete Strapi schema definitions for the SEO/GEO enhancement. These schema files can be deployed to your Strapi instance programmatically.

## 🗂️ Files Structure

```
strapi-schemas/
├── api/
│   ├── author/
│   │   └── content-types/
│   │       └── author/
│   │           └── schema.json
│   └── blog-post/
│       └── content-types/
│           └── blog-post/
│               └── schema.json
├── components/
│   └── blog/
│       ├── tldr-item.json
│       └── faq-item.json
└── DEPLOYMENT-INSTRUCTIONS.md (this file)
```

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Git Deployment (Recommended for Railway)

**For Railway/Heroku/similar platforms:**

1. **Locate your Strapi repository** (the backend, not this frontend)

2. **Copy schema files** to your Strapi project:
   ```bash
   # From this frontend project
   cd "D:\Programmeren\MaasISO\New without errors\maasiso - Copy"

   # Copy to your Strapi backend project (adjust path)
   cp -r strapi-schemas/api/* <STRAPI_PROJECT_PATH>/src/api/
   cp -r strapi-schemas/components/* <STRAPI_PROJECT_PATH>/src/components/
   ```

3. **Commit and push** to your Strapi repository:
   ```bash
   cd <STRAPI_PROJECT_PATH>
   git add src/api/ src/components/
   git commit -m "feat: add SEO/GEO enhanced schemas for blog posts"
   git push origin main
   ```

4. **Railway will auto-deploy** and Strapi will automatically:
   - Create the database tables
   - Set up relations
   - Apply all field configurations

5. **Verify deployment**:
   - Check Railway logs for successful deployment
   - Log into Strapi Admin
   - Navigate to Content-Type Builder
   - Verify "Authors" collection exists
   - Verify "Blog Post" has all new fields
   - Verify components exist under "blog" category

### Option 2: Manual File Upload (if no Git access)

1. **Access your Strapi server** (via SSH, SFTP, or file manager)

2. **Navigate to your Strapi installation directory**

3. **Copy files** maintaining the directory structure:
   ```
   YOUR_STRAPI_PROJECT/
   ├── src/
   │   ├── api/
   │   │   ├── author/
   │   │   │   └── content-types/
   │   │   │       └── author/
   │   │   │           └── schema.json  ← Copy here
   │   │   └── blog-post/
   │   │       └── content-types/
   │   │           └── blog-post/
   │   │               └── schema.json  ← Update this
   │   └── components/
   │       └── blog/
   │           ├── tldr-item.json  ← Copy here
   │           └── faq-item.json   ← Copy here
   ```

4. **Restart Strapi**:
   ```bash
   # If using PM2
   pm2 restart strapi

   # If using Railway
   # Just redeploy from the Railway dashboard

   # If running locally
   npm run develop
   ```

### Option 3: Strapi CLI (Advanced)

**Requirements:**
- Strapi CLI installed globally
- Access to Strapi project directory

```bash
# Navigate to Strapi project
cd <STRAPI_PROJECT_PATH>

# Generate Author collection (then manually copy our schema.json)
npx strapi generate:api author

# Generate components (then manually copy our JSON files)
npx strapi generate:component blog tldrItem
npx strapi generate:component blog faqItem

# Copy our pre-made schema files to overwrite the generated ones
# Then rebuild admin
npm run build
```

## ⚠️ IMPORTANT NOTES

### Before Deployment

1. **BACKUP YOUR DATABASE!**
   - Railway: Use the database backup feature
   - Postgres: `pg_dump`
   - MySQL: `mysqldump`

2. **Review the schema.json files** - make sure field names match your existing data

3. **Plan for downtime** - Strapi will restart during schema updates

### After Deployment

1. **Check Strapi Admin Panel**:
   - Verify all content types appear
   - Check all fields are present
   - Test creating a new author
   - Test creating a new blog post with all fields

2. **Test API Endpoint**:
   ```bash
   curl "https://peaceful-insight-production.up.railway.app/api/blog-posts?populate=*&pagination[limit]=1"
   ```

   Verify response includes new fields:
   - `excerpt`
   - `tldr` (array of components)
   - `faq` (array of components)
   - `author` (relation object, not string)
   - All other new fields

3. **Migrate Existing Data** (see next section)

## 🔄 DATA MIGRATION

### Migrating Author Field (String → Relation)

**CRITICAL**: The blog-post schema.json uses `author` as a relation. If you have existing blog posts with a string `Author` field:

#### Option A: Rename old field first (Recommended)

1. **Before deploying new schema**:
   - In Strapi Admin, rename `Author` field to `oldAuthor`
   - Save and wait for restart

2. **Deploy new schema** (with `author` relation field)

3. **Create migration script**:

```javascript
// scripts/migrate-authors.js
const strapiUrl = 'https://peaceful-insight-production.up.railway.app';
const apiToken = 'YOUR_API_TOKEN';

async function migrateAuthors() {
  // 1. Get all blog posts
  const posts = await fetch(`${strapiUrl}/api/blog-posts?pagination[limit]=100`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  }).then(r => r.json());

  // 2. Get or create "Niels Maas" author
  const authors = await fetch(`${strapiUrl}/api/authors`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  }).then(r => r.json());

  let nielsAuthor = authors.data.find(a => a.attributes.name === 'Niels Maas');

  if (!nielsAuthor) {
    // Create author
    const created = await fetch(`${strapiUrl}/api/authors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: 'Niels Maas',
          slug: 'niels-maas',
          bio: 'Expert in ISO certifications and information security',
          credentials: 'Lead Auditor ISO 27001'
        }
      })
    }).then(r => r.json());
    nielsAuthor = created.data;
  }

  // 3. Update all posts to link to author
  for (const post of posts.data) {
    await fetch(`${strapiUrl}/api/blog-posts/${post.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          author: nielsAuthor.id
        }
      })
    });
    console.log(`Updated post ${post.id}`);
  }

  console.log('Migration complete!');
}

migrateAuthors().catch(console.error);
```

Run with: `node scripts/migrate-authors.js`

#### Option B: Manual migration via Strapi Admin

1. Create author entry in Authors collection
2. Edit each blog post
3. Select author from dropdown
4. Save and publish

## 🧪 VERIFICATION CHECKLIST

After deployment, verify:

```
☐ Authors collection exists
☐ Can create new author with all fields
☐ Components exist: blog.tldr-item, blog.faq-item
☐ Blog Post has all new fields:
  ☐ excerpt (text, required, max 160)
  ☐ author (relation to Authors)
  ☐ tldr (repeatable component, min 3, max 7)
  ☐ faq (repeatable component)
  ☐ relatedPosts (relation to blog posts)
  ☐ schemaType (enum: Article/HowTo/FAQPage)
  ☐ primaryKeyword (string)
  ☐ searchIntent (enum)
  ☐ ctaVariant (enum)
  ☐ robotsIndex (boolean, default true)
  ☐ robotsFollow (boolean, default true)
  ☐ ogImage (media)
  ☐ videoUrl, videoTitle, videoDuration (strings)
☐ Can create test blog post with all fields
☐ API returns all fields when populated
☐ Frontend displays new components correctly
```

## 🆘 TROUBLESHOOTING

### Schema not applying

**Symptom**: Fields don't appear after deployment

**Solutions**:
1. Check file paths are exactly correct
2. Ensure JSON files are valid (use JSONLint)
3. Check Strapi logs for schema errors
4. Try `npm run strapi build --clean`
5. Restart Strapi completely

### Database conflicts

**Symptom**: Strapi won't start, database errors in logs

**Solutions**:
1. Check if column names conflict with existing data
2. Review migration logs
3. May need to manually alter database schema
4. Restore from backup if needed

### Relation errors

**Symptom**: Can't create relations, foreign key errors

**Solutions**:
1. Ensure target content types exist first
2. Check relation type matches on both sides
3. Clear database cache
4. Check `inversedBy` and `mappedBy` are correct

### Component not found

**Symptom**: "Component not found" errors

**Solutions**:
1. Ensure components are in `src/components/blog/` directory
2. Check component names match exactly (case-sensitive)
3. Rebuild admin: `npm run build`
4. Check `collectionName` is unique

## 📊 DEPLOYMENT TIMELINE

**Estimated deployment time:**
- File copy/upload: 5 minutes
- Git commit/push: 2 minutes
- Railway auto-deploy: 3-5 minutes
- Database migration: 5-10 minutes
- Verification: 10 minutes

**Total: 25-30 minutes**

## ✅ SUCCESS CRITERIA

Deployment is successful when:

1. ✅ Strapi starts without errors
2. ✅ Content-Type Builder shows all changes
3. ✅ Can create test author with all fields
4. ✅ Can create test blog post with all new fields
5. ✅ API returns populated data correctly
6. ✅ Frontend renders all new components
7. ✅ No errors in browser console
8. ✅ Schema validation passes

---

**Questions?** Check the main implementation guide in `docs/STRAPI-IMPLEMENTATION-GUIDE.md`

**Issues?** Review Railway logs and Strapi server logs for detailed error messages
