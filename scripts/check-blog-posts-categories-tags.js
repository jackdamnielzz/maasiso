require('dotenv').config({ path: '.env.local' });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://153.92.223.23:1337';

async function checkBlogPostsCategoriesTags() {
  try {
    console.log('🔍 Checking Blog Posts Categories and Tags...\n');
    console.log(`Strapi URL: ${STRAPI_URL}\n`);

    // Fetch blog posts with categories and tags using correct Strapi v4 syntax
    const response = await fetch(
      `${STRAPI_URL}/api/blog-posts?populate[categories]=*&populate[tags]=*&pagination[limit]=100`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Total blog posts: ${data.data?.length || 0}\n`);

    // Collect unique categories and tags
    const categoriesMap = new Map();
    const tagsMap = new Map();

    data.data.forEach((post, index) => {
      const postData = post.attributes || post;
      console.log(`📝 Post ${index + 1}: ${postData.title}`);
      
      // Check categories
      if (postData.categories?.data && postData.categories.data.length > 0) {
        console.log('  Categories:');
        postData.categories.data.forEach(cat => {
          const catData = cat.attributes || cat;
          console.log(`    - ${catData.name} (${catData.slug})`);
          
          // Count posts per category
          const key = `${catData.slug}|${catData.name}`;
          categoriesMap.set(key, (categoriesMap.get(key) || 0) + 1);
        });
      } else {
        console.log('  Categories: None');
      }
      
      // Check tags
      if (postData.tags?.data && postData.tags.data.length > 0) {
        console.log('  Tags:');
        postData.tags.data.forEach(tag => {
          const tagData = tag.attributes || tag;
          console.log(`    - ${tagData.name}`);
          
          // Count posts per tag
          tagsMap.set(tagData.name, (tagsMap.get(tagData.name) || 0) + 1);
        });
      } else {
        console.log('  Tags: None');
      }
      
      console.log('');
    });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`Total unique categories: ${categoriesMap.size}`);
    console.log(`Total unique tags: ${tagsMap.size}`);
    
    if (categoriesMap.size > 0) {
      console.log('\n📁 Categories with post counts:');
      Array.from(categoriesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, count]) => {
          const [slug, name] = key.split('|');
          console.log(`  - ${name} (${slug}): ${count} posts`);
        });
    }
    
    if (tagsMap.size > 0) {
      console.log('\n🏷️  Tags with post counts (top 20):');
      Array.from(tagsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([name, count]) => {
          console.log(`  - ${name}: ${count} posts`);
        });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

checkBlogPostsCategoriesTags(); 