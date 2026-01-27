#!/usr/bin/env node
/**
 * Direct Database Link for Related Posts
 * 
 * This script bypasses the Strapi Admin UI and REST API to directly insert
 * related posts links into the database join table.
 * 
 * This is a workaround for the Strapi v5 bug where self-referencing manyToMany
 * relations fail with "Document with id ..., locale null not found" error.
 * 
 * Usage:
 *   node scripts/direct-link-related-posts.js <source-slug> <target-slug1> [target-slug2...]
 *   node scripts/direct-link-related-posts.js --list
 *   node scripts/direct-link-related-posts.js --verify <slug>
 * 
 * Examples:
 *   node scripts/direct-link-related-posts.js avg-beeldmateriaal-toestemming iso-14001-checklist
 *   node scripts/direct-link-related-posts.js --list
 *   node scripts/direct-link-related-posts.js --verify avg-beeldmateriaal-toestemming
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { Client } = require('pg');

// Database connection from environment - support both URL and individual vars
const DATABASE_URL = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_SSL = process.env.DATABASE_SSL === 'true';

if (!DATABASE_URL && !DATABASE_HOST) {
  console.error('❌ Error: Database connection not found in environment');
  console.error('   Set DATABASE_URL or DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD');
  process.exit(1);
}

/**
 * Create database client
 */
function createClient() {
  if (DATABASE_URL) {
    return new Client({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
    });
  }
  
  return new Client({
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT || '5432'),
    database: DATABASE_NAME,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    ssl: DATABASE_SSL ? { rejectUnauthorized: false } : false
  });
}

/**
 * Get all blog posts with their IDs and slugs
 */
async function getAllPosts(client) {
  const result = await client.query(`
    SELECT id, document_id, slug, title 
    FROM blog_posts 
    WHERE published_at IS NOT NULL
    ORDER BY title ASC
  `);
  return result.rows;
}

/**
 * Get a blog post by slug
 */
async function getPostBySlug(client, slug) {
  const result = await client.query(`
    SELECT id, document_id, slug, title 
    FROM blog_posts 
    WHERE slug = $1
  `, [slug]);
  return result.rows[0];
}

/**
 * Get existing related posts for a blog post
 */
async function getRelatedPosts(client, postId) {
  // First, find the join table name
  const tableCheck = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%blog_posts%related%' 
       OR table_name LIKE '%related_posts%'
  `);
  
  if (tableCheck.rows.length === 0) {
    console.log('   ⚠️ No join table found for related posts');
    return [];
  }
  
  const joinTable = tableCheck.rows[0].table_name;
  console.log(`   Using join table: ${joinTable}`);
  
  // Get the column names
  const columns = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1
  `, [joinTable]);
  
  console.log(`   Columns: ${columns.rows.map(r => r.column_name).join(', ')}`);
  
  // Try to get related posts
  try {
    const result = await client.query(`
      SELECT * FROM ${joinTable} WHERE blog_post_id = $1 OR inv_blog_post_id = $1
    `, [postId]);
    return result.rows;
  } catch (e) {
    // Try alternative column names
    try {
      const result = await client.query(`
        SELECT * FROM ${joinTable}
      `);
      return result.rows.filter(r => 
        Object.values(r).includes(postId)
      );
    } catch (e2) {
      console.error(`   Error querying join table: ${e2.message}`);
      return [];
    }
  }
}

/**
 * Link two blog posts as related
 */
