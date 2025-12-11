const axios = require('axios');

const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

async function testUpdate() {
  try {
    // Test met de eerste blog post
    const postDocumentId = 'suwk94qzg21bcolnh5lpo12y';
    
    // Gebruik de documentId's van categorieën in plaats van id's
    const categoryDocumentId = 'nqr3ptcn3715geyu6hlfbgg5'; // ISO 9001 Kwaliteitsmanagement
    
    // Probeer verschillende manieren om de data te sturen
    console.log('Test 1: Update met documentId in array');
    let response = await axios.put(
      `${STRAPI_URL}/api/blog-posts/${postDocumentId}`,
      {
        data: {
          categories: [categoryDocumentId]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Response:', response.data);
    
    // Check het resultaat
    const checkResponse = await axios.get(
      `${STRAPI_URL}/api/blog-posts/${postDocumentId}?populate=categories`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\nCategories after update:', JSON.stringify(checkResponse.data.data.categories, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testUpdate(); 