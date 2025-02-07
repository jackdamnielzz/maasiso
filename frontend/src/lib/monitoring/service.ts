import { 
  MonitoringEvent, 
  PerformanceMetrics, 
  MonitoringEventTypes,
  ErrorContext,
  MonitoringEventData,
  MetricsBatch,
  RequestEventData,
  NavigationTiming,
  ResourceTiming,
  WebVitalMetric
} from './types';

interface RequestTrackingData {
  method: string;
  url: string;
  duration?: number;
  status?: number;
  error?: Error;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private eventBuffer: MonitoringEventData[] = [];
  private readonly BUFFER_SIZE = 500; // Reduced buffer size
  private readonly BATCH_SIZE = 100; // Maximum events per API call
  private readonly FLUSH_INTERVAL = 180000; // 3 minutes
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;
  private flushInterval?: NodeJS.Timeout;
  private webVitals: Map<string, number> = new Map();
  private resourceTimings: Map<string, number> = new Map();
  private responseTimeSum = 0;
  private requestCount = 0;
  private errorCount = 0;
  private lastFlushTime = Date.now();
  private readonly MIN_FLUSH_INTERVAL = 5000; // Reduced to 5 seconds
  private readonly METRICS_ENABLED = process.env.NODE_ENV === 'production';
  private isShuttingDown = false;

  constructor() {
    if (typeof window !== 'undefined' && this.METRICS_ENABLED) {
      this.setupMonitoring();
    }
  }

