/**
 * Enhanced cache monitoring system
 */

interface CacheMetric {
  hits: number;
  misses: number;
  timestamp: number;
  loadTime: number;
  size: number;
  lastInvalidation?: number;
}

interface CachePerformance {
  hitRate: number;
  avgLoadTime: number;
  totalSize: number;
  efficiency: number;
}

class CacheMonitor {
  private metrics: Record<string, CacheMetric> = {};
  private readonly METRICS_RETENTION = 86400000; // 24 hours in milliseconds

  /**
   * Track a cache event with performance data
   */
  trackEvent(tag: string, options: {
    isHit: boolean;
    loadTime: number;
    size: number;
  }) {
    const now = Date.now();
    
    if (!this.metrics[tag]) {
      this.metrics[tag] = {
        hits: 0,
        misses: 0,
        timestamp: now,
        loadTime: 0,
        size: options.size
      };
    }

    const metric = this.metrics[tag];
    
    if (options.isHit) {
      metric.hits++;
    } else {
      metric.misses++;
    }

    // Update rolling average of load time
    metric.loadTime = (metric.loadTime * (metric.hits + metric.misses - 1) + options.loadTime) / 
                     (metric.hits + metric.misses);
    metric.timestamp = now;
    metric.size = options.size;
  }

  /**
   * Calculate cache effectiveness for a specific tag
   */
  getTagPerformance(tag: string): CachePerformance | null {
    const metric = this.metrics[tag];
    if (!metric) return null;

    const total = metric.hits + metric.misses;
    if (total === 0) return null;

    return {
      hitRate: metric.hits / total,
      avgLoadTime: metric.loadTime,
      totalSize: metric.size,
      efficiency: this.calculateEfficiency(metric)
    };
  }

  /**
   * Get overall cache performance metrics
   */
  getOverallPerformance(): CachePerformance {
    let totalHits = 0;
    let totalMisses = 0;
    let totalLoadTime = 0;
    let totalSize = 0;
    let count = 0;

    Object.values(this.metrics).forEach(metric => {
      totalHits += metric.hits;
      totalMisses += metric.misses;
      totalLoadTime += metric.loadTime;
      totalSize += metric.size;
      count++;
    });

    const avgLoadTime = count > 0 ? totalLoadTime / count : 0;
    const hitRate = (totalHits + totalMisses) > 0 ? 
      totalHits / (totalHits + totalMisses) : 0;

    return {
      hitRate,
      avgLoadTime,
      totalSize,
      efficiency: hitRate * (1 - (avgLoadTime / 1000)) // Efficiency formula considering hit rate and load time
    };
  }

  /**
   * Calculate cache efficiency score (0-1)
   * Considers hit rate, load time, and age of cache
   */
  private calculateEfficiency(metric: CacheMetric): number {
    const total = metric.hits + metric.misses;
    if (total === 0) return 0;

    const hitRate = metric.hits / total;
    const loadTimeScore = 1 - (metric.loadTime / 1000); // Normalize load time (assume 1s is worst)
    const freshnessScore = this.calculateFreshnessScore(metric.timestamp);

    return (hitRate * 0.5) + (loadTimeScore * 0.3) + (freshnessScore * 0.2);
  }

  /**
   * Calculate freshness score based on age (0-1)
   */
  private calculateFreshnessScore(timestamp: number): number {
    const age = Date.now() - timestamp;
    return Math.max(0, 1 - (age / this.METRICS_RETENTION));
  }

  /**
   * Clear expired metrics
   */
  clearExpired() {
    const now = Date.now();
    Object.entries(this.metrics).forEach(([tag, metric]) => {
      if (now - metric.timestamp > this.METRICS_RETENTION) {
        delete this.metrics[tag];
      }
    });
  }

  /**
   * Record cache invalidation
   */
  recordInvalidation(tag: string) {
    if (this.metrics[tag]) {
      this.metrics[tag].lastInvalidation = Date.now();
    }
  }

  /**
   * Get all current metrics
   */
  getAllMetrics() {
    return this.metrics;
  }
}

// Export singleton instance
export const cacheMonitor = new CacheMonitor();
