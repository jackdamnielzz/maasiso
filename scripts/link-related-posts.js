#!/usr/bin/env node
/**
 * Link Related Posts Script
 * 
 * This script links blog posts via the REST API, bypassing the Admin UI
 * which has issues with the isTemporary flag and locale handling.
 * 
 * The problem:
 * - Admin UI sends: { connect: [{id, documentId, isTemporary: true}], disconnect: [] }
 * - This causes: ValidationError: Document with id "...", locale "null" not found
 * 
 * The solution:
 * - Use REST API with clean payload: { connect: [documentId] } or { set: [documentId] }
 * - Strapi v5 REST API accepts just documentIds for relations
 * 
 * Usage:
 *   node scripts/link-related-posts.js                           # Interactive mode
 *   node scripts/link-related-posts.js <sourceDocId> <targetDocId1> [targetDocId2...]
 *   node scripts/link-related-posts.js --list                    # List all posts with documentIds
 *   node scripts/link-related-posts.js --verify <documentId>     # Verify a post's relatedPosts
 * 
 * Environment Variables (from .env.production):
 *   - NEXT_PUBLIC_BACKEND_URL: Strapi base URL
 *   - NEXT_PUBLIC_STRAPI_TOKEN: API token for authentication
 */

require('dotenv').config({ path: '.env.production' });

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://peaceful-insight-production.up.railway.app';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ Error: No Strapi API token found');
  console.error('   Set NEXT_PUBLIC_STRAPI_TOKEN in .env.production');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${STRAPI_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Fetch a single blog post by documentId
 */
async function fetchBlogPost(documentId) {
  const url = `${STRAPI_URL}/api/blog-posts/${documentId}?populate=relatedPosts`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch post ${documentId}: ${response.status} - ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Fetch all blog posts (for listing)
 */
async function fetchAllBlogPosts() {
  const allPosts = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `${STRAPI_URL}/api/blog-posts?populate=relatedPosts&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    const data = await response.json();
    const posts = data.data || [];
    allPosts.push(...posts);
    
    const pagination = data.meta?.pagination;
    hasMore = pagination ? page < pagination.pageCount : false;
    page++;
  }
  
  return allPosts;
}

/**
 * Link related posts using the REST API
 * 
 * Strapi v5 relation update formats:
 * 1. { connect: [documentId1, documentId2] } - Add to existing relations
 * 2. { disconnect: [documentId1] } - Remove specific relations
 * 3. { set: [documentId1, documentId2] } - Replace all relations
 * 
 * For self-referencing manyToMany, we use 'connect' to add without removing existing
 */
async function linkRelatedPosts(sourceDocumentId, targetDocumentIds, mode = 'connect') {
  console.log(`\n🔗 Linking related posts...`);
  console.log(`   Source: ${sourceDocumentId}`);
  console.log(`   Targets: ${targetDocumentIds.join(', ')}`);
  console.log(`   Mode: ${mode}`);
  
  // First, fetch the current post to verify it exists
  const sourcePost = await fetchBlogPost(sourceDocumentId);
  console.log(`\n📄 Source post: "${sourcePost.title}"`);
  
  // Get current related posts
  const currentRelated = sourcePost.relatedPosts || [];
  console.log(`   Current related posts: ${currentRelated.length}`);
  
  // Verify target posts exist
  console.log(`\n🔍 Verifying target posts...`);
  for (const targetId of targetDocumentIds) {
    try {
      const targetPost = await fetchBlogPost(targetId);
      console.log(`   ✅ Found: "${targetPost.title}" (${targetId})`);
    } catch (error) {
      console.error(`   ❌ Not found: ${targetId}`);
      throw new Error(`Target post ${targetId} not found. Aborting.`);
    }
  }
  
  // Build the update payload
  // Strapi v5 REST API format for relations
  let relationPayload;
  
  if (mode === 'set') {
    // Replace all relations
    relationPayload = { set: targetDocumentIds };
  } else if (mode === 'disconnect') {
    // Remove specific relations
    relationPayload = { disconnect: targetDocumentIds };
  } else {
    // Default: connect (add to existing)
    relationPayload = { connect: targetDocumentIds };
  }
  
  const updatePayload = {
    data: {
      relatedPosts: relationPayload
    }
  };
  
  console.log(`\n📤 Sending update...`);
  console.log(`   URL: ${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`);
  console.log(`   Payload: ${JSON.stringify(updatePayload, null, 2)}`);
  
  const response = await fetch(
    `${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatePayload)
    }
  );
  
  const responseData = await response.json();
  
  if (!response.ok) {
    console.error(`\n❌ Update failed!`);
    console.error(`   Status: ${response.status}`);
    console.error(`   Response: ${JSON.stringify(responseData, null, 2)}`);
    
    // Try alternative payload format if first attempt fails
    if (response.status === 400) {
      console.log(`\n🔄 Trying alternative payload format...`);
      return await tryAlternativeFormat(sourceDocumentId, targetDocumentIds, mode);
    }
    
    throw new Error(`Update failed: ${response.status}`);
  }
  
  console.log(`\n✅ Successfully updated!`);
  
  // Verify the update
  const updatedPost = await fetchBlogPost(sourceDocumentId);
  const newRelated = updatedPost.relatedPosts || [];
  console.log(`   Related posts after update: ${newRelated.length}`);
  
  if (newRelated.length > 0) {
    console.log(`   Linked posts:`);
    for (const related of newRelated) {
      console.log(`     - "${related.title}" (${related.documentId})`);
    }
  }
  
  return updatedPost;
}

/**
 * Try alternative payload formats for Strapi v5
 */
async function tryAlternativeFormat(sourceDocumentId, targetDocumentIds, mode) {
  // First, get all posts to build ID mappings
  console.log(`   Fetching all posts for ID mapping...`);
  const posts = await fetchAllBlogPosts();
  const idMap = new Map();
  const docIdMap = new Map();
  for (const post of posts) {
    if (post.documentId && post.id) {
      idMap.set(post.documentId, post.id);
      docIdMap.set(post.id, post.documentId);
    }
  }
  
  const sourceNumericId = idMap.get(sourceDocumentId);
  const numericIds = targetDocumentIds
    .map(docId => idMap.get(docId))
    .filter(id => id !== undefined);
  
  console.log(`   Source numeric ID: ${sourceNumericId}`);
  console.log(`   Target numeric IDs: ${numericIds.join(', ')}`);
  
  // Alternative 1: Use objects with documentId
  console.log(`   Trying format: { connect: [{ documentId: "..." }] }`);
  
  const altPayload1 = {
    data: {
      relatedPosts: {
        [mode]: targetDocumentIds.map(id => ({ documentId: id }))
      }
    }
  };
  
  let response = await fetch(
    `${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(altPayload1)
    }
  );
  
  if (response.ok) {
    const result = await response.json();
    // Verify if it actually worked
    const verifyPost = await fetchBlogPost(sourceDocumentId);
    if (verifyPost.relatedPosts && verifyPost.relatedPosts.length > 0) {
      console.log(`   ✅ Alternative format 1 worked and verified!`);
      return result;
    }
    console.log(`   ⚠️ Format 1 returned OK but relation not saved`);
  }
  
  // Alternative 2: Direct array of documentIds (no connect/set wrapper)
  console.log(`   Trying format: { relatedPosts: ["docId1", "docId2"] }`);
  
  const altPayload2 = {
    data: {
      relatedPosts: targetDocumentIds
    }
  };
  
  response = await fetch(
    `${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(altPayload2)
    }
  );
  
  if (response.ok) {
    const result = await response.json();
    const verifyPost = await fetchBlogPost(sourceDocumentId);
    if (verifyPost.relatedPosts && verifyPost.relatedPosts.length > 0) {
      console.log(`   ✅ Alternative format 2 worked and verified!`);
      return result;
    }
    console.log(`   ⚠️ Format 2 returned OK but relation not saved`);
  }
  
  // Alternative 3: Use numeric IDs with connect
  if (numericIds.length === targetDocumentIds.length) {
    console.log(`   Trying format with numeric IDs: { connect: [${numericIds.join(', ')}] }`);
    
    const altPayload3 = {
      data: {
        relatedPosts: {
          [mode]: numericIds
        }
      }
    };
    
    response = await fetch(
      `${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(altPayload3)
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      const verifyPost = await fetchBlogPost(sourceDocumentId);
      if (verifyPost.relatedPosts && verifyPost.relatedPosts.length > 0) {
        console.log(`   ✅ Alternative format 3 (numeric IDs) worked and verified!`);
        return result;
      }
      console.log(`   ⚠️ Format 3 returned OK but relation not saved`);
    }
  }
  
  // Alternative 4: Use numeric IDs as direct array
  if (numericIds.length === targetDocumentIds.length) {
    console.log(`   Trying format: { relatedPosts: [${numericIds.join(', ')}] } (direct numeric)`);
    
    const altPayload4 = {
      data: {
        relatedPosts: numericIds
      }
    };
    
    response = await fetch(
      `${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(altPayload4)
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      const verifyPost = await fetchBlogPost(sourceDocumentId);
      if (verifyPost.relatedPosts && verifyPost.relatedPosts.length > 0) {
        console.log(`   ✅ Alternative format 4 (direct numeric) worked and verified!`);
        return result;
      }
      console.log(`   ⚠️ Format 4 returned OK but relation not saved`);
    }
  }
  
  // Alternative 5: Use set instead of connect with objects containing id
  if (numericIds.length === targetDocumentIds.length) {
    console.log(`   Trying format: { set: [{ id: ... }] }`);
    
    const altPayload5 = {
      data: {
        relatedPosts: {
          set: numericIds.map(id => ({ id }))
        }
      }
    };
    
    response = await fetch(
      `${STRAPI_URL}/api/blog-posts/${sourceDocumentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(altPayload5)
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      const verifyPost = await fetchBlogPost(sourceDocumentId);
      if (verifyPost.relatedPosts && verifyPost.relatedPosts.length > 0) {
        console.log(`   ✅ Alternative format 5 (set with id objects) worked and verified!`);
        return result;
      }
      console.log(`   ⚠️ Format 5 returned OK but relation not saved`);
    }
  }
  
  // If we get here, none of the formats actually saved the relation
  console.error(`\n❌ All payload formats failed to save the relation`);
  console.error(`   This is likely a Strapi v5 bug with self-referencing manyToMany relations.`);
  console.error(`\n💡 Possible solutions:`);
  console.error(`   1. Change the schema to use two separate fields (relatedPosts + relatedFrom)`);
  console.error(`   2. Use a custom controller to handle the relation`);
  console.error(`   3. Update directly in the database join table`);
  
  throw new Error('All payload formats failed to save the relation');
}

/**
 * List all blog posts with their documentIds
 */
async function listAllPosts() {
  console.log('📋 Fetching all blog posts...\n');
  
  const posts = await fetchAllBlogPosts();
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    ALL BLOG POSTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const post of posts) {
    const relatedCount = post.relatedPosts?.length || 0;
    const status = post.publishedAt ? '✅' : '📝';
    
    console.log(`${status} ${post.title}`);
    console.log(`   documentId: ${post.documentId}`);
    console.log(`   slug: ${post.slug}`);
    console.log(`   relatedPosts: ${relatedCount}`);
    if (relatedCount > 0) {
      for (const related of post.relatedPosts) {
        console.log(`     - ${related.documentId} (${related.title || 'untitled'})`);
      }
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total posts: ${posts.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Verify a specific post's relatedPosts
 */
async function verifyPost(documentId) {
  console.log(`🔍 Verifying post: ${documentId}\n`);
  
  const post = await fetchBlogPost(documentId);
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Post: "${post.title}"`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`documentId: ${post.documentId}`);
  console.log(`slug: ${post.slug}`);
  console.log(`locale: ${post.locale || 'not set'}`);
  console.log(`publishedAt: ${post.publishedAt || 'draft'}`);
  console.log('');
  
  const related = post.relatedPosts || [];
  console.log(`Related Posts (${related.length}):`);
  
  if (related.length === 0) {
    console.log('   (none)');
  } else {
    for (const r of related) {
      console.log(`   - "${r.title}"`);
      console.log(`     documentId: ${r.documentId}`);
      console.log(`     locale: ${r.locale || 'not set'}`);
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Interactive mode - prompt user for input
 */
async function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  console.log('\n🔗 Link Related Posts - Interactive Mode');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // First, list available posts
  console.log('Available posts:\n');
  const posts = await fetchAllBlogPosts();
  
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   documentId: ${post.documentId}`);
  });
  
  console.log('');
  
  const sourceId = await question('Enter source post documentId: ');
  const targetIds = await question('Enter target post documentId(s) (comma-separated): ');
  const mode = await question('Mode (connect/set/disconnect) [connect]: ') || 'connect';
  
  rl.close();
  
  const targets = targetIds.split(',').map(id => id.trim()).filter(id => id);
  
  if (!sourceId || targets.length === 0) {
    console.error('❌ Invalid input');
    process.exit(1);
  }
  
  await linkRelatedPosts(sourceId, targets, mode);
}

/**
 * Main function
 */
async function main() {
  console.log('🔗 Link Related Posts Script');
  console.log(`   Strapi URL: ${STRAPI_URL}`);
  console.log(`   Token: ${STRAPI_TOKEN ? '✓ Present' : '✗ Missing'}\n`);
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    await interactiveMode();
  } else if (args[0] === '--list') {
    // List all posts
    await listAllPosts();
  } else if (args[0] === '--verify' && args[1]) {
    // Verify a specific post
    await verifyPost(args[1]);
  } else if (args[0] === '--help' || args[0] === '-h') {
    // Show help
    console.log('Usage:');
    console.log('  node scripts/link-related-posts.js                           # Interactive mode');
    console.log('  node scripts/link-related-posts.js <sourceDocId> <targetDocId1> [targetDocId2...]');
    console.log('  node scripts/link-related-posts.js --list                    # List all posts');
    console.log('  node scripts/link-related-posts.js --verify <documentId>     # Verify a post');
    console.log('');
    console.log('Options:');
    console.log('  --mode=connect    Add to existing relations (default)');
    console.log('  --mode=set        Replace all relations');
    console.log('  --mode=disconnect Remove specific relations');
  } else {
    // Command line mode: link-related-posts.js <source> <target1> [target2...]
    let mode = 'connect';
    const filteredArgs = args.filter(arg => {
      if (arg.startsWith('--mode=')) {
        mode = arg.split('=')[1];
        return false;
      }
      return true;
    });
    
    const sourceDocumentId = filteredArgs[0];
    const targetDocumentIds = filteredArgs.slice(1);
    
    if (!sourceDocumentId || targetDocumentIds.length === 0) {
      console.error('❌ Usage: node scripts/link-related-posts.js <sourceDocId> <targetDocId1> [targetDocId2...]');
      process.exit(1);
    }
    
    await linkRelatedPosts(sourceDocumentId, targetDocumentIds, mode);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
