/**
 * ==============================================================================
 * COMPREHENSIVE CONTENT MIGRATION SCRIPT
 * ==============================================================================
 * 
 * This script migrates content from an old VPS Strapi instance to a new Railway 
 * Strapi instance. It handles two types of migration:
 * 
 * 1. PAGES MIGRATION (via REST API):
 *    - Fetches pages from OLD Strapi with DEEP population
 *    - Creates/updates pages on NEW Railway Strapi
 *    - Priority pages: diensten, avg, bio, iso-27001, iso-14001, iso-16175, blog
 * 
 * 2. BLOG CONTENT MIGRATION (from backup JSON):
 *    - Reads from backups/strapi-content-export-combined.json
 *    - First creates categories and tags
 *    - Then creates blog posts with proper relationships
 *    - Generates document_id for Strapi v5 compatibility
 * 
 * ==============================================================================
 * USAGE:
 * ==============================================================================
 * 
 *   # Migrate all content (pages + blog)
 *   node scripts/migrate-all-content.js --all
 * 
 *   # Migrate only pages
 *   node scripts/migrate-all-content.js --pages-only
 * 
 *   # Migrate only blog content
 *   node scripts/migrate-all-content.js --blog-only
 * 
 *   # Dry run (no actual changes)
 *   node scripts/migrate-all-content.js --all --dry-run
 * 
 *   # With custom environment variables
 *   OLD_STRAPI_URL=http://... OLD_STRAPI_TOKEN=... NEW_STRAPI_TOKEN=... \
 *   node scripts/migrate-all-content.js --all
 * 
 * ==============================================================================
 * ENVIRONMENT VARIABLES:
 * ==============================================================================
 * 
 *   OLD_STRAPI_URL    - URL of old VPS Strapi (default: http://153.92.223.23:1337)
 *   OLD_STRAPI_TOKEN  - API token for old Strapi (default: provided token)
 *   NEW_STRAPI_URL    - URL of new Railway Strapi (default: peaceful-insight-production.up.railway.app)
 *   NEW_STRAPI_TOKEN  - API token for new Strapi (required, or use STRAPI_TOKEN)
 * 
 * ==============================================================================
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env.local
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// ==============================================================================
// CONFIGURATION
// ==============================================================================

const OLD_STRAPI_URL = process.env.OLD_STRAPI_URL || 'http://153.92.223.23:1337';
const OLD_STRAPI_TOKEN = process.env.OLD_STRAPI_TOKEN || '5d4ea1f55c137c8d1ed26de4ca6275ff7dd6af56811c507e3c176ded9d6dfd6b36d9407b3fa82b0a982969929003bcbfc54da08ac1b79bdced8b5278ad02a405d0138f5295bf06c9bcee59f5f456c9dea3960d8a43c1be91097a984ae66d208d13676edd3ffa49b7dda3750aad3b68f711bf982d3321191649f6992a41079e51';
const NEW_STRAPI_URL = process.env.NEW_STRAPI_URL || process.env.STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';
const NEW_STRAPI_TOKEN = process.env.NEW_STRAPI_TOKEN || process.env.STRAPI_TOKEN;

// Backup file path
const BACKUP_FILE_PATH = path.join(__dirname, '..', 'backups', 'strapi-content-export-combined.json');

// Page slugs to migrate (in priority order)
const PAGE_SLUGS_PRIORITY_1 = ['diensten', 'avg', 'bio', 'iso-27001'];
const PAGE_SLUGS_PRIORITY_2 = ['iso-14001', 'iso-16175', 'blog'];
const ALL_PAGE_SLUGS = [...PAGE_SLUGS_PRIORITY_1, ...PAGE_SLUGS_PRIORITY_2];

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PAGES_ONLY = args.includes('--pages-only');
const BLOG_ONLY = args.includes('--blog-only');
const MIGRATE_ALL = args.includes('--all');

// Statistics tracking
const stats = {
  pages: { fetched: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
  categories: { created: 0, skipped: 0, errors: 0 },
  tags: { created: 0, skipped: 0, errors: 0 },
  blogPosts: { created: 0, skipped: 0, errors: 0 },
  whitepapers: { created: 0, skipped: 0, errors: 0 }
};

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

/**
 * Build authorization headers for Strapi API
 */
function buildHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generate a Strapi v5 compatible document_id
 */
function generateDocumentId() {
  return crypto.randomBytes(16).toString('hex').substring(0, 24);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log with timestamp and category
 */
function log(category, message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = DRY_RUN ? '[DRY-RUN] ' : '';
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    skip: '⏭️'
  };
  console.log(`${prefix}[${timestamp}] ${icons[type] || ''} [${category}] ${message}`);
}

// ==============================================================================
// PAGES MIGRATION (REST API)
// ==============================================================================

/**
 * Build indexed populate parameters for deep page population
 * This follows the pattern from src/lib/api.ts lines 434-446
 */
function buildPagePopulateParams() {
  // Note: seoMetadata removed as it doesn't exist in old Strapi
  return [
    'populate[0]=layout',
    'populate[1]=layout.features',
    'populate[2]=layout.features.icon',
    'populate[3]=layout.backgroundImage',
    'populate[4]=layout.ctaButton',
    'populate[5]=layout.images',
  ].join('&');
}

/**
 * Fetch a page from the OLD Strapi instance with deep population
 */
async function fetchOldPage(slug) {
  const populateParams = buildPagePopulateParams();
  const url = `${OLD_STRAPI_URL.replace(/\/$/, '')}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&${populateParams}`;

  log('PAGES', `Fetching from OLD Strapi: ${url}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(OLD_STRAPI_TOKEN),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    
    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      log('PAGES', `No page found for slug "${slug}"`, 'warning');
      return null;
    }

    const item = json.data[0];
    stats.pages.fetched++;
    log('PAGES', `Found page "${slug}" (id=${item.id})`, 'success');
    
    // Log layout information for debugging
    const layoutData = item.attributes?.layout || item.layout;
    if (Array.isArray(layoutData)) {
      log('PAGES', `  └─ Layout has ${layoutData.length} components`);
    }
    
    return item;
  } catch (error) {
    log('PAGES', `Error fetching page "${slug}": ${error.message}`, 'error');
    stats.pages.errors++;
    return null;
  }
}

/**
 * Check if a page exists in the NEW Strapi instance
 */
async function fetchNewPage(slug) {
  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    
    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      return null;
    }

    const page = json.data[0];
    // Strapi v5 uses documentId for updates
    // It can be in documentId, document_id, or attributes.documentId
    page.documentId = page.documentId || page.document_id || page.attributes?.documentId || page.attributes?.document_id;
    
    return page;
  } catch (error) {
    log('PAGES', `Error checking existing page "${slug}": ${error.message}`, 'warning');
    return null;
  }
}

/**
 * Clean page attributes for migration
 * Removes fields that should be auto-generated by Strapi
 */
/**
 * Recursively remove all 'id' fields from an object
 */
function removeAllIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => removeAllIds(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id') continue; // Skip id fields
      cleaned[key] = removeAllIds(value);
    }
    return cleaned;
  }
  return obj;
}

function cleanPageAttributes(oldPage) {
  // Handle both flat and nested attribute structures
  const attrs = oldPage.attributes || oldPage || {};
  
  // Create a deep clone
  let data = JSON.parse(JSON.stringify(attrs));
  
  // Ensure slug is preserved before cleaning
  const slug = data.slug || oldPage?.attributes?.slug || oldPage?.slug || '';
  
  // Remove auto-generated fields at root level
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.publishedAt;
  delete data.documentId;
  delete data.document_id;
  delete data.localizations;
  
  // Recursively remove all id fields from the entire structure
  data = removeAllIds(data);
  
  // Restore slug
  data.slug = slug;
  
  // Ensure layout is an array
  if (!Array.isArray(data.layout)) {
    data.layout = data.layout || [];
  }
  
  return data;
}

/**
 * Create or update a page in the NEW Strapi instance
 */
async function upsertNewPage(slug, oldPage) {
  if (DRY_RUN) {
    log('PAGES', `Would create/update page "${slug}"`, 'skip');
    return { dryRun: true, slug };
  }

  const existingPage = await fetchNewPage(slug);
  const data = cleanPageAttributes(oldPage);

  if (existingPage) {
    // Update existing page - Strapi v5 uses documentId in the URL
    const documentId = existingPage.documentId;
    const numericId = existingPage.id;
    
    // Try documentId first (Strapi v5), fall back to numeric id (Strapi v4)
    const identifier = documentId || numericId;
    const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/pages/${identifier}`;

    log('PAGES', `Updating existing page "${slug}" (documentId=${documentId}, id=${numericId})`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const text = await res.text();
      // If documentId didn't work, try numeric id
      if (documentId && res.status === 404) {
        log('PAGES', `DocumentId failed, trying numeric id...`);
        const fallbackUrl = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/pages/${numericId}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'PUT',
          headers: buildHeaders(NEW_STRAPI_TOKEN),
          body: JSON.stringify({ data }),
        });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          stats.pages.updated++;
          log('PAGES', `Updated page "${slug}" (id=${json.data?.id})`, 'success');
          return json;
        }
      }
      throw new Error(`Failed to update page "${slug}": ${res.status} - ${text}`);
    }

    const json = await res.json();
    stats.pages.updated++;
    log('PAGES', `Updated page "${slug}" (id=${json.data?.id})`, 'success');
    return json;
  } else {
    // Create new page
    const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/pages`;

    log('PAGES', `Creating new page "${slug}"`);

    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to create page "${slug}": ${res.status} - ${text}`);
    }

    const json = await res.json();
    stats.pages.created++;
    log('PAGES', `Created page "${slug}" (id=${json.data?.id})`, 'success');
    return json;
  }
}

