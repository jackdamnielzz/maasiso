const axios = require('axios');

const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

async function checkCategories() {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/categories?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('All categories in Strapi:');
    console.log('=======================');
    response.data.data.forEach(cat => {
      console.log(`- Name: ${cat.name}`);
      console.log(`  Slug: ${cat.slug}`);
      console.log(`  ID: ${cat.id}`);
      console.log(`  DocumentID: ${cat.documentId}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCategories(); 