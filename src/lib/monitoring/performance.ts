type MetricName = 
  | 'FCP' // First Contentful Paint
  | 'LCP' // Largest Contentful Paint
  | 'FID' // First Input Delay
  | 'CLS' // Cumulative Layout Shift
  | 'TTFB' // Time to First Byte
  | 'Navigation'
  | 'Resource'
  | 'Paint'
  | 'Layout';

interface PerformanceMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Thresholds based on Core Web Vitals
const thresholds = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: MetricName, value: number): PerformanceMetric['rating'] {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Create Performance Observer
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach((entry) => {
      let metric: PerformanceMetric | null = null;

      switch (entry.entryType) {
        case 'paint':
          if (entry.name === 'first-contentful-paint') {
            metric = {
              name: 'FCP',
              value: entry.startTime,
              rating: getRating('FCP', entry.startTime),
              timestamp: Date.now(),
            };
          }
          break;

        case 'largest-contentful-paint':
          metric = {
            name: 'LCP',
            value: entry.startTime,
            rating: getRating('LCP', entry.startTime),
            timestamp: Date.now(),
          };
          break;

        case 'first-input':
          metric = {
            name: 'FID',
            value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
            rating: getRating('FID', (entry as PerformanceEventTiming).processingStart - entry.startTime),
            timestamp: Date.now(),
          };
          break;

        case 'layout-shift':
          if (!(entry as LayoutShift).hadRecentInput) {
            metric = {
              name: 'CLS',
              value: (entry as LayoutShift).value,
              rating: getRating('CLS', (entry as LayoutShift).value),
              timestamp: Date.now(),
            };
          }
          break;

        case 'navigation':
          metric = {
            name: 'TTFB',
            value: (entry as PerformanceNavigationTiming).responseStart,
            rating: getRating('TTFB', (entry as PerformanceNavigationTiming).responseStart),
            timestamp: Date.now(),
          };
          break;
      }

      if (metric) {
        logMetric(metric);
      }
    });
  });

  // Observe relevant performance entries
  observer.observe({
    entryTypes: [
      'paint',
      'largest-contentful-paint',
      'first-input',
      'layout-shift',
      'navigation',
    ],
  });

  // Clean up on page unload
  window.addEventListener('pagehide', () => {
    observer.disconnect();
  });
}

function logMetric(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance metric:', metric);
  }

  // TODO: Send metrics to monitoring service
  // This could be Google Analytics, custom endpoint, etc.
  // Example:
  // fetch('/api/metrics', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  // });
}

export function measurePageLoad(pageId: string) {
  if (typeof window === 'undefined') return;

  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigationEntry) return;

  const metric: PerformanceMetric = {
    name: 'Navigation',
    value: navigationEntry.loadEventEnd - navigationEntry.startTime,
    rating: getRating('Navigation', navigationEntry.loadEventEnd - navigationEntry.startTime),
    timestamp: Date.now()
  };

  logMetric({
    ...metric,
    name: `${pageId}-load` as MetricName
  });
}
