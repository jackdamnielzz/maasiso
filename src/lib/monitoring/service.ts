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
  WebVitalMetric,
  MonitoringService,
  MonitoringEventType,
  MonitoringEventDataMap,
  PerformanceMetric
} from './types';

class PerformanceMonitor implements MonitoringService {
  private metrics: Map<string, number> = new Map();
  private eventBuffer: MonitoringEventData[] = [];
  private readonly BUFFER_SIZE = 500;
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL = 180000;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;
  private flushInterval?: NodeJS.Timeout;
  private webVitals: Map<string, number> = new Map();
  private resourceTimings: Map<string, number> = new Map();
  private responseTimeSum = 0;
  private requestCount = 0;
  private errorCount = 0;
  private lastFlushTime = Date.now();
  private readonly MIN_FLUSH_INTERVAL = 5000;
  private readonly METRICS_ENABLED = true;
  private isShuttingDown = false;

  constructor() {
    if (typeof window !== 'undefined' && this.METRICS_ENABLED) {
      this.setupMonitoring();
    }
  }

  private setupMonitoring(): void {
    this.flushInterval = setInterval(() => this.flushMetrics(), this.FLUSH_INTERVAL);

    window.addEventListener('beforeunload', () => {
      this.isShuttingDown = true;
      this.cleanup();
    });

    setInterval(() => {
      if (typeof performance !== 'undefined') {
        performance.clearResourceTimings();
        this.resourceTimings.clear();
      }
    }, 60000);
  }

  trackEvent<T extends MonitoringEventType>(
    eventType: T,
    data: MonitoringEventDataMap[T]
  ): void {
    if (!this.METRICS_ENABLED) return;

    this.bufferEvent({
      eventType,
      data,
      timestamp: Date.now()
    });

    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true') {
      console.log('[Event]', {
        type: eventType,
        data,
        timestamp: Date.now()
      });
    }
  }

  trackError(error: Error, context: ErrorContext): void {
    if (!this.METRICS_ENABLED) return;

    const errorEvent: MonitoringEventData<typeof MonitoringEventTypes.ERROR> = {
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

  trackPerformanceMetric(metric: PerformanceMetric): void {
    if (!this.METRICS_ENABLED) return;

    this.metrics.set(metric.name, metric.value);

    this.bufferEvent({
      eventType: MonitoringEventTypes.PERFORMANCE,
      data: metric,
      timestamp: Date.now()
    });
  }

  trackNavigationTiming(timing: NavigationTiming): void {
    if (!this.METRICS_ENABLED) return;

    this.bufferEvent({
      eventType: MonitoringEventTypes.NAVIGATION,
      data: timing,
      timestamp: Date.now()
    });
  }

  trackResourceTiming(timing: ResourceTiming): void {
    if (!this.METRICS_ENABLED) return;

    this.resourceTimings.set(timing.name, timing.duration);
    this.bufferEvent({
      eventType: MonitoringEventTypes.RESOURCE,
      data: timing,
      timestamp: Date.now()
    });
  }

  updateWebVital(metric: WebVitalMetric): void {
    if (!this.METRICS_ENABLED) return;

    this.webVitals.set(metric.name, metric.value);
    this.bufferEvent({
      eventType: MonitoringEventTypes.WEB_VITAL,
      data: metric,
      timestamp: Date.now()
    });
  }

  getMetrics(): Record<string, number> {
    return {
      ...Object.fromEntries(this.metrics.entries()),
      ...Object.fromEntries(this.webVitals.entries())
    };
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

  cleanup(): void {
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

  private bufferEvent(event: MonitoringEventData): void {
    if (!this.METRICS_ENABLED) return;

    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      this.eventBuffer.shift();
    }

    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= this.BATCH_SIZE) {
      void this.flushMetrics();
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

  async flushMetrics(): Promise<void> {
    if (!this.METRICS_ENABLED || this.eventBuffer.length === 0) return;
    const now = Date.now();

    while (this.eventBuffer.length > 0 && !this.isShuttingDown) {
      const batchEvents = this.eventBuffer.splice(0, this.BATCH_SIZE);
      const batch: MetricsBatch = {
        metrics: batchEvents,
        timestamp: now,
        batchId: crypto.randomUUID()
      };

      const success = await this.sendBatch(batch);
      
      if (!success && !this.isShuttingDown) {
        this.eventBuffer.unshift(...batchEvents);
        break;
      }
    }

    this.lastFlushTime = now;
  }
}

const monitoringService = new PerformanceMonitor();
export { monitoringService };
export const performanceLog = monitoringService;
