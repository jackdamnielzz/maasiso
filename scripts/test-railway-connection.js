const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.production' });

const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://peaceful-insight-production.up.railway.app';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ Error: NEXT_PUBLIC_STRAPI_TOKEN is not set in .env.production');
  process.exit(1);
}

async function testEndpoint(endpoint, description) {
  console.log(`\n🔍 Testing ${description}...`);
  console.log(`URL: ${STRAPI_URL}/api/${endpoint}`);
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
      console.error('Response:', JSON.stringify(data, null, 2));
      return false;
    }

    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Count:', data.data ? data.data.length : 'N/A');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Railway Strapi API Connection Tests');
  console.log('============================================');
  console.log('Using Strapi URL:', STRAPI_URL);
  console.log('Token available:', !!STRAPI_TOKEN);

  // Test endpoints
  const tests = [
    ['pages?pagination[pageSize]=1', 'Pages endpoint'],
    ['blog-posts?pagination[pageSize]=1', 'Blog Posts endpoint'],
    ['news-articles?pagination[pageSize]=1', 'News Articles endpoint'],
    ['whitepapers?pagination[pageSize]=1', 'Whitepapers endpoint']
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
  
  if (successCount === 0) {
    console.log('\n💡 Possible Cause: The API token in .env.production might be invalid for the new Railway instance.');
  }
}

runTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