/**
 * Migrate a single page by slug
 */
async function migratePage(slug) {
  log('PAGES', `\n${'─'.repeat(60)}`);
  log('PAGES', `Migrating page: "${slug}"`);
  log('PAGES', `${'─'.repeat(60)}`);

  try {
    const oldPage = await fetchOldPage(slug);
    
    if (!oldPage) {
      stats.pages.skipped++;
      return { slug, status: 'skipped', reason: 'not-found-in-old' };
    }

    const result = await upsertNewPage(slug, oldPage);
    
    return {
      slug,
      status: DRY_RUN ? 'dry-run' : 'migrated',
      id: result?.data?.id,
    };
  } catch (error) {
    stats.pages.errors++;
    log('PAGES', `Error migrating "${slug}": ${error.message}`, 'error');
    return { slug, status: 'error', error: error.message };
  }
}

/**
 * Migrate all pages
 */
async function migrateAllPages() {
  log('PAGES', '\n' + '═'.repeat(60));
  log('PAGES', ' PAGES MIGRATION (REST API)');
  log('PAGES', '═'.repeat(60) + '\n');

  const results = [];

  // Migrate priority 1 pages first
  log('PAGES', '▸ Priority 1 Pages: ' + PAGE_SLUGS_PRIORITY_1.join(', '));
  for (const slug of PAGE_SLUGS_PRIORITY_1) {
    const result = await migratePage(slug);
    results.push(result);
    await sleep(500); // Rate limiting
  }

  // Then priority 2 pages
  log('PAGES', '\n▸ Priority 2 Pages: ' + PAGE_SLUGS_PRIORITY_2.join(', '));
  for (const slug of PAGE_SLUGS_PRIORITY_2) {
    const result = await migratePage(slug);
    results.push(result);
    await sleep(500); // Rate limiting
  }

  return results;
}

// ==============================================================================
// BLOG CONTENT MIGRATION (from Backup JSON)
// ==============================================================================

