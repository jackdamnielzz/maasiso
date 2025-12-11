require('dotenv').config({ path: '.env.local' });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://153.92.223.23:1337';

async function testPopulateCategories() {
  try {
    console.log('🔍 Testing categories populate query...\n');
    console.log(`Strapi URL: ${STRAPI_URL}\n`);

    // Test simple populate
    console.log('1. Testing with populate=blog_posts:');
    const response1 = await fetch(
      `${STRAPI_URL}/api/categories?populate=blog_posts`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Response status: ${response1.status}`);
    
    if (response1.ok) {
      const data = await response1.json();
      console.log(`Total categories: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        const firstCategory = data.data[0];
        const categoryData = firstCategory.attributes || firstCategory;
        console.log('\nFirst category structure:');
        console.log(`- Name: ${categoryData.name}`);
        console.log(`- Has blog_posts field: ${!!categoryData.blog_posts}`);
        
        if (categoryData.blog_posts) {
          console.log(`- blog_posts type: ${typeof categoryData.blog_posts}`);
          console.log(`- Is array: ${Array.isArray(categoryData.blog_posts)}`);
          console.log(`- Has data property: ${!!categoryData.blog_posts.data}`);
          
          if (categoryData.blog_posts.data) {
            console.log(`- Post count: ${categoryData.blog_posts.data.length}`);
          } else if (Array.isArray(categoryData.blog_posts)) {
            console.log(`- Post count: ${categoryData.blog_posts.length}`);
          }
        }
      }
    } else {
      const errorText = await response1.text();
      console.log('Error:', errorText);
    }

    // Test with fields limitation
    console.log('\n\n2. Testing with populate[blog_posts][fields]=id:');
    const response2 = await fetch(
      `${STRAPI_URL}/api/categories?populate[blog_posts][fields]=id`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Response status: ${response2.status}`);
    
    if (response2.ok) {
      const data = await response2.json();
      console.log('Success! This query works.');
      
      if (data.data && data.data.length > 0) {
        const firstCategory = data.data[0];
        const categoryData = firstCategory.attributes || firstCategory;
        console.log(`First category has ${categoryData.blog_posts?.data?.length || 0} posts`);
      }
    } else {
      const errorText = await response2.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPopulateCategories(); 