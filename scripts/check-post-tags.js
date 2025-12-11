const axios = require('axios');

const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

async function checkPosts() {
  try {
    // Haal de eerste 5 posts op
    const response = await axios.get(`${STRAPI_URL}/api/blog-posts?pagination[limit]=5&populate[categories]=true&populate[tags]=true`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Blog Post Categorization Results:');
    console.log('==================================\n');

    response.data.data.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Category: ${post.categories?.map(c => c.name).join(', ') || 'None'}`);
      console.log(`   Tags (${post.tags?.length || 0}): ${post.tags?.map(t => t.name).join(', ') || 'None'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPosts(); 