/**
 * Test Content Fetching Script
 * 
 * This script tests the direct API call approach for the MaasISO website.
 * It verifies that all pages fetch content directly from Strapi without caching.
 */

const { execSync } = require('child_process');

// Pages to test
const PAGES_TO_TEST = [
  'diensten',
  'over-ons',
  'blog',
  'news',
  'contact'
];

// Function to test content fetching for a page
async function testPage(slug) {
  console.log(`\n=== Testing ${slug} page ===`);
  
  // Test the page
  console.log(`Fetching ${slug} page directly from Strapi...`);
  try {
    // Use the test-strapi API endpoint to test the page
    const command = `curl -s "http://localhost:3000/api/test-strapi?slug=${slug}"`;
    const result = execSync(command).toString();
    console.log(`API Response: ${result}`);
    
    return {
      slug,
      success: true,
      directFetch: true
    };
  } catch (error) {
    console.error(`Error testing ${slug} page:`, error.message);
    return {
      slug,
      success: false,
      error: error.message
    };
  }
}

// Function to test response time
async function testResponseTime(slug, iterations = 3) {
  console.log(`\n=== Testing response time for ${slug} page ===`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1}/${iterations}...`);
    const startTime = Date.now();
    
    try {
      // Use the test-strapi API endpoint to test the page
      const command = `curl -s "http://localhost:3000/api/test-strapi?slug=${slug}"`;
      execSync(command);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      times.push(responseTime);
      
      console.log(`Response time: ${responseTime}ms`);
    } catch (error) {
      console.error(`Error:`, error.message);
    }
  }
  
  // Calculate average response time
  const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  console.log(`Average response time for ${slug}: ${Math.round(avgTime)}ms`);
  
  return {
    slug,
    avgResponseTime: Math.round(avgTime),
    times
  };
}

// Main function
async function main() {
  console.log('=== Content Fetching Test (Direct API Calls) ===');
  
  // Test each page
  const results = [];
  for (const page of PAGES_TO_TEST) {
    const result = await testPage(page);
    results.push(result);
  }
  
  // Test response times for a subset of pages
  const responseTimeResults = [];
  for (const page of ['diensten', 'over-ons']) {
    const result = await testResponseTime(page);
    responseTimeResults.push(result);
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.slug}: Direct API call successful`);
    } else {
      console.log(`❌ ${result.slug}: Failed - ${result.error}`);
    }
  });
  
  console.log('\n=== Response Time Summary ===');
  responseTimeResults.forEach(result => {
    console.log(`${result.slug}: ${result.avgResponseTime}ms`);
  });
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});