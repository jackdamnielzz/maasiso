import { monitoredFetch } from '../monitoredFetch';
import { FetchOptions } from '../api/cache';
import { RetryConfig } from '../retry';

/**
 * Direct fetch without caching - replacement for the previous cachedFetch
 * This ensures all content is always fetched directly from Strapi
 */
export async function cachedFetch(
  endpoint: string,
  url: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<Response> {
  // Ensure no caching by adding cache: 'no-store' to options
  const noStoreOptions = {
    ...options,
    cache: 'no-store' as RequestCache,
    headers: {
      ...options?.headers,
      'Cache-Control': 'no-store, must-revalidate'
    }
  };
  
  // Direct fetch without caching
  return monitoredFetch(endpoint, url, noStoreOptions, retryConfig);

}

/**
 * Prefetch function - now just performs a direct fetch without caching
 */
export async function prefetchRequest(
  endpoint: string,
  url: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<void> {
  // Just perform a direct fetch without caching
  await cachedFetch(endpoint, url, options, retryConfig);
}

/**
 * Stub functions to maintain API compatibility
 */
export const getCacheStats = () => ({ hits: 0, misses: 0, size: 0 });
export const clearCache = () => {};
export const cleanupCache = () => {};