  private setupMonitoring() {
    // Set up flush interval
    this.flushInterval = setInterval(() => this.flushMetrics(), this.FLUSH_INTERVAL);

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.isShuttingDown = true;
      this.cleanup();
    });

    // Clear old resource timings periodically
    setInterval(() => {
      if (typeof performance !== 'undefined') {
        performance.clearResourceTimings();
        this.resourceTimings.clear();
      }
    }, 60000);
  }

  trackRequest(data: RequestTrackingData) {
    if (!this.METRICS_ENABLED) return;

    const requestData: RequestEventData = {
      method: data.method,
      url: data.url,
      duration: data.duration,
      status: data.status,
      error: data.error ? {
        name: data.error.name,
        message: data.error.message,
        stack: data.error.stack
      } : undefined
    };

    this.bufferEvent({
      eventType: MonitoringEventTypes.REQUEST,
      data: requestData,
      timestamp: Date.now()
    });

    if (data.duration) {
      this.responseTimeSum += data.duration;
      this.requestCount++;
    }

    if (data.error) {
      this.errorCount++;
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Request Error]', {
          method: data.method,
          url: data.url,
          status: data.status,
          error: data.error.message
        });
      }
    }
  }

  track<K extends keyof PerformanceMetrics>(
    type: K,
    payload: PerformanceMetrics[K]
  ) {
    if (!this.METRICS_ENABLED) return;

    const event: MonitoringEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    this.bufferEvent({
      eventType: type as typeof MonitoringEventTypes[keyof typeof MonitoringEventTypes],
      data: payload,
      timestamp: event.timestamp
    });

    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true') {
      console.log('[Perf]', {
        type: event.type,
        timestamp: event.timestamp
      });
    }
  }

  increment(metric: string) {
    if (!this.METRICS_ENABLED) return;

    const currentValue = this.metrics.get(metric) || 0;
    this.metrics.set(metric, currentValue + 1);

    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true') {
      console.log('[Metric]', { name: metric, value: currentValue + 1 });
    }
  }

  trackError(error: Error, context: ErrorContext) {
    if (!this.METRICS_ENABLED) return;

    const errorEvent = {
      eventType: MonitoringEventTypes.ERROR,
      data: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        ...context
      },
      timestamp: Date.now()
    };

    this.bufferEvent(errorEvent);

    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true') {
      console.error('[Error]', {
        name: error.name,
        message: error.message,
        context: context
      });
    }
  }

  trackNavigationTiming(timing: NavigationTiming) {
    if (!this.METRICS_ENABLED) return;

    this.bufferEvent({
      eventType: MonitoringEventTypes.NAVIGATION,
      data: timing,
      timestamp: Date.now()
    });

    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true') {
      console.log('[Navigation]', {
        type: 'timing',
        timestamp: Date.now()
      });
    }
  }

  trackResourceTiming(timing: PerformanceResourceTiming) {
    if (!this.METRICS_ENABLED) return;

    const timestamp = Date.now();
    const resourceTiming: ResourceTiming = {
      name: timing.name,
      value: timing.duration,
      timestamp,
      initiatorType: timing.initiatorType,
      duration: timing.duration,
      startTime: timing.startTime,
      responseEnd: timing.responseEnd,
      transferSize: timing.transferSize,
      decodedBodySize: timing.decodedBodySize,
      encodedBodySize: timing.encodedBodySize
    };

    this.resourceTimings.set(timing.name, timing.duration);
    this.bufferEvent({
      eventType: MonitoringEventTypes.RESOURCE,
      data: resourceTiming,
      timestamp
    });
  }

  updateWebVital(name: string, value: number) {
    if (!this.METRICS_ENABLED) return;

    this.webVitals.set(name, value);
    const webVital: WebVitalMetric = {
      id: crypto.randomUUID(),
      name,
      value,
      rating: this.getRating(name, value),
      delta: value - (this.webVitals.get(name) || 0)
    };

    this.bufferEvent({
      eventType: MonitoringEventTypes.WEB_VITAL,
      data: webVital,
      timestamp: Date.now()
    });
  }

  getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      TTFB: [800, 1800],
      FCP: [1800, 3000]
    };

    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushMetrics().catch(error => {
      console.error('Error flushing metrics during cleanup:', error);
    });
    this.eventBuffer = [];
    this.metrics.clear();
    this.webVitals.clear();
    this.resourceTimings.clear();
    this.responseTimeSum = 0;
    this.requestCount = 0;
    this.errorCount = 0;
  }

  getMetrics() {
    return Object.fromEntries(this.webVitals);
  }

  getAverageResponseTime() {
    return this.requestCount > 0 ? this.responseTimeSum / this.requestCount : 0;
  }

  getErrorRate() {
    return this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
  }

  private bufferEvent(event: MonitoringEventData) {
    if (!this.METRICS_ENABLED) return;

    this.eventBuffer.push(event);
    
    const now = Date.now();
    if (this.eventBuffer.length >= this.BUFFER_SIZE && 
        now - this.lastFlushTime >= this.MIN_FLUSH_INTERVAL) {
      this.flushMetrics();
    }
  }

  private async sendBatch(batch: MetricsBatch, attempt = 1): Promise<boolean> {
    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to send metrics (attempt ${attempt}):`, error);
      
      if (attempt < this.RETRY_ATTEMPTS && !this.isShuttingDown) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        return this.sendBatch(batch, attempt + 1);
      }
      
      return false;
    }
  }

  async flushMetrics() {
    if (!this.METRICS_ENABLED || this.eventBuffer.length === 0) return;

    const now = Date.now();
    if (now - this.lastFlushTime < this.MIN_FLUSH_INTERVAL) {
      return;
    }

    // Process events in batches
    while (this.eventBuffer.length > 0 && !this.isShuttingDown) {
      const batchEvents = this.eventBuffer.splice(0, this.BATCH_SIZE);
      const batch: MetricsBatch = {
        metrics: batchEvents,
        timestamp: now,
        batchId: crypto.randomUUID()
      };

      const success = await this.sendBatch(batch);
      
      if (!success && !this.isShuttingDown) {
        // If send failed, put events back at the start of the buffer
        this.eventBuffer.unshift(...batchEvents);
        break;
      }
    }

    this.lastFlushTime = now;
  }

  getMetricValue(metric: string): number {
    return this.metrics.get(metric) || 0;
  }

  resetMetric(metric: string) {
    this.metrics.set(metric, 0);
  }
}

const monitoringService = new PerformanceMonitor();
export { monitoringService };
export const performanceLog = monitoringService;
