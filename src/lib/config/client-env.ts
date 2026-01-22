/**
 * Client-side environment configuration
 * Only handles NEXT_PUBLIC_* environment variables that are safe to expose to the client
 */

interface ClientEnvConfig {
  // API Configuration
  apiUrl: string;
  siteUrl: string;
  graphqlUrl: string;
  strapiToken: string;

  // Feature Flags
  enableBlog: boolean;
  enableTools: boolean;

  // Debug Mode
  debug: boolean;
}

function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase().trim();
  if (value === undefined || value === '') return defaultValue;
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  return defaultValue;
}

// Helper function to get and format the Strapi token
function getStrapiToken(): string {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    if (!token) {
      throw new Error('NEXT_PUBLIC_STRAPI_TOKEN is not set');
    }
    // Just trim whitespace, let monitoredFetch handle Bearer prefix
    const formattedToken = token.trim();
    if (!formattedToken) {
      throw new Error('NEXT_PUBLIC_STRAPI_TOKEN is empty');
    }
    return formattedToken;
  } catch (error) {
    throw new Error(`Strapi token configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Load client-side environment configuration
const config: ClientEnvConfig = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
  strapiToken: (() => {
    try {
      return getStrapiToken();
    } catch (error) {
      console.error('Failed to initialize Strapi token:', error);
      // In production, we want to fail fast if token is missing
      if (process.env.NODE_ENV === 'production') throw error;
      return '';
    }
  })(),

  // Feature Flags with defaults
  enableBlog: getBooleanEnv('NEXT_PUBLIC_ENABLE_BLOG', true),
  enableTools: getBooleanEnv('NEXT_PUBLIC_ENABLE_TOOLS', true),

  // Debug Mode
  debug: getBooleanEnv('NEXT_PUBLIC_DEBUG', false),
};

// Debug helper
// Validate required configuration
if (!config.apiUrl) {
  console.warn('NEXT_PUBLIC_API_URL is required');
}

if (!config.strapiToken && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXT_PUBLIC_STRAPI_TOKEN is required for client-side API access in production. ' +
    'Please ensure the token is properly configured in your environment variables. ' +
    'Check the deployment documentation for more information.'
  );
}

if (config.debug) {
  console.log('Environment Configuration:', {
    apiUrl: config.apiUrl,
    siteUrl: config.siteUrl,
    graphqlUrl: config.graphqlUrl,
    strapiToken: config.strapiToken ? '[REDACTED]' : 'MISSING',
    enableBlog: config.enableBlog,
    enableTools: config.enableTools,
    debug: config.debug,
  });
}

export const clientEnv = config;
