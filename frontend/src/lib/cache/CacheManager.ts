import { ApiCache } from '../api/cache';

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  errors: number;
}

/**
 * Manages caching strategies for different types of content
 */
export class CacheManager {
  private static instance: CacheManager;
  private apiCache: ApiCache;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    errors: 0
  };

  private constructor() {
    this.apiCache = new ApiCache({
      maxEntries: 1000,
      onError: (error) => {
        console.error('[Cache Error]', error);
        this.stats.errors++;
      }
    });
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cached response or fetch from network
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    if (!config.enabled) {
      return fetchFn();
    }

    try {
      // Try to get from cache
      const cached = this.apiCache.get<CacheEntry<T>>(key);

      if (cached) {
        const now = Date.now();
        const isStale = now > cached.expiresAt;

        // Handle stale-while-revalidate
        if (isStale && config.staleWhileRevalidate) {
          this.stats.staleHits++;
          // Return stale data and revalidate in background
          this.revalidateInBackground(key, fetchFn, config);
          return cached.data;
        }

        if (!isStale) {
          this.stats.hits++;
          return cached.data;
        }
      }

      this.stats.misses++;
      return this.fetchAndCache(key, fetchFn, config);
    } catch (error) {
      console.error('[Cache Manager Error]', error);
      this.stats.errors++;
      return fetchFn();
    }
  }

  /**
   * Fetch data and store in cache
   */
  private async fetchAndCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const data = await fetchFn();
    const now = Date.now();

    this.apiCache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + config.ttl
    });

    return data;
  }

  /**
   * Revalidate stale cache entry in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    try {
      const data = await fetchFn();
      const now = Date.now();

      this.apiCache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + config.ttl
      });
    } catch (error) {
      console.error('[Cache Revalidation Error]', error);
      this.stats.errors++;
    }
  }

  /**
   * Prefetch and cache data
   */
  async prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    if (!config.enabled) return;

    try {
      await this.fetchAndCache(key, fetchFn, config);
    } catch (error) {
      console.error('[Cache Prefetch Error]', error);
      this.stats.errors++;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses + this.stats.staleHits;
    const hitRate = total > 0 ? (this.stats.hits + this.stats.staleHits) / total : 0;

    return {
      ...this.stats,
      hitRate
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.apiCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      errors: 0
    };
  }

  /**
   * Remove expired entries and update stats
   */
  cleanup(): void {
    this.apiCache.cleanup();
  }
}
