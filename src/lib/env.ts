/**
 * Environment variable validation and typing
 * This module ensures all required environment variables are present and correctly typed
 */

export interface EnvVariables {
  // API Configuration
  apiUrl: string;
  siteUrl: string;
  
  // Authentication
  authUrl: string;
  authSecret: string;
  strapiToken: string;
  
  // GraphQL
  graphqlUrl: string;
  
  // Analytics
  googleAnalyticsId?: string;
  
  // Content Delivery
  cdnUrl?: string;
  
  // Feature Flags
  enableBlog: boolean;
  enableTools: boolean;
  enableWhitepapers: boolean;
}

function validateEnv(): EnvVariables {
  const requiredEnvs = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SITE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_GRAPHQL_URL',
    'STRAPI_API_TOKEN'
  ];

  // Check for missing required environment variables
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  if (missingEnvs.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
  }

  // Parse boolean feature flags with default values
  const parseBooleanEnv = (key: string, defaultValue: boolean): boolean => {
    const value = process.env[key]?.toLowerCase();
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
  };

  return {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    
    // Authentication
    authUrl: process.env.NEXTAUTH_URL!,
    authSecret: process.env.NEXTAUTH_SECRET!,
    strapiToken: process.env.STRAPI_API_TOKEN!,
    
    // GraphQL
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
    
    // Analytics (Optional)
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    
    // Content Delivery (Optional)
    cdnUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_CDN,
    
    // Feature Flags (with defaults)
    enableBlog: parseBooleanEnv('NEXT_PUBLIC_ENABLE_BLOG', true),
    enableTools: parseBooleanEnv('NEXT_PUBLIC_ENABLE_TOOLS', true),
    enableWhitepapers: parseBooleanEnv('NEXT_PUBLIC_ENABLE_WHITEPAPERS', true)
  };
}

// Export validated environment variables
export const env = validateEnv();

// Export individual variables for convenience
export const {
  apiUrl,
  siteUrl,
  authUrl,
  authSecret,
  strapiToken,
  graphqlUrl,
  googleAnalyticsId,
  cdnUrl,
  enableBlog,
  enableTools,
  enableWhitepapers
} = env;
