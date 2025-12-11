require('dotenv').config({ path: '.env.local' });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://153.92.223.23:1337';

async function debugCategoriesTags() {
  try {
    console.log('🔍 Debugging Categories and Tags (Simple)...\n');
    console.log(`Strapi URL: ${STRAPI_URL}\n`);

    // Fetch all categories
    const categoriesResponse = await fetch(
      `${STRAPI_URL}/api/categories?sort=name:asc`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Categories response status: ${categoriesResponse.status}`);

    if (!categoriesResponse.ok) {
      const errorText = await categoriesResponse.text();
      console.log('Categories error response:', errorText);
      throw new Error(`Categories fetch failed: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
    }

    const categoriesData = await categoriesResponse.json();
    console.log('📁 CATEGORIES:');
    console.log(`Total categories: ${categoriesData.data?.length || 0}`);
    
    if (categoriesData.data && categoriesData.data.length > 0) {
      categoriesData.data.forEach(cat => {
        const categoryData = cat.attributes || cat;
        console.log(`- ${categoryData.name} (${categoryData.slug})`);
      });
    } else {
      console.log('No categories found!');
    }

    console.log('\n');

    // Fetch all tags
    const tagsResponse = await fetch(
      `${STRAPI_URL}/api/tags?sort=name:asc`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Tags response status: ${tagsResponse.status}`);

    if (!tagsResponse.ok) {
      const errorText = await tagsResponse.text();
      console.log('Tags error response:', errorText);
      throw new Error(`Tags fetch failed: ${tagsResponse.status} ${tagsResponse.statusText}`);
    }

    const tagsData = await tagsResponse.json();
    console.log('🏷️  TAGS:');
    console.log(`Total tags: ${tagsData.data?.length || 0}`);
    
    if (tagsData.data && tagsData.data.length > 0) {
      // Show first 20 tags
      const tagsToShow = tagsData.data.slice(0, 20);
      tagsToShow.forEach(tag => {
        const tagData = tag.attributes || tag;
        console.log(`- ${tagData.name}`);
      });
      
      if (tagsData.data.length > 20) {
        console.log(`... and ${tagsData.data.length - 20} more tags`);
      }
    } else {
      console.log('No tags found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

debugCategoriesTags(); 