/**
 * Server-side environment configuration with validation and fallbacks
 * This module ensures all required environment variables are present and correctly typed
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  siteUrl: string;
  graphqlUrl: string;
  
  // Authentication
  authSecret: string;
  strapiToken: string;
  
  // Feature Flags
  enableBlog: boolean;
  enableTools: boolean;
  
  // Debug Mode
  debug: boolean;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(`Environment Error: ${message}`);
    this.name = 'EnvironmentError';
  }
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (!value && required) {
    const error = new EnvironmentError(`Missing required environment variable: ${key}`);
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Environment variable error:', {
        missingKey: key,
        availableKeys: Object.keys(process.env).filter(k => !k.startsWith('NEXT_PUBLIC_')),
        nodeEnv: process.env.NODE_ENV
      });
    }
    throw error;
  }
  
  // Trim whitespace to prevent common issues
  return (value || '').trim();
}

function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase().trim();
  if (value === undefined || value === '') return defaultValue;
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  
  // Log warning for invalid boolean values in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Invalid boolean value for ${key}: "${value}". Using default: ${defaultValue}`);
  }
  return defaultValue;
}

/**
 * Validates and loads environment configuration
 * This should only be used in server-side code
 */
function loadEnvConfig(): EnvConfig {
  if (typeof window !== 'undefined') {
    throw new Error('Server-side environment config accessed from client-side code');
  }

  try {
    // API Configuration
    const apiUrl = getEnvVar('API_URL');
    const siteUrl = getEnvVar('SITE_URL');
    const graphqlUrl = getEnvVar('GRAPHQL_URL');

    // Validate URLs with detailed error messages
    const urlValidations = [
      { url: apiUrl, name: 'API_URL' },
      { url: siteUrl, name: 'SITE_URL' },
      { url: graphqlUrl, name: 'GRAPHQL_URL' }
    ];

    urlValidations.forEach(({ url, name }) => {
      try {
        const parsedUrl = new URL(url);
        // Additional URL validation
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new EnvironmentError(`Invalid protocol for ${name}: ${parsedUrl.protocol}`);
        }
      } catch (error) {
        if (error instanceof EnvironmentError) throw error;
        throw new EnvironmentError(`Invalid URL for ${name}: ${url}`);
      }
    });

    // Authentication
    const authSecret = getEnvVar('NEXTAUTH_SECRET');
    const strapiToken = getEnvVar('STRAPI_TOKEN');

    // Feature Flags with defaults
    const enableBlog = getBooleanEnv('ENABLE_BLOG', true);
    const enableTools = getBooleanEnv('ENABLE_TOOLS', true);

    // Debug Mode
    const debug = getBooleanEnv('DEBUG', false);

    return {
      apiUrl,
      siteUrl,
      graphqlUrl,
      authSecret,
      strapiToken,
      enableBlog,
      enableTools,
      debug,
    };
  } catch (error) {
    // Log the error for debugging
    console.error('Environment configuration error:', error);
    
    // In development, provide more detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.error('Current environment variables:', {
        API_URL: process.env.API_URL,
        SITE_URL: process.env.SITE_URL,
        GRAPHQL_URL: process.env.GRAPHQL_URL,
        // Exclude sensitive variables from logging
      });
    }
    
    throw error;
  }
}

// Create and validate environment configuration
const config = loadEnvConfig();

// Debug helper
if (config.debug) {
  console.log('Environment Configuration:', {
    apiUrl: config.apiUrl,
    siteUrl: config.siteUrl,
    graphqlUrl: config.graphqlUrl,
    enableBlog: config.enableBlog,
    enableTools: config.enableTools,
    debug: config.debug,
    // Exclude sensitive information
  });
}

// Export configuration
export const env = config;
