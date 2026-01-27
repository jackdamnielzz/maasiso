/**
 * Test script om te controleren of relatedPosts correct worden opgehaald via de API
 */

const https = require('https');

const STRAPI_URL = 'https://maasiso-strapi.up.railway.app';
const TEST_SLUG = 'isms-betekenis'; // Dit is een post met relatedPosts

// Haal de API token uit environment of gebruik een placeholder
const API_TOKEN = process.env.STRAPI_TOKEN || 'YOUR_API_TOKEN_HERE';

const options = {
  hostname: 'maasiso-strapi.up.railway.app',
  path: `/api/blog-posts?filters[slug][$eq]=${TEST_SLUG}&populate[0]=relatedPosts&populate[1]=relatedPosts.featuredImage`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

console.log('Testing relatedPosts API...');
console.log('URL:', `${STRAPI_URL}${options.path}`);
console.log('');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.error) {
        console.error('API Error:', json.error);
        return;
      }
      
      if (!json.data || json.data.length === 0) {
        console.log('No blog post found with slug:', TEST_SLUG);
        return;
      }
      
      const post = json.data[0];
      console.log('Blog Post:', post.title || post.attributes?.title);
      console.log('Slug:', post.slug || post.attributes?.slug);
      console.log('');
      
      // Check relatedPosts
      const relatedPosts = post.relatedPosts || post.attributes?.relatedPosts;
      
      if (!relatedPosts) {
        console.log('❌ relatedPosts field is missing from response');
        console.log('');
        console.log('Full response structure:');
        console.log(JSON.stringify(post, null, 2).substring(0, 2000));
      } else if (Array.isArray(relatedPosts) && relatedPosts.length > 0) {
        console.log('✅ relatedPosts found:', relatedPosts.length, 'posts');
        relatedPosts.forEach((rp, i) => {
          const title = rp.title || rp.attributes?.title;
          const slug = rp.slug || rp.attributes?.slug;
          console.log(`  ${i + 1}. ${title} (${slug})`);
        });
      } else if (relatedPosts.data && Array.isArray(relatedPosts.data)) {
        console.log('✅ relatedPosts found (nested):', relatedPosts.data.length, 'posts');
        relatedPosts.data.forEach((rp, i) => {
          const title = rp.title || rp.attributes?.title;
          const slug = rp.slug || rp.attributes?.slug;
          console.log(`  ${i + 1}. ${title} (${slug})`);
        });
      } else {
        console.log('⚠️ relatedPosts exists but is empty or has unexpected structure');
        console.log('relatedPosts value:', JSON.stringify(relatedPosts, null, 2));
      }
      
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
