import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://153.92.223.23:1337/graphql', {
  headers: {
    'Authorization': `Bearer [REDACTED_STRAPI_TOKEN]`,
  },
});

async function getSchema() {
  try {
    const query = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await client.request(query);
    console.log('Schema:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

getSchema();
