/**
 * Performance monitoring utilities for tracking and reporting frontend metrics
 */

import {
  LayoutShiftEntry,
  LargestContentfulPaintEntry,
  FirstInputEntry,
  ResourceEntry,
  isLayoutShiftEntry,
  isLargestContentfulPaintEntry,
  isFirstInputEntry,
  isResourceEntry
} from '../types/performance';

import { CacheManager } from '../cache/CacheManager';

interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  loadComplete: number;
  memoryUsage: number;
  cacheHitRate: number;
  cacheErrorRate: number;
}

interface ResourceMetrics {
  name: string;
  duration: number;
  size: number;
  type: string;
}

const defaultThresholds = {
  timeToFirstByte: 800, // ms
  firstContentfulPaint: 1800, // ms
  largestContentfulPaint: 2500, // ms
  firstInputDelay: 100, // ms
  cumulativeLayoutShift: 0.1, // score
  timeToInteractive: 3800, // ms
  loadComplete: 5000, // ms
  memoryUsage: 100, // MB
  cacheHitRate: 90, // percentage
  cacheErrorRate: 1, // percentage
};

let analyticsQueue: Array<{
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}> = [];

export function initializePerformanceMonitoring(analyticsEndpoint?: string) {
  if (typeof window === 'undefined') return;

  // Initialize Performance Observer for LCP
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (isLargestContentfulPaintEntry(lastEntry)) {
      reportMetric('largestContentfulPaint', lastEntry.startTime);
    }
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Initialize Performance Observer for FID
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      if (isFirstInputEntry(entry)) {
        reportMetric('firstInputDelay', entry.duration);
      }
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Initialize Performance Observer for CLS
  const clsObserver = new PerformanceObserver((entryList) => {
    let clsScore = 0;
    entryList.getEntries().forEach(entry => {
      if (isLayoutShiftEntry(entry) && !entry.hadRecentInput) {
        clsScore += entry.value;
      }
    });
    reportMetric('cumulativeLayoutShift', clsScore);
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });

  // Track resource loading
  const resourceObserver = new PerformanceObserver((entryList) => {
    entryList.getEntries().forEach(entry => {
      if (isResourceEntry(entry)) {
        reportResourceMetric({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
          type: entry.initiatorType
        });
      }
    });
  });
  resourceObserver.observe({ entryTypes: ['resource'] });

  // Monitor memory usage
  if (performance.memory) {
    setInterval(() => {
      const memoryUsage = (performance.memory.usedJSHeapSize / 1024 / 1024);
      reportMetric('memoryUsage', memoryUsage);
    }, 10000);
  }

  // Monitor cache performance
  setInterval(() => {
    const cacheStats = CacheManager.getInstance().getStats();
    reportMetric('cacheHitRate', cacheStats.hitRate * 100);
    reportMetric('cacheErrorRate', (cacheStats.errors / (cacheStats.hits + cacheStats.misses + cacheStats.staleHits)) * 100);
  }, 30000);

  // Clean up on page unload
  window.addEventListener('unload', () => {
    lcpObserver.disconnect();
    fidObserver.disconnect();
    clsObserver.disconnect();
    resourceObserver.disconnect();
    
    // Send any remaining analytics
    if (analyticsQueue.length > 0 && analyticsEndpoint) {
      navigator.sendBeacon(analyticsEndpoint, JSON.stringify(analyticsQueue));
    }
  });
}

export function reportMetric(name: keyof PerformanceMetrics, value: number) {
  const threshold = defaultThresholds[name];
  
  console.debug(`Performance metric - ${name}:`, {
    value,
    threshold,
    exceedsThreshold: value > threshold
  });

  if (value > threshold) {
    console.warn(`Performance threshold exceeded for ${name}:`, {
      value,
      threshold,
      difference: value - threshold
    });
  }

  // Here you would typically send this data to your analytics service
  // For now, we'll just log it
  logMetricToAnalytics(name, value);
}

function reportResourceMetric(metric: ResourceMetrics) {
  console.debug('Resource performance:', metric);

  if (metric.duration > 1000) {
    console.warn('Slow resource load:', {
      ...metric,
      suggestedAction: getSuggestedAction(metric)
    });
  }
}

function getSuggestedAction(metric: ResourceMetrics): string {
  if (metric.type === 'img' && metric.size > 200000) {
    return 'Consider optimizing image size';
  }
  if (metric.type === 'script' && metric.duration > 500) {
    return 'Consider code splitting or lazy loading';
  }
  if (metric.type === 'css' && metric.size > 50000) {
    return 'Consider reducing CSS bundle size';
  }
  return 'Monitor for consistent performance';
}

function logMetricToAnalytics(name: string, value: number, metadata?: Record<string, any>) {
  const metric = {
    name,
    value,
    timestamp: Date.now(),
    metadata
  };

  analyticsQueue.push(metric);

  // Log for development
  console.group('Performance Analytics');
  console.log('Metric:', name);
  console.log('Value:', value);
  console.log('Timestamp:', new Date().toISOString());
  if (metadata) console.log('Metadata:', metadata);
  console.groupEnd();

  // Batch send analytics if queue gets too large
  if (analyticsQueue.length >= 50) {
    flushAnalyticsQueue();
  }
}

async function flushAnalyticsQueue() {
  if (analyticsQueue.length === 0) return;

  try {
    // In production, replace with actual analytics endpoint
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(analyticsQueue)
    // });
    
    // For now, just log
    console.debug('Would send analytics batch:', analyticsQueue);
    
    analyticsQueue = [];
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}

// Flush analytics queue periodically
setInterval(flushAnalyticsQueue, 60000);

export function measurePageLoad(routeName: string) {
  if (typeof window === 'undefined') return;

  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  const metrics = {
    timeToFirstByte: navigationEntry.responseStart - navigationEntry.requestStart,
    firstContentfulPaint: 0,
    loadComplete: navigationEntry.loadEventEnd - navigationEntry.startTime
  };

  // Get First Contentful Paint
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    metrics.firstContentfulPaint = fcpEntry.startTime;
  }

  console.group(`Page Load Metrics - ${routeName}`);
  Object.entries(metrics).forEach(([key, value]) => {
    reportMetric(key as keyof PerformanceMetrics, value);
  });
  console.groupEnd();
}
