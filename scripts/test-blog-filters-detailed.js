async function testBlogFilters() {
  console.log('🧪 Testing blog-filters API in detail\n');
  
  try {
    // Test 1: Basic API call
    console.log('1️⃣ Making basic API call...');
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/blog-filters', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`   Response time: ${elapsed}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Content-Length: ${response.headers.get('content-length')}`);
    
    const responseText = await response.text();
    console.log(`   Response length: ${responseText.length} characters`);
    
    if (responseText.length === 0) {
      console.error('❌ Empty response received!');
      return;
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Valid JSON response');
    } catch (e) {
      console.error('❌ Invalid JSON:', e.message);
      console.log('   First 200 chars:', responseText.substring(0, 200));
      return;
    }
    
    // Analyze the data
    console.log('\n2️⃣ Analyzing response data:');
    console.log(`   - Categories: ${data.categories?.length || 0}`);
    console.log(`   - Tags: ${data.tags?.length || 0}`);
    console.log(`   - Total posts: ${data.totalPosts || 0}`);
    console.log(`   - Has error: ${!!data.error}`);
    
    if (data.error) {
      console.error(`   - Error message: ${data.error}`);
    }
    
    // Show sample data
    if (data.categories && data.categories.length > 0) {
      console.log('\n3️⃣ Sample categories:');
      data.categories.slice(0, 5).forEach(cat => {
        console.log(`   - ${cat.name} (${cat.count} posts) [slug: ${cat.slug}]`);
      });
    }
    
    if (data.tags && data.tags.length > 0) {
      console.log('\n4️⃣ Sample tags:');
      data.tags.slice(0, 5).forEach(tag => {
        console.log(`   - ${tag.name} (${tag.count} posts)`);
      });
    }
    
    // Test with filters
    console.log('\n5️⃣ Testing with category filter...');
    const filteredResponse = await fetch('http://localhost:3000/api/blog-filters?category=iso-9001');
    if (filteredResponse.ok) {
      const filteredData = await filteredResponse.json();
      console.log(`   ✅ Filtered results: ${filteredData.totalPosts} posts`);
      console.log(`   - Categories shown: ${filteredData.categories?.length || 0}`);
      console.log(`   - Tags shown: ${filteredData.tags?.length || 0}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testBlogFilters().catch(console.error); 