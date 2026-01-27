#!/usr/bin/env node
/**
 * Script to check if a specific blogpost documentId exists in Strapi
 * 
 * Usage:
 *   node scripts/check-blogpost-documentid.js                    # Uses default documentId
 *   node scripts/check-blogpost-documentid.js <documentId>       # Uses provided documentId
 * 
 * Environment variables:
 *   NEXT_PUBLIC_BACKEND_URL or STRAPI_URL - Strapi base URL
 *   NEXT_PUBLIC_STRAPI_TOKEN or STRAPI_TOKEN - Strapi API token
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const DEFAULT_DOCUMENT_ID = 'afg9frnaefhlgak63piqrpc2';

// Get Strapi URL from environment
function getStrapiUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.STRAPI_URL;
  if (!url) {
    console.error('❌ Error: No Strapi URL found in environment');
    console.error('   Set NEXT_PUBLIC_BACKEND_URL or STRAPI_URL');
    process.exit(1);
  }
  return url.replace(/\/$/, ''); // Remove trailing slash
}

// Get Strapi token from environment
function getStrapiToken() {
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_TOKEN;
  if (!token) {
    console.error('❌ Error: No Strapi token found in environment');
    console.error('   Set NEXT_PUBLIC_STRAPI_TOKEN or STRAPI_TOKEN');
    process.exit(1);
  }
  return token;
}

async function checkBlogpostDocumentId(documentId) {
  const strapiUrl = getStrapiUrl();
  const token = getStrapiToken();

  console.log('='.repeat(60));
  console.log('🔍 Checking Blogpost DocumentId');
  console.log('='.repeat(60));
  console.log(`📍 Strapi URL: ${strapiUrl}`);
  console.log(`🔑 Token: ${token.substring(0, 10)}...`);
  console.log(`📄 DocumentId: ${documentId}`);
  console.log('='.repeat(60));

  // Build the API URL with filter
  const apiUrl = `${strapiUrl}/api/blog-posts?filters[documentId][$eq]=${documentId}&populate=*`;
  
  console.log(`\n🌐 Fetching: ${apiUrl}\n`);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`   Response: ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log('-'.repeat(40));

    if (!data.data || data.data.length === 0) {
      console.log('❌ NOT FOUND');
      console.log(`   No blogpost found with documentId: ${documentId}`);
      
      // Try alternative: direct lookup by documentId in URL
      console.log('\n🔄 Trying alternative lookup...');
      const altUrl = `${strapiUrl}/api/blog-posts/${documentId}?populate=*`;
      console.log(`   URL: ${altUrl}`);
      
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        if (altData.data) {
          console.log('\n✅ FOUND (via direct lookup)');
          printPostDetails(altData.data);
        } else {
          console.log('❌ Still not found via direct lookup');
        }
      } else {
        console.log(`❌ Alternative lookup failed: ${altResponse.status}`);
      }
    } else {
      console.log('✅ FOUND');
      data.data.forEach((post, index) => {
        if (data.data.length > 1) {
          console.log(`\n--- Post ${index + 1} ---`);
        }
        printPostDetails(post);
      });
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
  }
}

function printPostDetails(post) {
  const attrs = post.attributes || post;
  
  console.log(`   📄 documentId: ${post.documentId || post.id || 'N/A'}`);
  console.log(`   🆔 id: ${post.id || 'N/A'}`);
  console.log(`   📝 title: ${attrs.title || 'N/A'}`);
  console.log(`   🔗 slug: ${attrs.slug || 'N/A'}`);
  console.log(`   🌍 locale: ${attrs.locale || 'N/A'}`);
  
  if (attrs.publishedAt) {
    console.log(`   📅 publishedAt: ${attrs.publishedAt}`);
    console.log(`   📊 status: PUBLISHED`);
  } else {
    console.log(`   📅 publishedAt: null`);
    console.log(`   📊 status: DRAFT`);
  }

  if (attrs.createdAt) {
    console.log(`   🕐 createdAt: ${attrs.createdAt}`);
  }
  if (attrs.updatedAt) {
    console.log(`   🕐 updatedAt: ${attrs.updatedAt}`);
  }
}

// Main execution
const documentId = process.argv[2] || DEFAULT_DOCUMENT_ID;
checkBlogpostDocumentId(documentId);
