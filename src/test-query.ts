import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://153.92.223.23:1337/graphql', {
  headers: {
    'Authorization': `Bearer [REDACTED_STRAPI_TOKEN]`,
  },
});

async function testQuery() {
  try {
    const query = `
      query {
        events {
          title
          description
          location
          eventDate
        }
      }
    `;
    
    const response = await client.request(query);
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();
