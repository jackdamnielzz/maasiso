/**
 * Cache configuration for different content types
 */
export const cacheConfig = {
  // Content types with specific caching strategies
  content: {
    blogPost: {
      revalidate: 3600, // 1 hour
      tag: 'blog-post',
      priority: 'high',
    },
    newsArticle: {
      revalidate: 1800, // 30 minutes (news needs fresher content)
      tag: 'news-article',
      priority: 'high',
    },
    page: {
      revalidate: 86400, // 24 hours (static pages change less frequently)
      tag: 'page',
      priority: 'medium',
    },
  },
  // Assets with specific caching rules
  assets: {
    images: {
      revalidate: 604800, // 7 days
      tag: 'image',
      priority: 'high',
      maxAge: 2592000, // 30 days max age
    },
    fonts: {
      revalidate: 2592000, // 30 days
      tag: 'font',
      priority: 'medium',
      maxAge: 7776000, // 90 days max age
    },
  },
  // Navigation and UI elements
  ui: {
    menu: {
      revalidate: 3600, // 1 hour
      tag: 'menu',
      priority: 'high',
    },
    socialLinks: {
      revalidate: 86400, // 24 hours
      tag: 'social-link',
      priority: 'low',
    },
  },
  // Dynamic content that shouldn't be cached
  dynamic: {
    cache: 'no-store' as const,
  },
} as const;

// Cache monitoring metrics
interface CacheMetrics {
  hits: number;
  misses: number;
  timestamp: number;
}

const cacheMetrics: Record<string, CacheMetrics> = {};

/**
 * Get fetch options for content types with specific caching rules
 */
export function getContentFetchOptions(
  type: keyof typeof cacheConfig.content,
  options: { priority?: 'high' | 'medium' | 'low' } = {}
) {
  const config = cacheConfig.content[type];
  return {
    next: {
      revalidate: config.revalidate,
      tags: [config.tag],
    },
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      'Cache-Priority': options.priority || config.priority,
    },
  };
}

/**
 * Get fetch options for assets with specific caching rules
 */
export function getAssetFetchOptions(
  type: keyof typeof cacheConfig.assets,
  options: { priority?: 'high' | 'medium' | 'low' } = {}
) {
  const config = cacheConfig.assets[type];
  return {
    next: {
      revalidate: config.revalidate,
      tags: [config.tag],
    },
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      'Cache-Priority': options.priority || config.priority,
      'Cache-Control': `public, max-age=${config.maxAge}`,
    },
  };
}

/**
 * Get fetch options for dynamic content (no caching)
 */
export function getDynamicFetchOptions() {
  return {
    ...cacheConfig.dynamic,
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      'Cache-Control': 'no-store, must-revalidate',
    },
  };
}

/**
 * Get fetch options for list pages with pagination and monitoring
 */
export function getListFetchOptions(
  type: keyof typeof cacheConfig.content,
  options: { priority?: 'high' | 'medium' | 'low' } = {}
) {
  const config = cacheConfig.content[type];
  const tag = config.tag;
  
  // Track cache metrics
  trackCacheMetric(tag);

  return {
    next: {
      revalidate: config.revalidate / 2, // Revalidate lists more frequently
      tags: [tag],
    },
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      'Cache-Priority': options.priority || config.priority,
    },
  };
}

/**
 * Helper to generate cache tags for specific items with monitoring
 */
export function generateItemTag(type: keyof typeof cacheConfig.content, id: string) {
  const tag = `${cacheConfig.content[type].tag}-${id}`;
  trackCacheMetric(tag);
  return tag;
}

/**
 * Track cache effectiveness metrics
 */
function trackCacheMetric(tag: string, isHit: boolean = true) {
  const now = Date.now();
  if (!cacheMetrics[tag]) {
    cacheMetrics[tag] = { hits: 0, misses: 0, timestamp: now };
  }
  
  if (isHit) {
    cacheMetrics[tag].hits++;
  } else {
    cacheMetrics[tag].misses++;
  }
  cacheMetrics[tag].timestamp = now;
}

/**
 * Get cache effectiveness metrics
 */
export function getCacheMetrics() {
  return cacheMetrics;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache() {
  const now = Date.now();
  Object.entries(cacheMetrics).forEach(([tag, metrics]) => {
    // Clear metrics older than 24 hours
    if (now - metrics.timestamp > 86400000) {
      delete cacheMetrics[tag];
    }
  });
}
