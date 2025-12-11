interface CacheConfig {
  enabled: boolean;
  ttl: number;
  staleWhileRevalidate?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

/**
 * Simplified CacheManager that doesn't actually cache anything
 * This is a replacement for the previous caching system to ensure all content is fetched directly from Strapi
 */
export class CacheManager {
  private static instance: CacheManager;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0
  };

  private constructor() {
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Always fetches fresh data without caching
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    _config: CacheConfig
  ): Promise<T> {
    // Always fetch fresh data

    this.stats.misses++;
    return fetchFn();
  }

  /**
   * Prefetch function that just executes the fetch without caching
   */
  async prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    _config: CacheConfig
  ): Promise<void> {
    // Just execute the fetch without caching
    await fetchFn();
  }

  /**
   * Return empty stats
   */
  getStats(): CacheStats {
    return this.stats;
  }

  /**
   * No-op functions to maintain API compatibility
   */
  clear(): void {
  }
  cleanup(): void {}
}
