const axios = require('axios');

// Strapi configuratie
const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

// Functie om alle blog posts op te halen
async function fetchAllBlogPosts() {
  const allPosts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(`${STRAPI_URL}/api/blog-posts`, {
        params: {
          'pagination[page]': page,
          'pagination[pageSize]': 25,
          'populate': '*'
        },
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const posts = response.data.data;
      allPosts.push(...posts);

      const pagination = response.data.meta.pagination;
      hasMore = page < pagination.pageCount;
      page++;

      console.log(`Fetched page ${page - 1} of ${pagination.pageCount} (${posts.length} posts)`);
    } catch (error) {
      console.error('Error fetching blog posts:', error.response?.data || error.message);
      hasMore = false;
    }
  }

  return allPosts;
}

// Functie om categorieën en tags van een blog post te wissen
async function clearBlogPostCategoriesAndTags(documentId) {
  try {
    const updateData = {
      data: {
        categories: [], // Leeg array om alle categorieën te verwijderen
        tags: []       // Leeg array om alle tags te verwijderen
      }
    };

    const response = await axios.put(
      `${STRAPI_URL}/api/blog-posts/${documentId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error clearing post ${documentId}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Hoofdfunctie
async function clearAllBlogPostsCategoriesAndTags() {
  console.log('Starting to clear all blog post categories and tags...\n');

  // Haal alle blog posts op
  console.log('Fetching all blog posts...');
  const posts = await fetchAllBlogPosts();
  console.log(`Found ${posts.length} blog posts to process\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  // Verwerk elke post
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const attributes = post.attributes || post;
    const title = attributes.title || 'Untitled';
    
    console.log(`[${i + 1}/${posts.length}] Clearing: "${title}"`);

    // Wis categorieën en tags
    const documentId = post.documentId || post.id;
    const result = await clearBlogPostCategoriesAndTags(documentId);
    
    if (result.success) {
      results.success++;
      console.log('  ✓ Cleared successfully');
    } else {
      results.failed++;
      results.errors.push({
        post: attributes.title,
        error: result.error
      });
      console.log('  ✗ Failed to clear');
    }

    // Kleine delay om de API niet te overbelasten
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Rapport
  console.log('\n' + '='.repeat(50));
  console.log('CLEARING COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total posts processed: ${posts.length}`);
  console.log(`Successfully cleared: ${results.success}`);
  console.log(`Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => {
      console.log(`- ${err.post}: ${JSON.stringify(err.error)}`);
    });
  }

  console.log('\nDone!');
}

// Start het script
clearAllBlogPostsCategoriesAndTags().catch(console.error); 