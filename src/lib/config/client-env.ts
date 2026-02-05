/**
 * Client-side environment configuration
 * Only handles NEXT_PUBLIC_* environment variables that are safe to expose to the client
 */

interface ClientEnvConfig {
  // API Configuration
  apiUrl: string;
  siteUrl: string;
  graphqlUrl: string;

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

// Load client-side environment configuration
const config: ClientEnvConfig = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',

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

if (config.debug) {
  console.log('Environment Configuration:', {
    apiUrl: config.apiUrl,
    siteUrl: config.siteUrl,
    graphqlUrl: config.graphqlUrl,
    enableBlog: config.enableBlog,
    enableTools: config.enableTools,
    debug: config.debug,
  });
}

export const clientEnv = config;
