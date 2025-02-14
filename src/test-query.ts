import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://153.92.223.23:1337/graphql', {
  headers: {
    'Authorization': `Bearer cff7eeae750583ce173da8532bcc487b945174d088f405f95ebc9a3a8f34c43c6897ea290d39c3048ce97be337b256b703b77cef106f71dc2578d10fe7f8acf4a662cb8dc1ea20bc67f4fa5939beeb0032ef4deecda0d82780f8b565af7170128f46f6c03a16010d7e5f2ead7e9d2109adfde2152a85f2ee45d800ac596c80ec`,
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
