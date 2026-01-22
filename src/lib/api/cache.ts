import { clientEnv } from '../config/client-env';

/**
 * Error thrown when cache operations fail
 */
export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

/**
 * Type guard to ensure a value is a valid cache key
 */
function isValidKey(key: unknown): key is string {
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * Represents a cached entry with its metadata
 */
interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** Timestamp when the entry expires */
  expiresAt: number;
}

/**
 * Configuration options for the cache
 */
interface CacheOptions {
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Maximum number of entries to store (default: 100) */
  maxEntries?: number;
  /** Optional error handler */
  onError?: (error: CacheError) => void;
}

/**
 * API Cache implementation with strict type safety
 */
export class ApiCache {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly DEFAULT_MAX_ENTRIES = 100;
  private static readonly PREFIX = 'api-cache:';
  
  private readonly cache: Map<string, CacheEntry<unknown>>;
  private readonly ttl: number;
  private readonly maxEntries: number;
  private readonly options: CacheOptions;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl ?? ApiCache.DEFAULT_TTL;
    this.maxEntries = options.maxEntries ?? ApiCache.DEFAULT_MAX_ENTRIES;
    this.options = options;
  }

  /**
   * Creates a valid cache key from the input
   * @throws {CacheError} if the key is invalid
   */
  private createCacheKey(key: string | undefined | null): string {
    if (!isValidKey(key)) {
      throw new CacheError('Cache key must be a non-empty string');
    }
    return `${ApiCache.PREFIX}${key}`;
  }

  /**
   * Checks if a cache entry has expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Ensures the cache doesn't exceed its maximum size
   */
  private ensureCacheSize(): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or undefined if not found/expired
   */
  get<T>(key: string | undefined | null): T | undefined {
    try {
      if (!isValidKey(key)) return undefined;
      
      const cacheKey = this.createCacheKey(key);
      const entry = this.cache.get(cacheKey) as CacheEntry<T> | undefined;

      if (!entry) return undefined;

      if (this.isExpired(entry)) {
        this.cache.delete(cacheKey);
        return undefined;
      }

      return entry.data ?? undefined;
    } catch (error) {
      if (error instanceof CacheError) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttl - Optional TTL override
   */
  set<T>(key: string | undefined | null, data: T, ttl?: number): void {
    try {
      if (!isValidKey(key)) {
        this.options.onError?.(new CacheError('Cache key must be a non-empty string'));
        return;
      }
      if (data === undefined) return;
      
      // Validate data structure
      if (typeof data === 'object' && data !== null && Object.keys(data).length === 0) {
        this.options.onError?.(new CacheError('Refusing to cache empty object'));
        return;
      }

      const cacheKey = this.createCacheKey(key);
      const timestamp = Date.now();
      const expiresAt = timestamp + (ttl ?? this.ttl);

      this.ensureCacheSize();

      this.cache.set(cacheKey, {
        data,
        timestamp,
        expiresAt
      });
    } catch (error) {
      if (error instanceof CacheError) {
        this.options.onError?.(error);
      }
    }
  }

  /**
   * Remove a value from the cache
   * @param key - The cache key
   */
  delete(key: string | undefined | null): void {
    try {
      if (!isValidKey(key)) {
        this.options.onError?.(new CacheError('Cache key must be a non-empty string'));
        return;
      }
      const cacheKey = this.createCacheKey(key);
      this.cache.delete(cacheKey);
    } catch (error) {
      if (!(error instanceof CacheError)) {
        throw error;
      }
    }
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    activeEntries: number;
  } {
    const activeEntries = Array.from(this.cache.values()).filter(
      entry => !this.isExpired(entry)
    ).length;

    return {
      size: this.cache.size,
      maxSize: this.maxEntries,
      activeEntries
    };
  }

  /**
   * Remove all expired entries from the cache
   */
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance with default options
export const apiCache = new ApiCache();

export interface FetchOptions extends RequestInit {
  cacheOptions?: {
    enabled: boolean;
    ttl: number;
    staleWhileRevalidate?: boolean;
  };
}

// Fetch options for static content (rarely changes)
export function getStaticFetchOptions(contentType: string): FetchOptions {
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_STRAPI_TOKEN is not set');
  }
  return {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    credentials: 'same-origin',
    cacheOptions: {
      enabled: true,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      staleWhileRevalidate: true
    }
  };
}

// Fetch options for list views (changes more frequently)
export function getListFetchOptions(contentType: string): FetchOptions {
  return {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${clientEnv.strapiToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    credentials: 'same-origin',
    cacheOptions: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: true
    }
  };
}

// Fetch options for dynamic content (changes frequently)
export function getDynamicFetchOptions(): FetchOptions {
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_STRAPI_TOKEN is not set');
  }
  return {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    credentials: 'same-origin',
    cacheOptions: {
      enabled: true,
      ttl: 60 * 1000, // 1 minute
      staleWhileRevalidate: true
    }
  };
}