/**
 * Read and parse the backup JSON file
 */
function readBackupFile() {
  if (!fs.existsSync(BACKUP_FILE_PATH)) {
    throw new Error(`Backup file not found: ${BACKUP_FILE_PATH}`);
  }

  let content = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
  
  // Handle the "Output format is unaligned." prefix
  if (content.startsWith('Output format is unaligned.')) {
    content = content.replace('Output format is unaligned.\n', '');
  }
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse backup file: ${error.message}`);
  }
}

/**
 * Extract unique categories from blog posts
 */
function extractCategories(blogPosts) {
  const categoryMap = new Map();
  
  // The backup file doesn't have separate categories, but we can extract
  // from content or create default ones based on blog topics
  const defaultCategories = [
    { name: 'ISO 9001', slug: 'iso-9001', description: 'Artikelen over ISO 9001 kwaliteitsmanagement' },
    { name: 'ISO 27001', slug: 'iso-27001', description: 'Artikelen over ISO 27001 informatiebeveiliging' },
    { name: 'ISO 14001', slug: 'iso-14001', description: 'Artikelen over ISO 14001 milieumanagement' },
    { name: 'AVG/GDPR', slug: 'avg-gdpr', description: 'Artikelen over AVG en GDPR compliance' },
    { name: 'Algemeen', slug: 'algemeen', description: 'Algemene artikelen over certificering en compliance' },
  ];
  
  defaultCategories.forEach(cat => {
    categoryMap.set(cat.slug, cat);
  });
  
  return Array.from(categoryMap.values());
}

/**
 * Extract unique tags from blog posts
 */
function extractTags(blogPosts) {
  const tagSet = new Set();
  
  // Extract tags from seo_keywords in blog posts
  blogPosts.forEach(post => {
    if (post.seo_keywords) {
      const keywords = post.seo_keywords.split(',').map(k => k.trim()).filter(k => k);
      keywords.forEach(keyword => tagSet.add(keyword));
    }
  });
  
  return Array.from(tagSet).map(name => ({ name }));
}

/**
 * Check if a category exists in NEW Strapi
 */
async function findCategory(slug) {
  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/categories?filters[slug][$eq]=${encodeURIComponent(slug)}`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return json.data[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a category in NEW Strapi
 */
async function createCategory(category) {
  if (DRY_RUN) {
    log('CATEGORIES', `Would create category: "${category.name}"`, 'skip');
    return { dryRun: true, name: category.name };
  }

  // Check if already exists
  const existing = await findCategory(category.slug);
  if (existing) {
    log('CATEGORIES', `Category "${category.name}" already exists (id=${existing.id})`, 'skip');
    stats.categories.skipped++;
    return existing;
  }

  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/categories`;
  
  const data = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    stats.categories.created++;
    log('CATEGORIES', `Created category "${category.name}" (id=${json.data?.id})`, 'success');
    return json.data;
  } catch (error) {
    stats.categories.errors++;
    log('CATEGORIES', `Error creating category "${category.name}": ${error.message}`, 'error');
    return null;
  }
}

/**
 * Check if a tag exists in NEW Strapi
 */
async function findTag(name) {
  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/tags?filters[name][$eq]=${encodeURIComponent(name)}`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return json.data[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a tag in NEW Strapi
 */
/**
 * Generate a slug from a string
 */
function generateSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .substring(0, 100);        // Limit length
}

async function createTag(tag) {
  if (DRY_RUN) {
    log('TAGS', `Would create tag: "${tag.name}"`, 'skip');
    return { dryRun: true, name: tag.name };
  }

  // Check if already exists
  const existing = await findTag(tag.name);
  if (existing) {
    log('TAGS', `Tag "${tag.name}" already exists (id=${existing.id})`, 'skip');
    stats.tags.skipped++;
    return existing;
  }

  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/tags`;
  
  // Generate slug from name
  const slug = generateSlug(tag.name);
  
  const data = {
    name: tag.name,
    slug: slug,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    stats.tags.created++;
    log('TAGS', `Created tag "${tag.name}" (id=${json.data?.id})`, 'success');
    return json.data;
  } catch (error) {
    stats.tags.errors++;
    log('TAGS', `Error creating tag "${tag.name}": ${error.message}`, 'error');
    return null;
  }
}

/**
 * Check if a blog post exists in NEW Strapi (by slug)
 */
async function findBlogPost(slug) {
  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return json.data[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a blog post in NEW Strapi
 */
async function createBlogPost(post, tagMap) {
  if (DRY_RUN) {
    log('BLOG', `Would create blog post: "${post.title}"`, 'skip');
    return { dryRun: true, title: post.title };
  }

  // Check if already exists
  const existing = await findBlogPost(post.slug);
  if (existing) {
    log('BLOG', `Blog post "${post.title}" already exists (id=${existing.id})`, 'skip');
    stats.blogPosts.skipped++;
    return existing;
  }

  const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/blog-posts`;
  
  // Build tag connections from keywords
  let tagConnections = [];
  if (post.seo_keywords && tagMap) {
    const keywords = post.seo_keywords.split(',').map(k => k.trim()).filter(k => k);
    tagConnections = keywords
      .map(keyword => tagMap.get(keyword))
      .filter(id => id)
      .map(id => ({ id }));
  }

  // Map old field names to new ones
  const data = {
    title: post.title,
    slug: post.slug,
    Content: post.content, // Note: Capital C for Strapi field
    content: post.content, // Also try lowercase
    Author: post.author || 'MaasISO Team',
    author: post.author || 'MaasISO Team',
    summary: post.seo_description || '',
    seoTitle: post.seo_title || post.title,
    seoDescription: post.seo_description || '',
    seoKeywords: post.seo_keywords || '',
    publishedAt: post.published_at || post.publication_date || new Date().toISOString(),
  };

  // Add tags if we have any
  if (tagConnections.length > 0) {
    data.tags = tagConnections;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    stats.blogPosts.created++;
    log('BLOG', `Created blog post "${post.title}" (id=${json.data?.id})`, 'success');
    return json.data;
  } catch (error) {
    stats.blogPosts.errors++;
    log('BLOG', `Error creating blog post "${post.title}": ${error.message}`, 'error');
    return null;
  }
}

/**
 * Migrate all blog content from backup
 */
async function migrateBlogContent() {
  log('BLOG', '\n' + '═'.repeat(60));
  log('BLOG', ' BLOG CONTENT MIGRATION (from Backup JSON)');
  log('BLOG', '═'.repeat(60) + '\n');

  // Read backup file
  let backupData;
  try {
    backupData = readBackupFile();
    log('BLOG', `Loaded backup file: ${BACKUP_FILE_PATH}`, 'success');
  } catch (error) {
    log('BLOG', `Failed to read backup file: ${error.message}`, 'error');
    return;
  }

  const blogPosts = backupData.blog_posts || [];
  log('BLOG', `Found ${blogPosts.length} blog posts in backup`);

  // Step 1: Create categories
  log('BLOG', '\n▸ Step 1: Creating categories...');
  const categories = extractCategories(blogPosts);
  const categoryMap = new Map();
  
  for (const category of categories) {
    const created = await createCategory(category);
    if (created && created.id) {
      categoryMap.set(category.slug, created.id);
    }
    await sleep(200);
  }

  // Step 2: Create tags
  log('BLOG', '\n▸ Step 2: Creating tags...');
  const tags = extractTags(blogPosts);
  const tagMap = new Map();
  
  log('BLOG', `Found ${tags.length} unique tags to create`);
  
  // Only create first 50 tags to avoid overwhelming the API
  const tagsToCreate = tags.slice(0, 50);
  
  for (const tag of tagsToCreate) {
    const created = await createTag(tag);
    if (created && created.id) {
      tagMap.set(tag.name, created.id);
    }
    await sleep(100);
  }

  // Step 3: Create blog posts
  log('BLOG', '\n▸ Step 3: Creating blog posts...');
  
  for (const post of blogPosts) {
    await createBlogPost(post, tagMap);
    await sleep(300);
  }

  // Step 4: Handle whitepapers if present
  if (backupData.whitepapers && backupData.whitepapers.length > 0) {
    log('BLOG', '\n▸ Step 4: Whitepapers found but not migrated (manual review recommended)');
    log('BLOG', `Found ${backupData.whitepapers.length} whitepapers in backup`);
  }
}

// ==============================================================================
// VERIFICATION
// ==============================================================================

/**
 * Verify migration results in NEW Strapi
 */
async function verifyMigration() {
  log('VERIFY', '\n' + '═'.repeat(60));
  log('VERIFY', ' VERIFICATION');
  log('VERIFY', '═'.repeat(60) + '\n');

  // Verify pages
  log('VERIFY', '▸ Checking pages...');
  for (const slug of ALL_PAGE_SLUGS) {
    const page = await fetchNewPage(slug);
    if (page) {
      const layoutCount = page.attributes?.layout?.length || page.layout?.length || 0;
      log('VERIFY', `  ✓ Page "${slug}" exists (id=${page.id}, layout=${layoutCount} components)`, 'success');
    } else {
      log('VERIFY', `  ✗ Page "${slug}" NOT FOUND`, 'error');
    }
    await sleep(200);
  }

  // Count blog posts
  log('VERIFY', '\n▸ Checking blog posts...');
  try {
    const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/blog-posts?pagination[pageSize]=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });
    
    if (res.ok) {
      const json = await res.json();
      const total = json.meta?.pagination?.total || 0;
      log('VERIFY', `  Total blog posts in NEW Strapi: ${total}`, 'success');
    }
  } catch (error) {
    log('VERIFY', `  Error counting blog posts: ${error.message}`, 'error');
  }

  // Count categories
  log('VERIFY', '\n▸ Checking categories...');
  try {
    const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/categories?pagination[pageSize]=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });
    
    if (res.ok) {
      const json = await res.json();
      const total = json.meta?.pagination?.total || 0;
      log('VERIFY', `  Total categories in NEW Strapi: ${total}`, 'success');
    }
  } catch (error) {
    log('VERIFY', `  Error counting categories: ${error.message}`, 'error');
  }

  // Count tags
  log('VERIFY', '\n▸ Checking tags...');
  try {
    const url = `${NEW_STRAPI_URL.replace(/\/$/, '')}/api/tags?pagination[pageSize]=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(NEW_STRAPI_TOKEN),
    });
    
    if (res.ok) {
      const json = await res.json();
      const total = json.meta?.pagination?.total || 0;
      log('VERIFY', `  Total tags in NEW Strapi: ${total}`, 'success');
    }
  } catch (error) {
    log('VERIFY', `  Error counting tags: ${error.message}`, 'error');
  }
}

// ==============================================================================
// MAIN ENTRY POINT
// ==============================================================================

async function main() {
  console.log('\n');
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(15) + 'COMPREHENSIVE CONTENT MIGRATION SCRIPT' + ' '.repeat(16) + '║');
  console.log('║' + ' '.repeat(20) + 'OLD VPS → NEW RAILWAY STRAPI' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(70) + '╝');
  console.log('\n');

  // Show configuration
  log('CONFIG', 'Configuration:');
  log('CONFIG', `  OLD_STRAPI_URL:   ${OLD_STRAPI_URL}`);
  log('CONFIG', `  OLD_STRAPI_TOKEN: ${OLD_STRAPI_TOKEN ? '[SET - ' + OLD_STRAPI_TOKEN.substring(0, 20) + '...]' : '[NOT SET]'}`);
  log('CONFIG', `  NEW_STRAPI_URL:   ${NEW_STRAPI_URL}`);
  log('CONFIG', `  NEW_STRAPI_TOKEN: ${NEW_STRAPI_TOKEN ? '[SET]' : '[NOT SET]'}`);
  log('CONFIG', `  BACKUP_FILE:      ${BACKUP_FILE_PATH}`);
  log('CONFIG', `  DRY_RUN:          ${DRY_RUN}`);
  log('CONFIG', `  MODE:             ${PAGES_ONLY ? 'pages-only' : BLOG_ONLY ? 'blog-only' : MIGRATE_ALL ? 'all' : 'none specified'}`);

  // Validate configuration
  if (!NEW_STRAPI_TOKEN) {
    log('CONFIG', '\n⚠️  WARNING: NEW_STRAPI_TOKEN is not set!', 'warning');
    log('CONFIG', '   Please set NEW_STRAPI_TOKEN or STRAPI_TOKEN environment variable.', 'warning');
    if (!DRY_RUN) {
      log('CONFIG', '   Aborting migration. Use --dry-run to preview without token.', 'error');
      process.exit(1);
    }
  }

  // Check mode
  if (!PAGES_ONLY && !BLOG_ONLY && !MIGRATE_ALL) {
    console.log('\n');
    console.log('Usage: node scripts/migrate-all-content.js [options]');
    console.log('\nOptions:');
    console.log('  --all         Migrate all content (pages + blog)');
    console.log('  --pages-only  Migrate only pages via REST API');
    console.log('  --blog-only   Migrate only blog content from backup JSON');
    console.log('  --dry-run     Preview migration without making changes');
    console.log('\nExamples:');
    console.log('  node scripts/migrate-all-content.js --all');
    console.log('  node scripts/migrate-all-content.js --pages-only --dry-run');
    console.log('  NEW_STRAPI_TOKEN=xxx node scripts/migrate-all-content.js --blog-only');
    console.log('\n');
    process.exit(0);
  }

  // Execute migration
  try {
    if (PAGES_ONLY || MIGRATE_ALL) {
      await migrateAllPages();
    }

    if (BLOG_ONLY || MIGRATE_ALL) {
      await migrateBlogContent();
    }

    // Verification step
    if (!DRY_RUN) {
      await verifyMigration();
    }

    // Print summary
    console.log('\n');
    console.log('╔' + '═'.repeat(70) + '╗');
    console.log('║' + ' '.repeat(25) + 'MIGRATION SUMMARY' + ' '.repeat(28) + '║');
    console.log('╚' + '═'.repeat(70) + '╝');
    console.log('\n');

    console.log('Pages:');
    console.log(`  • Fetched:  ${stats.pages.fetched}`);
    console.log(`  • Created:  ${stats.pages.created}`);
    console.log(`  • Updated:  ${stats.pages.updated}`);
    console.log(`  • Skipped:  ${stats.pages.skipped}`);
    console.log(`  • Errors:   ${stats.pages.errors}`);

    console.log('\nCategories:');
    console.log(`  • Created:  ${stats.categories.created}`);
    console.log(`  • Skipped:  ${stats.categories.skipped}`);
    console.log(`  • Errors:   ${stats.categories.errors}`);

    console.log('\nTags:');
    console.log(`  • Created:  ${stats.tags.created}`);
    console.log(`  • Skipped:  ${stats.tags.skipped}`);
    console.log(`  • Errors:   ${stats.tags.errors}`);

    console.log('\nBlog Posts:');
    console.log(`  • Created:  ${stats.blogPosts.created}`);
    console.log(`  • Skipped:  ${stats.blogPosts.skipped}`);
    console.log(`  • Errors:   ${stats.blogPosts.errors}`);

    if (DRY_RUN) {
      console.log('\n' + '─'.repeat(72));
      console.log('⚠️  DRY RUN MODE - No actual changes were made');
      console.log('   Remove --dry-run flag to execute the migration');
      console.log('─'.repeat(72));
    }

    console.log('\n✅ Migration script completed!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch((err) => {
  console.error('[FATAL] Unexpected error:', err);
  process.exit(1);
});