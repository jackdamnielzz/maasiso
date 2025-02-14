import { CacheManager } from './CacheManager';
import { monitoredFetch } from '../monitoredFetch';
import { FetchOptions } from '../api/cache';
import { RetryConfig } from '../retry';

/**
 * Creates a cache key from request details
 */
function createCacheKey(endpoint: string, url: string, options?: FetchOptions): string {
  const parts = [
    endpoint,
    url,
    options?.method || 'GET',
    options?.body ? JSON.stringify(options.body) : ''
  ];
  return parts.join('::');
}

/**
 * Wraps monitoredFetch with caching capabilities
 */
export async function cachedFetch(
  endpoint: string,
  url: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<Response> {
  const cacheManager = CacheManager.getInstance();
  const cacheKey = createCacheKey(endpoint, url, options);

  // Skip cache for non-GET requests
  if (options?.method && options.method !== 'GET') {
    return monitoredFetch(endpoint, url, options, retryConfig);
  }

  // Skip cache if explicitly disabled
  if (options?.cacheOptions?.enabled === false) {
    return monitoredFetch(endpoint, url, options, retryConfig);
  }

  const fetchFn = () => monitoredFetch(endpoint, url, options, retryConfig);

  // Use cache manager to handle caching strategy
  const response = await cacheManager.getOrFetch<Response>(
    cacheKey,
    fetchFn,
    {
      enabled: true,
      ttl: options?.cacheOptions?.ttl || 5 * 60 * 1000, // Default 5 minutes
      staleWhileRevalidate: options?.cacheOptions?.staleWhileRevalidate
    }
  );

  // Clone response to ensure it can be read multiple times
  return response.clone();
}

/**
 * Prefetch and cache a request
 */
export async function prefetchRequest(
  endpoint: string,
  url: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<void> {
  const cacheManager = CacheManager.getInstance();
  const cacheKey = createCacheKey(endpoint, url, options);

  // Skip prefetch for non-GET requests
  if (options?.method && options.method !== 'GET') return;

  // Skip prefetch if cache disabled
  if (options?.cacheOptions?.enabled === false) return;

  const fetchFn = () => monitoredFetch(endpoint, url, options, retryConfig);

  await cacheManager.prefetch(
    cacheKey,
    fetchFn,
    {
      enabled: true,
      ttl: options?.cacheOptions?.ttl || 5 * 60 * 1000,
      staleWhileRevalidate: options?.cacheOptions?.staleWhileRevalidate
    }
  );
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return CacheManager.getInstance().getStats();
}

/**
 * Clear cache
 */
export function clearCache() {
  CacheManager.getInstance().clear();
}

/**
 * Clean up expired cache entries
 */
export function cleanupCache() {
  CacheManager.getInstance().cleanup();
}
