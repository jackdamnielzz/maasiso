/**
 * Cache invalidation service
 */
import { cacheConfig, invalidateCache } from '../cache';
import { cacheMonitor } from '../monitoring/cacheMonitor';

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
 * Check cache health and invalidate based on rules
 */
export function checkCacheHealth() {
  invalidationRules.forEach(rule => {
    const metrics = cacheMonitor.getTagPerformance(cacheConfig.content[rule.contentType].tag);
    
    if (rule.condition(metrics)) {
      invalidateCache(rule.contentType);
      console.log(`[Cache] Invalidated ${rule.contentType} due to poor performance:`, metrics);
    }
  });
}

/**
 * Schedule regular cache health checks
 */
export function scheduleCacheHealthChecks(intervalMs: number = 300000) { // Default: 5 minutes
  return setInterval(checkCacheHealth, intervalMs);
}

/**
 * Initialize cache monitoring and health checks
 */
export function initializeCacheMonitoring() {
  // Start health checks
  const healthCheckInterval = scheduleCacheHealthChecks();

  // Return cleanup function
  return () => {
    clearInterval(healthCheckInterval);
  };
}