async function linkRelatedPosts(client, sourceId, targetId) {
  // Find the join table
  const tableCheck = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%blog_posts%related%' 
       OR table_name LIKE '%related_posts%'
  `);
  
  if (tableCheck.rows.length === 0) {
    throw new Error('No join table found for related posts');
  }
  
  const joinTable = tableCheck.rows[0].table_name;
  
  // Get column names
  const columns = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [joinTable]);
  
  const colNames = columns.rows.map(r => r.column_name);
  console.log(`   Join table: ${joinTable}`);
  console.log(`   Columns: ${colNames.join(', ')}`);
  
  // Determine column mapping
  let sourceCol, targetCol;
  if (colNames.includes('blog_post_id') && colNames.includes('inv_blog_post_id')) {
    sourceCol = 'blog_post_id';
    targetCol = 'inv_blog_post_id';
  } else if (colNames.includes('related_posts_id') && colNames.includes('blog_post_id')) {
    sourceCol = 'blog_post_id';
    targetCol = 'related_posts_id';
  } else {
    // Use first two ID columns
    const idCols = colNames.filter(c => c.includes('id') && c !== 'id');
    if (idCols.length >= 2) {
      sourceCol = idCols[0];
      targetCol = idCols[1];
    } else {
      throw new Error(`Cannot determine column mapping. Columns: ${colNames.join(', ')}`);
    }
  }
  
  console.log(`   Using columns: ${sourceCol} -> ${targetCol}`);
  
  // Check if link already exists
  const existing = await client.query(`
    SELECT * FROM ${joinTable} 
    WHERE ${sourceCol} = $1 AND ${targetCol} = $2
  `, [sourceId, targetId]);
  
  if (existing.rows.length > 0) {
    console.log(`   ⏭️ Link already exists`);
    return false;
  }
  
  // Insert the link
  await client.query(`
    INSERT INTO ${joinTable} (${sourceCol}, ${targetCol})
    VALUES ($1, $2)
  `, [sourceId, targetId]);
  
  console.log(`   ✅ Link created`);
  return true;
}

/**
 * List all blog posts
 */
async function listPosts() {
  const client = createClient();
  
  try {
    await client.connect();
    console.log('📋 Listing all published blog posts:\n');
    
    const posts = await getAllPosts(client);
    
    for (const post of posts) {
      console.log(`  ${post.slug}`);
      console.log(`    ID: ${post.id}, DocumentID: ${post.document_id}`);
      console.log(`    Title: ${post.title}\n`);
    }
    
    console.log(`\nTotal: ${posts.length} posts`);
  } finally {
    await client.end();
  }
}

/**
 * Verify related posts for a blog post
 */
async function verifyPost(slug) {
  const client = createClient();
  
  try {
    await client.connect();
    console.log(`🔍 Verifying related posts for: ${slug}\n`);
    
    const post = await getPostBySlug(client, slug);
    if (!post) {
      console.error(`❌ Post not found: ${slug}`);
      return;
    }
    
    console.log(`   Post: ${post.title}`);
    console.log(`   ID: ${post.id}, DocumentID: ${post.document_id}\n`);
    
    const related = await getRelatedPosts(client, post.id);
    
    if (related.length === 0) {
      console.log('   No related posts found');
    } else {
      console.log(`   Related posts (${related.length}):`);
      for (const r of related) {
        console.log(`     ${JSON.stringify(r)}`);
      }
    }
  } finally {
    await client.end();
  }
}

/**
 * Link posts by slug
 */
async function linkPosts(sourceSlug, targetSlugs) {
  const client = createClient();
  
  try {
    await client.connect();
    console.log(`🔗 Linking related posts\n`);
    console.log(`   Source: ${sourceSlug}`);
    console.log(`   Targets: ${targetSlugs.join(', ')}\n`);
    
    const sourcePost = await getPostBySlug(client, sourceSlug);
    if (!sourcePost) {
      console.error(`❌ Source post not found: ${sourceSlug}`);
      return;
    }
    
    console.log(`   Source found: ${sourcePost.title} (ID: ${sourcePost.id})\n`);
    
    let linked = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const targetSlug of targetSlugs) {
      console.log(`   Processing: ${targetSlug}`);
      
      const targetPost = await getPostBySlug(client, targetSlug);
      if (!targetPost) {
        console.error(`   ❌ Target post not found: ${targetSlug}`);
        failed++;
        continue;
      }
      
      console.log(`   Target found: ${targetPost.title} (ID: ${targetPost.id})`);
      
      try {
        const created = await linkRelatedPosts(client, sourcePost.id, targetPost.id);
        if (created) {
          linked++;
        } else {
          skipped++;
        }
      } catch (e) {
        console.error(`   ❌ Error: ${e.message}`);
        failed++;
      }
      
      console.log('');
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Linked: ${linked}`);
    console.log(`   Skipped (already exists): ${skipped}`);
    console.log(`   Failed: ${failed}`);
  } finally {
    await client.end();
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/direct-link-related-posts.js <source-slug> <target-slug1> [target-slug2...]');
    console.log('  node scripts/direct-link-related-posts.js --list');
    console.log('  node scripts/direct-link-related-posts.js --verify <slug>');
    process.exit(1);
  }
  
  if (args[0] === '--list') {
    await listPosts();
  } else if (args[0] === '--verify') {
    if (!args[1]) {
      console.error('❌ Please provide a slug to verify');
      process.exit(1);
    }
    await verifyPost(args[1]);
  } else {
    if (args.length < 2) {
      console.error('❌ Please provide at least one target slug');
      process.exit(1);
    }
    await linkPosts(args[0], args.slice(1));
  }
}

main().catch(console.error);
