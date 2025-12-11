async function testBlogFilters() {
  console.log('🧪 Testing blog-filters API endpoint\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('1️⃣ Testing basic request without filters...');
    const response = await fetch(`${baseUrl}/api/blog-filters`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`   Raw response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Success! Response data:');
        console.log(`   - Categories: ${data.categories?.length || 0}`);
        console.log(`   - Tags: ${data.tags?.length || 0}`);
        console.log(`   - Total posts: ${data.totalPosts || 0}`);
        
        if (data.categories && data.categories.length > 0) {
          console.log('\n   Sample categories:');
          data.categories.slice(0, 3).forEach(cat => {
            console.log(`   - ${cat.name} (${cat.count} posts)`);
          });
        }
        
        if (data.tags && data.tags.length > 0) {
          console.log('\n   Sample tags:');
          data.tags.slice(0, 3).forEach(tag => {
            console.log(`   - ${tag.name} (${tag.count} posts)`);
          });
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError.message);
      }
    } else {
      console.error(`❌ Request failed with status ${response.status}`);
      try {
        const errorData = JSON.parse(responseText);
        console.error('   Error:', errorData.error);
        console.error('   Details:', errorData.details);
      } catch {
        console.error('   Response:', responseText);
      }
    }
    
    console.log('\n2️⃣ Testing with category filter...');
    const categoryResponse = await fetch(`${baseUrl}/api/blog-filters?category=iso-9001`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${categoryResponse.status}`);
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      console.log(`   ✅ Filtered results: ${categoryData.totalPosts} posts`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
  }
}

testBlogFilters().catch(console.error); 