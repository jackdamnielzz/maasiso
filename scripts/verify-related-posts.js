/**
 * Verify Related Posts Script
 * 
 * This script checks all blog posts for invalid relatedPosts references.
 * It fetches all blog posts with their relatedPosts populated and verifies
 * that each referenced documentId actually exists.
 * 
 * Usage:
 *   node scripts/verify-related-posts.js
 * 
 * Environment Variables (from .env.production):
 *   - NEXT_PUBLIC_BACKEND_URL or STRAPI_URL: Strapi base URL
 *   - NEXT_PUBLIC_STRAPI_TOKEN or STRAPI_TOKEN: API token for authentication
 * 
 * Output:
 *   - Lists all posts with invalid relatedPosts references
 *   - Shows the post title/slug and the missing documentId(s)
 *   - Summary of total posts checked and issues found
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.production' });

// Get Strapi URL and token from environment
const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ Error: No Strapi API token found in environment variables');
  console.error('   Please set NEXT_PUBLIC_STRAPI_TOKEN or STRAPI_TOKEN in .env.production');
  process.exit(1);
}

/**
 * Fetch all blog posts with relatedPosts populated
 */
async function fetchAllBlogPosts() {
  const allPosts = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  console.log('📥 Fetching all blog posts with relatedPosts...\n');

  while (hasMore) {
    const url = `${STRAPI_URL}/api/blog-posts?populate=relatedPosts&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        console.error('Response:', JSON.stringify(errorData, null, 2));
        process.exit(1);
      }

      const data = await response.json();
      const posts = data.data || [];
      allPosts.push(...posts);

      // Check if there are more pages
      const pagination = data.meta?.pagination;
      if (pagination) {
        hasMore = page < pagination.pageCount;
        console.log(`   Page ${page}/${pagination.pageCount}: fetched ${posts.length} posts`);
      } else {
        hasMore = false;
      }
      
      page++;
    } catch (error) {
      console.error('❌ Network Error:', error.message);
      process.exit(1);
    }
  }

  return allPosts;
}

/**
 * Build a set of all valid documentIds from the posts
 */
function buildValidDocumentIdSet(posts) {
  const validIds = new Set();
  
  for (const post of posts) {
    // Strapi v5 uses documentId at root level
    if (post.documentId) {
      validIds.add(post.documentId);
    }
    // Strapi v4 fallback - id at root level
    if (post.id) {
      validIds.add(String(post.id));
    }
  }
  
  return validIds;
}

/**
 * Get field value from post (handles both Strapi v4 and v5 structures)
 */
function getField(post, fieldName) {
  // Strapi v5: fields are at root level
  if (post[fieldName] !== undefined) {
    return post[fieldName];
  }
  // Strapi v4: fields are under attributes
  return post?.attributes?.[fieldName];
}

/**
 * Verify relatedPosts for each post
 */
function verifyRelatedPosts(posts, validIds) {
  const issues = [];
  
  for (const post of posts) {
    const postId = post.documentId || post.id;
    const title = getField(post, 'title') || 'Untitled';
    const slug = getField(post, 'slug') || 'no-slug';
    
    // Get relatedPosts - could be at root level or under attributes
    let relatedPosts = getField(post, 'relatedPosts');
    
    // Handle Strapi relation format (could be { data: [...] } or direct array)
    if (relatedPosts?.data) {
      relatedPosts = relatedPosts.data;
    }
    
    if (!relatedPosts || !Array.isArray(relatedPosts) || relatedPosts.length === 0) {
      continue; // No related posts to verify
    }
    
    const invalidRefs = [];
    
    for (const related of relatedPosts) {
      // Get the documentId of the related post
      const relatedDocId = related.documentId || related.id;
      
      if (!relatedDocId) {
        invalidRefs.push({ id: 'unknown', reason: 'No documentId found in reference' });
        continue;
      }
      
      // Check if this documentId exists in our valid set
      if (!validIds.has(relatedDocId) && !validIds.has(String(relatedDocId))) {
        invalidRefs.push({ 
          id: relatedDocId, 
          reason: 'documentId not found in blog posts collection' 
        });
      }
    }
    
    if (invalidRefs.length > 0) {
      issues.push({
        postId,
        title,
        slug,
        totalRelated: relatedPosts.length,
        invalidRefs
      });
    }
  }
  
  return issues;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Related Posts Verification Script');
  console.log('====================================');
  console.log(`Strapi URL: ${STRAPI_URL}`);
  console.log(`Token: ${STRAPI_TOKEN ? '✓ Present' : '✗ Missing'}\n`);

  // Fetch all blog posts
  const posts = await fetchAllBlogPosts();
  console.log(`\n📊 Total blog posts fetched: ${posts.length}\n`);

  if (posts.length === 0) {
    console.log('⚠️  No blog posts found. Nothing to verify.');
    return;
  }

  // Build set of valid documentIds
  const validIds = buildValidDocumentIdSet(posts);
  console.log(`📋 Valid documentIds in collection: ${validIds.size}\n`);

  // Verify relatedPosts
  const issues = verifyRelatedPosts(posts, validIds);

  // Output results
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    VERIFICATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (issues.length === 0) {
    console.log('✅ All relatedPosts references are valid!\n');
    console.log('   No orphaned or invalid documentId references found.');
  } else {
    console.log(`❌ Found ${issues.length} post(s) with invalid relatedPosts references:\n`);
    
    for (const issue of issues) {
      console.log(`┌─────────────────────────────────────────────────────────────`);
      console.log(`│ Post: "${issue.title}"`);
      console.log(`│ Slug: ${issue.slug}`);
      console.log(`│ DocumentId: ${issue.postId}`);
      console.log(`│ Total relatedPosts: ${issue.totalRelated}`);
      console.log(`│ Invalid references: ${issue.invalidRefs.length}`);
      console.log(`│`);
      for (const ref of issue.invalidRefs) {
        console.log(`│   ⚠️  Missing documentId: "${ref.id}"`);
        console.log(`│      Reason: ${ref.reason}`);
      }
      console.log(`└─────────────────────────────────────────────────────────────\n`);
    }
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Total posts checked:     ${posts.length}`);
  console.log(`   Posts with issues:       ${issues.length}`);
  console.log(`   Posts without issues:    ${posts.length - issues.length}`);
  
  const totalInvalidRefs = issues.reduce((sum, i) => sum + i.invalidRefs.length, 0);
  console.log(`   Total invalid refs:      ${totalInvalidRefs}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (issues.length > 0) {
    console.log('💡 Next Steps:');
    console.log('   1. Review the invalid references above');
    console.log('   2. Either remove the invalid relatedPosts or restore the missing posts');
    console.log('   3. Run this script again to verify fixes\n');
    process.exit(1); // Exit with error code if issues found
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
