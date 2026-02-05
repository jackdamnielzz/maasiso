/**
 * @jest-environment node
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      API_URL: 'http://localhost:1337/api',
      SITE_URL: 'http://localhost:3000',
      GRAPHQL_URL: 'http://localhost:1337/graphql',
      NEXTAUTH_SECRET: 'test-secret',
      STRAPI_TOKEN: 'test-token',
      ENABLE_BLOG: 'true',
      ENABLE_TOOLS: 'true',
      DEBUG: 'false',
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
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
      debug: false,
    });
  });

  it('throws for missing required variables', async () => {
    delete process.env.API_URL;

    await expect(import('../env')).rejects.toThrow(
      'Environment Error: Missing required environment variable: API_URL'
    );
  });

  it('validates URL format', async () => {
    process.env.API_URL = 'invalid-url';

    await expect(import('../env')).rejects.toThrow(
      'Environment Error: Invalid URL for API_URL: invalid-url'
    );
  });

  it('validates URL protocol', async () => {
    process.env.API_URL = 'ftp://example.com';

    await expect(import('../env')).rejects.toThrow(
      'Environment Error: Invalid protocol for API_URL: ftp:'
    );
  });

  it('handles boolean environment variables', async () => {
    process.env.ENABLE_BLOG = 'true';
    process.env.ENABLE_TOOLS = '1';
    process.env.DEBUG = 'yes';

    const { env } = await import('../env');
    expect(env.enableBlog).toBe(true);
    expect(env.enableTools).toBe(true);
    expect(env.debug).toBe(true);
  });

  it('trims whitespace from values', async () => {
    process.env.API_URL = '  http://localhost:1337/api  ';

    const { env } = await import('../env');
    expect(env.apiUrl).toBe('http://localhost:1337/api');
  });
});
