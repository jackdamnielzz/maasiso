import { cachedFetch } from '../cache/cachedFetch';
import { FetchOptions } from './cache';
import { RetryConfig } from '../retry';

/**
 * Make an API request with caching support
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  const response = await cachedFetch(endpoint, url, options, retryConfig);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Prefetch an API request into cache
 */
export async function prefetchApiRequest(
  endpoint: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  await cachedFetch(endpoint, url, options, retryConfig);
}

export type { FetchOptions } from './cache';
export { 
  getStaticFetchOptions,
  getListFetchOptions,
  getDynamicFetchOptions
} from './cache';
