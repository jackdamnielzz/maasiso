/**
 * Author Data Migration Script
 *
 * This script migrates existing blog posts from string-based author field
 * to the new Author relation.
 *
 * Prerequisites:
 * - Authors collection must exist in Strapi
 * - At least one author entry created (e.g., "Niels Maas")
 * - Valid Strapi API token with write permissions
 *
 * Usage:
 *   STRAPI_URL=https://your-strapi.com STRAPI_TOKEN=your-token node migrate-authors.js
 */

const https = require('https');

const STRAPI_URL = process.env.STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';
const API_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;

if (!API_TOKEN) {
  console.error('❌ Error: STRAPI_TOKEN environment variable is required');
  console.error('   Set it with: STRAPI_TOKEN=your-token node migrate-authors.js');
  process.exit(1);
}

// Helper function to make API requests
function makeRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, STRAPI_URL);

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Main migration function
async function migrateAuthors() {
  console.log('='.repeat(80));
  console.log('AUTHOR DATA MIGRATION');
  console.log('='.repeat(80));
  console.log(`\nStrapi URL: ${STRAPI_URL}`);
  console.log(`Token: ${API_TOKEN.substring(0, 10)}...${API_TOKEN.substring(API_TOKEN.length - 10)}\n`);

  try {
    // Step 1: Get all existing authors
    console.log('📋 Step 1: Fetching existing authors...');
    const authorsResponse = await makeRequest('/api/authors?pagination[limit]=100');
    const authors = authorsResponse.data || [];

    console.log(`   Found ${authors.length} author(s) in the database`);

    if (authors.length === 0) {
      console.log('\n⚠️  Warning: No authors found. Creating default author...');

      // Create Niels Maas author
      const newAuthor = await makeRequest('/api/authors', {
        method: 'POST',
        body: {
          data: {
            name: 'Niels Maas',
            slug: 'niels-maas',
            bio: 'Niels Maas is een ervaren ISO-consultant met meer dan 10 jaar ervaring in kwaliteitsmanagement en informatiebeveiliging.',
            credentials: 'Lead Auditor ISO 27001',
            expertise: ['ISO 9001', 'ISO 27001', 'ISO 14001', 'AVG', 'BIO']
          }
        }
      });

      authors.push(newAuthor.data);
      console.log(`   ✅ Created author: ${newAuthor.data.attributes.name} (ID: ${newAuthor.data.id})`);
    } else {
      console.log('\n   Existing authors:');
      authors.forEach(author => {
        console.log(`   - ${author.attributes.name} (ID: ${author.id})`);
      });
    }

    // Step 2: Get all blog posts
    console.log('\n📋 Step 2: Fetching blog posts...');
    let allPosts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await makeRequest(
        `/api/blog-posts?pagination[page]=${page}&pagination[pageSize]=100&populate=author`
      );

      const posts = response.data || [];
      allPosts = allPosts.concat(posts);

      const pagination = response.meta?.pagination;
      hasMore = pagination && pagination.page < pagination.pageCount;
      page++;
    }

    console.log(`   Found ${allPosts.length} blog post(s)`);

    // Step 3: Analyze current state
    console.log('\n📊 Step 3: Analyzing current state...');
    const needsMigration = [];
    const alreadyMigrated = [];
    const missingAuthor = [];

    for (const post of allPosts) {
      const hasOldAuthor = post.attributes.Author; // String field
      const hasNewAuthor = post.attributes.author?.data; // Relation field

      if (hasNewAuthor) {
        alreadyMigrated.push(post);
      } else if (hasOldAuthor) {
        needsMigration.push(post);
      } else {
        missingAuthor.push(post);
      }
    }

    console.log(`\n   Posts already migrated: ${alreadyMigrated.length}`);
    console.log(`   Posts needing migration: ${needsMigration.length}`);
    console.log(`   Posts missing author: ${missingAuthor.length}`);

    if (needsMigration.length === 0 && missingAuthor.length === 0) {
      console.log('\n✅ All posts are already migrated! Nothing to do.');
      return;
    }

    // Step 4: Determine which author to use
    const defaultAuthor = authors[0]; // Use first author as default
    console.log(`\n🎯 Step 4: Using default author: ${defaultAuthor.attributes.name} (ID: ${defaultAuthor.id})`);

    // Step 5: Migrate posts
    console.log('\n🔄 Step 5: Migrating blog posts...');
    let migrated = 0;
    let failed = 0;

    for (const post of [...needsMigration, ...missingAuthor]) {
      try {
        console.log(`   Updating: "${post.attributes.title}" (ID: ${post.id})...`);

        await makeRequest(`/api/blog-posts/${post.id}`, {
          method: 'PUT',
          body: {
            data: {
              author: defaultAuthor.id
            }
          }
        });

        migrated++;
        console.log(`   ✅ Success`);
      } catch (error) {
        failed++;
        console.error(`   ❌ Failed: ${error.message}`);
      }
    }

    // Step 6: Summary
    console.log('\n' + '='.repeat(80));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal posts: ${allPosts.length}`);
    console.log(`Already migrated: ${alreadyMigrated.length}`);
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Failed: ${failed}`);
    console.log(`\n✅ Migration complete!`);

    if (failed > 0) {
      console.log(`\n⚠️  Warning: ${failed} post(s) failed to migrate. Please review errors above.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run migration
console.log('Starting migration...\n');
migrateAuthors();
