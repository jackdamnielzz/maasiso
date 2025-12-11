/**
 * Cache invalidation service has been deprecated
 * All content is now fetched directly from Strapi without caching
 * This file is kept for reference but its functionality is no longer used
 */

import { cacheMonitor } from '../monitoring/cacheMonitor';

interface ContentType {
  tag: string;
}

interface CacheConfig {
  content: {
    newsArticle: ContentType;
    blogPost: ContentType;
    page: ContentType;
  };
}

// Default config for monitoring purposes only
const cacheConfig: CacheConfig = {
  content: {
    newsArticle: { tag: 'news' },
    blogPost: { tag: 'blog' },
    page: { tag: 'page' }
  }
};

interface InvalidationRule {
  contentType: keyof typeof cacheConfig.content;
  condition: (metrics: ReturnType<typeof cacheMonitor.getTagPerformance>) => boolean;
}

const invalidationRules: InvalidationRule[] = [
  // Invalidate news articles with low hit rates
  {
    contentType: 'newsArticle',
    condition: (metrics) => 
      metrics !== null && metrics.hitRate < 0.3 && metrics.efficiency < 0.5
  },
  // Invalidate blog posts with poor performance
  {
    contentType: 'blogPost',
    condition: (metrics) =>
      metrics !== null && metrics.avgLoadTime > 800 && metrics.efficiency < 0.6
  },
  // Invalidate pages with very poor efficiency
  {
    contentType: 'page',
    condition: (metrics) =>
      metrics !== null && metrics.efficiency < 0.4
  }
];

/**
 * Check cache health and log metrics
 * Note: This no longer invalidates cache since caching is disabled
 */
export function checkCacheHealth() {
  invalidationRules.forEach(rule => {
    const metrics = cacheMonitor.getTagPerformance(cacheConfig.content[rule.contentType].tag);
    
    if (rule.condition(metrics)) {
      console.log(`[Performance] Poor metrics for ${String(rule.contentType)}:`, metrics);
    }
  });
}

/**
 * Schedule regular performance checks
 */
export function schedulePerformanceChecks(intervalMs: number = 300000) { // Default: 5 minutes
  return setInterval(checkCacheHealth, intervalMs);
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring() {
  // Start health checks
  const healthCheckInterval = schedulePerformanceChecks();

  // Return cleanup function
  return () => {
    clearInterval(healthCheckInterval);
  };
}
