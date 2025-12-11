#!/usr/bin/env node

const { promisify } = require('util');
const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// Test configuration
const BASE_URL = 'https://maasiso.nl/api/proxy';

const tests = [
  {
    name: 'Blog Posts with Tags and Categories',
    endpoint: '/blog-posts?pagination[limit]=3&populate=*',
    checkTags: true
  },
  {
    name: 'Categories List',
    endpoint: '/categories?pagination[limit]=5',
    checkCategories: true
  },
  {
    name: 'Tags List', 
    endpoint: '/tags?pagination[limit]=5',
    checkTags: true
  }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: JSON.parse(data)
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Strapi API Endpoints for Tags and Categories...\n');
  
  let allPassed = true;
  
  for (const test of tests) {
    const url = `${BASE_URL}${test.endpoint}`;
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${url}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.status === 200) {
        const itemCount = response.data.data?.length || 0;
        console.log(`✅ ${test.name} - OK (${response.status}) - ${itemCount} items`);
        
        // Check if this is blog posts and if tags/categories are present
        if (test.checkTags && response.data.data && response.data.data.length > 0) {
          const firstPost = response.data.data[0];
          console.log(`   📋 First item structure:`);
          console.log(`      - ID: ${firstPost.id}`);
          console.log(`      - Title: ${firstPost.title || 'N/A'}`);
          console.log(`      - Has tags: ${Array.isArray(firstPost.tags) ? 'YES (' + firstPost.tags.length + ')' : 'NO'}`);
          console.log(`      - Has categories: ${Array.isArray(firstPost.categories) ? 'YES (' + firstPost.categories.length + ')' : 'NO'}`);
          
          if (Array.isArray(firstPost.tags) && firstPost.tags.length > 0) {
            console.log(`      - Sample tag: ${JSON.stringify(firstPost.tags[0])}`);
          }
          if (Array.isArray(firstPost.categories) && firstPost.categories.length > 0) {
            console.log(`      - Sample category: ${JSON.stringify(firstPost.categories[0])}`);
          }
        }
        
      } else {
        console.log(`❌ ${test.name} - FAILED (${response.status})`);
        console.log(`   Error: ${JSON.stringify(response.data, null, 2)}`);
        allPassed = false;
      }
      
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      allPassed = false;
    }
    
    console.log(''); // Empty line for spacing
  }
  
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed!');
  process.exit(allPassed ? 0 : 1);
}

runTests(); 