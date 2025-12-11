// Test script for Strapi API connection
const fetch = require('node-fetch');
require('dotenv').config();

const STRAPI_URL = 'http://153.92.223.23:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ Error: STRAPI_TOKEN is not set');
  process.exit(1);
}

async function testEndpoint(endpoint, description) {
  console.log(`\n🔍 Testing ${description}...`);
  try {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error: ${response.status} ${response.statusText}`);
      console.error('Response:', data);
      return false;
    }

    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Strapi API Connection Tests');
  console.log('=======================================');
  console.log('Using Strapi URL:', STRAPI_URL);
  console.log('Token available:', !!STRAPI_TOKEN);

  // Test endpoints
  const tests = [
    ['pages?populate=*', 'Pages endpoint'],
    ['diensten?populate=*', 'Diensten endpoint'],
    ['over-ons?populate=*', 'Over Ons endpoint'],
    ['blog-posts?populate=*', 'Blog Posts endpoint']
  ];

  let successCount = 0;
  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description);
    if (success) successCount++;
  }

  console.log('\n📊 Test Results');
  console.log('===============');
  console.log(`✅ ${successCount} tests passed`);
  console.log(`❌ ${tests.length - successCount} tests failed`);
}

runTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});