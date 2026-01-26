const https = require('https');

const API_URL = 'https://peaceful-insight-production.up.railway.app';
const API_TOKEN = '9ff727d730447da883cad384524bc2e9891de14e526d0273c0785710762dc0ef2aa6900a855948e3fa6ed72a1927178b6c725fa34605959aac8cb69794463c1484cd0325548fc3a5c88898cb9099ac114e40c19bb6755c8d2f7d9110330be97031587152e34f6e37992eb31faef66c92f60df20b32b80b95029744047504f9f9';

// Function to make API request
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_URL);

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    console.log(`\nRequesting: ${url.toString()}\n`);

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function inspectBlogStructure() {
  try {
    console.log('='.repeat(80));
    console.log('STRAPI BLOG POST STRUCTURE INSPECTION');
    console.log('='.repeat(80));

    // Fetch a single blog post with all fields populated
    const response = await makeRequest('/api/blog-posts?populate=*&pagination[limit]=1');

    console.log('\n📦 Raw response structure:');
    console.log('Response keys:', Object.keys(response || {}));
    console.log('Has data:', !!response?.data);
    console.log('Data is array:', Array.isArray(response?.data));
    console.log('Data length:', response?.data?.length);

    if (!response || !response.data || response.data.length === 0) {
      console.log('\n⚠️  No blog posts found in Strapi.');
      console.log('\nFull response:');
      console.log(JSON.stringify(response, null, 2));

      console.log('\nAttempting to fetch blog post list without populate...');
      const listResponse = await makeRequest('/api/blog-posts?pagination[limit]=5');
      console.log('\nBlog posts found:', listResponse?.data?.length || 0);
      if (listResponse?.data && listResponse.data.length > 0) {
        console.log('\nFirst blog post (limited fields):');
        console.log(JSON.stringify(listResponse.data[0], null, 2));
      }
      return;
    }

    const blogPost = response.data[0];
    const attributes = blogPost?.attributes;

    if (!attributes) {
      console.log('\n⚠️  Blog post has no attributes.');
      console.log('Blog post structure:', JSON.stringify(blogPost, null, 2));
      return;
    }

    console.log('\n📋 CURRENT BLOG POST FIELDS\n');
    console.log('-'.repeat(80));

    // List all available fields
    const fields = Object.keys(attributes);
    console.log(`\nTotal fields found: ${fields.length}\n`);

    fields.forEach(field => {
      const value = attributes[field];
      const type = Array.isArray(value) ? 'array' : typeof value;
      const hasData = value?.data !== undefined;

      let typeDisplay = type;
      if (hasData) {
        typeDisplay = `${type} (Strapi relation)`;
      } else if (Array.isArray(value) && value.length > 0) {
        typeDisplay = `array[${value.length}]`;
      }

      console.log(`  • ${field.padEnd(25)} : ${typeDisplay}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('FIELD COMPARISON WITH REQUIREMENTS');
    console.log('='.repeat(80));

    const requiredFields = {
      // Critical fields
      'title': 'Short text',
      'slug': 'UID',
      'content': 'Rich text',
      'excerpt': 'Long text (max 160)',
      'author': 'Relation → Authors',
      'categories': 'Relation → Categories',
      'tags': 'Relation → Tags',
      'featuredImage': 'Media',
      'featuredImageAltText': 'Short text (max 125)',
      'seoTitle': 'Short text (max 60)',
      'seoDescription': 'Long text (max 160)',
      'publicationDate': 'Datetime',
      'updatedAt': 'Datetime',
      'tldr': 'Component (repeatable)',
      'faq': 'Component (repeatable)',
      // High priority
      'relatedPosts': 'Relation → Blog Posts',
      'schemaType': 'Enumeration',
      'primaryKeyword': 'Short text',
      // Optional
      'searchIntent': 'Enumeration',
      'ctaVariant': 'Enumeration',
      'robotsIndex': 'Boolean',
      'robotsFollow': 'Boolean',
      'ogImage': 'Media',
      'videoUrl': 'Short text',
      'videoTitle': 'Short text',
      'videoDuration': 'Short text'
    };

    console.log('\n✅ IMPLEMENTED FIELDS:\n');
    const implementedFields = [];
    Object.keys(requiredFields).forEach(field => {
      if (fields.includes(field)) {
        implementedFields.push(field);
        console.log(`  ✓ ${field.padEnd(25)} : ${requiredFields[field]}`);
      }
    });

    console.log('\n❌ MISSING FIELDS:\n');
    const missingFields = [];
    Object.keys(requiredFields).forEach(field => {
      if (!fields.includes(field)) {
        missingFields.push(field);
        console.log(`  ✗ ${field.padEnd(25)} : ${requiredFields[field]}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n  Total required fields:    ${Object.keys(requiredFields).length}`);
    console.log(`  Implemented:              ${implementedFields.length}`);
    console.log(`  Missing:                  ${missingFields.length}`);
    console.log(`  Completion:               ${Math.round((implementedFields.length / Object.keys(requiredFields).length) * 100)}%`);

    console.log('\n' + '='.repeat(80));
    console.log('DETAILED BLOG POST DATA (first post)');
    console.log('='.repeat(80));
    console.log('\n' + JSON.stringify(blogPost, null, 2));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

inspectBlogStructure();
