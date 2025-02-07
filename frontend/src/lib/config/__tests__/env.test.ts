import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Environment Configuration', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear module cache to ensure fresh env loading
    jest.resetModules();
    // Setup base environment variables
    process.env = {
      NEXT_PUBLIC_API_URL: 'http://localhost:1337/api',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_GRAPHQL_URL: 'http://localhost:1337/graphql',
      NEXTAUTH_SECRET: 'test-secret',
      NEXT_PUBLIC_STRAPI_TOKEN: 'test-token',
      NEXT_PUBLIC_ENABLE_BLOG: 'true',
      NEXT_PUBLIC_ENABLE_TOOLS: 'true',
      NEXT_PUBLIC_DEBUG: 'false',
      NODE_ENV: 'test'
    };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('loads valid environment configuration', async () => {
    const { env } = await import('../env');
    expect(env).toEqual({
      apiUrl: 'http://localhost:1337/api',
      siteUrl: 'http://localhost:3000',
      graphqlUrl: 'http://localhost:1337/graphql',
      authSecret: 'test-secret',
      strapiToken: 'test-token',
      enableBlog: true,
      enableTools: true,
      debug: false
    });
  });

  it('throws error for missing required variables', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    
    await expect(import('../env')).rejects.toThrow(
      'Environment Error: Missing required environment variable: NEXT_PUBLIC_API_URL'
    );
  });

  it('validates URL format', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'invalid-url';
    
    await expect(import('../env')).rejects.toThrow(
      'Environment Error: Invalid URL for NEXT_PUBLIC_API_URL: invalid-url'
    );
  });

  it('validates URL protocol', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'ftp://example.com';
    
    await expect(import('../env')).rejects.toThrow(
      'Environment Error: Invalid protocol for NEXT_PUBLIC_API_URL: ftp:'
    );
  });

  it('handles boolean environment variables correctly', async () => {
    // Test various truthy values
    process.env.NEXT_PUBLIC_ENABLE_BLOG = 'true';
    process.env.NEXT_PUBLIC_ENABLE_TOOLS = '1';
    process.env.NEXT_PUBLIC_DEBUG = 'yes';
    
    const { env } = await import('../env');
    expect(env.enableBlog).toBe(true);
    expect(env.enableTools).toBe(true);
    expect(env.debug).toBe(true);
  });

  it('trims whitespace from environment variables', async () => {
    process.env.NEXT_PUBLIC_API_URL = '  http://localhost:1337/api  ';
    
    const { env } = await import('../env');
    expect(env.apiUrl).toBe('http://localhost:1337/api');
  });
});
