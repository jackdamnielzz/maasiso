require('dotenv').config({ path: '.env.local' });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://153.92.223.23:1337';

async function debugCategoriesTags() {
  try {
    console.log('🔍 Debug Categories and Tags API\n');
    console.log(`Strapi URL: ${STRAPI_URL}\n`);

    // Test 1: Simple categories fetch
    console.log('1️⃣ Testing simple categories fetch...');
    const categoriesResponse = await fetch(
      `${STRAPI_URL}/api/categories?sort=name:asc`,
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
        console.log('First category:', JSON.stringify(categoriesData.data[0], null, 2));
      }
    } else {
      console.log('✗ Failed to fetch categories');
    }

    // Test 2: Categories with blog_posts populate
    console.log('\n2️⃣ Testing categories with blog_posts populate...');
    const categoriesWithPostsResponse = await fetch(
      `${STRAPI_URL}/api/categories?populate=blog_posts&sort=name:asc`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Status: ${categoriesWithPostsResponse.status}`);
    if (categoriesWithPostsResponse.ok) {
      const data = await categoriesWithPostsResponse.json();
      const firstCat = data.data?.[0];
      if (firstCat) {
        const catData = firstCat.attributes || firstCat;
        console.log(`✓ First category: ${catData.name}`);
        console.log(`  Has blog_posts field: ${!!catData.blog_posts}`);
        console.log(`  blog_posts structure: ${JSON.stringify(catData.blog_posts, null, 2)}`);
      }
    } else {
      console.log('✗ Failed with populate=blog_posts');
    }

    // Test 3: Blog posts with categories
    console.log('\n3️⃣ Testing blog posts with categories...');
    const blogPostsResponse = await fetch(
      `${STRAPI_URL}/api/blog-posts?populate[categories]=*&pagination[limit]=5`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Status: ${blogPostsResponse.status}`);
    if (blogPostsResponse.ok) {
      const blogData = await blogPostsResponse.json();
      console.log(`✓ Found ${blogData.data?.length || 0} blog posts`);
      
      // Count categories across all posts
      const categoryCount = new Map();
      blogData.data?.forEach((post, i) => {
        const postData = post.attributes || post;
        console.log(`\nPost ${i + 1}: ${postData.title}`);
        
        if (postData.categories?.data) {
          console.log(`  Categories: ${postData.categories.data.length}`);
          postData.categories.data.forEach(cat => {
            const catData = cat.attributes || cat;
            const slug = catData.slug;
            categoryCount.set(slug, (categoryCount.get(slug) || 0) + 1);
            console.log(`    - ${catData.name} (${slug})`);
          });
        } else {
          console.log('  No categories');
        }
      });

      console.log('\n📊 Category usage summary:');
      categoryCount.forEach((count, slug) => {
        console.log(`  ${slug}: ${count} posts`);
      });
    } else {
      console.log('✗ Failed to fetch blog posts');
    }

    // Test 4: Tags
    console.log('\n4️⃣ Testing tags...');
    const tagsResponse = await fetch(
      `${STRAPI_URL}/api/tags?sort=name:asc&pagination[limit]=10`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Status: ${tagsResponse.status}`);
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json();
      console.log(`✓ Found ${tagsData.data?.length || 0} tags (showing first 10)`);
      
      tagsData.data?.forEach(tag => {
        const tagData = tag.attributes || tag;
        console.log(`  - ${tagData.name}`);
      });
    } else {
      console.log('✗ Failed to fetch tags');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

debugCategoriesTags(); 