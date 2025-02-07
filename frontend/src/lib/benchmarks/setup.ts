import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({
  path: resolve(__dirname, '../../../.env.test')
});

// Set default environment variables if not provided
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-do-not-use-in-production';
process.env.NEXT_PUBLIC_GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:1337/graphql';
process.env.STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || 'test-token-do-not-use-in-production';
