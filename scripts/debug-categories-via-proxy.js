async function debugCategoriesViaProxy() {
  try {
    console.log('🔍 Debug Categories and Tags via Next.js Proxy\n');
    
    // Wacht even tot de server is opgestart
    console.log('Wacht 5 seconden tot de server is opgestart...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const BASE_URL = 'http://localhost:3000';
    console.log(`Testing via: ${BASE_URL}\n`);

    // Test 1: Categories via proxy
    console.log('1️⃣ Testing categories via proxy...');
    try {
      const categoriesResponse = await fetch(
        `${BASE_URL}/api/proxy/categories?sort=name:asc`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Status: ${categoriesResponse.status}`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log(`✓ Found ${categoriesData.data?.length || 0} categories`);
        
        if (categoriesData.data && categoriesData.data.length > 0) {
          console.log('\nFirst 3 categories:');
          categoriesData.data.slice(0, 3).forEach(cat => {
            const catData = cat.attributes || cat;
            console.log(`  - ${catData.name} (${catData.slug})`);
          });
        }
      } else {
        const errorText = await categoriesResponse.text();
        console.log('✗ Failed:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('✗ Error:', error.message);
    }

    // Test 2: Tags via proxy
    console.log('\n2️⃣ Testing tags via proxy...');
    try {
      const tagsResponse = await fetch(
        `${BASE_URL}/api/proxy/tags?sort=name:asc&pagination[limit]=10`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Status: ${tagsResponse.status}`);
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        console.log(`✓ Found ${tagsData.data?.length || 0} tags`);
        
        if (tagsData.data && tagsData.data.length > 0) {
          console.log('\nFirst 5 tags:');
          tagsData.data.slice(0, 5).forEach(tag => {
            const tagData = tag.attributes || tag;
            console.log(`  - ${tagData.name}`);
          });
        }
      } else {
        const errorText = await tagsResponse.text();
        console.log('✗ Failed:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('✗ Error:', error.message);
    }

    // Test 3: Blog posts met categorieën
    console.log('\n3️⃣ Testing blog posts with categories via proxy...');
    try {
      const blogResponse = await fetch(
        `${BASE_URL}/api/proxy/blog-posts?populate[categories]=*&populate[tags]=*&pagination[limit]=3`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Status: ${blogResponse.status}`);
      if (blogResponse.ok) {
        const blogData = await blogResponse.json();
        console.log(`✓ Found ${blogData.data?.length || 0} blog posts`);
        
        blogData.data?.forEach((post, i) => {
          const postData = post.attributes || post;
          console.log(`\nPost ${i + 1}: ${postData.title}`);
          
          if (postData.categories?.data) {
            console.log(`  Categories (${postData.categories.data.length}):`);
            postData.categories.data.forEach(cat => {
              const catData = cat.attributes || cat;
              console.log(`    - ${catData.name}`);
            });
          }
          
          if (postData.tags?.data) {
            console.log(`  Tags (${postData.tags.data.length}):`);
            postData.tags.data.slice(0, 3).forEach(tag => {
              const tagData = tag.attributes || tag;
              console.log(`    - ${tagData.name}`);
            });
            if (postData.tags.data.length > 3) {
              console.log(`    ... en ${postData.tags.data.length - 3} meer`);
            }
          }
        });
      } else {
        const errorText = await blogResponse.text();
        console.log('✗ Failed:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('✗ Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugCategoriesViaProxy(); 