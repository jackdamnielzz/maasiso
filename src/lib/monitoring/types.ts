// Existing event types
export interface ErrorEventData extends ErrorContext {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface SyncEventData {
  operation: 'start' | 'complete' | 'error';
  changesCount?: number;
  duration?: number;
  error?: string;
}

export interface ConflictEventData {
  type: 'client-wins' | 'server-wins' | 'merge';
  entityType: string;
  entityId: string;
  resolution: string;
  conflictDetails: Record<string, unknown>;
}

export interface UserActionEventData {
  action: string;
  target?: string;
  page?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemEventData {
  type: 'init' | 'config' | 'lifecycle' | 'error';
  name: string;
  details: Record<string, unknown>;
}

export interface OfflineEventData {
  state: 'online' | 'offline';
  timestamp: number;
  pendingChanges?: number;
}

// Request event data type
export interface RequestEventData {
  method: string;
  url: string;
  duration?: number;
  status?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// New monitoring types
export enum CircuitBreakerState {
  Closed = 'CLOSED',
  Open = 'OPEN',
  HalfOpen = 'HALF_OPEN'
}

export interface MonitoringEvent {
  type: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface PerformanceMetrics {
  batch_processing: {
    duration: number;
    success_count: number;
    error_count: number;
    queue_size: number;
  };
  circuit_breaker: {
    service: string;
    state: CircuitBreakerState;
    failure_count: number;
  };
  network_quality: {
    quality: number;
    throughput: number;
    latency: number;
  };
}

// Monitoring event data types for new events
export interface BatchProcessingEventData {
  duration: number;
  success_count: number;
  error_count: number;
  queue_size: number;
}

export interface CircuitBreakerEventData {
  service: string;
  state: CircuitBreakerState;
  failure_count: number;
}

export interface NetworkQualityEventData {
  quality: number;
  throughput: number;
  latency: number;
}

export const MonitoringEventTypes = {
  ERROR: 'error',
  PERFORMANCE: 'performance',
  USER_ACTION: 'user_action',
  SYSTEM: 'system',
  OFFLINE: 'offline',
  SYNC: 'sync',
  CONFLICT: 'conflict',
  RESOURCE: 'resource',
  NAVIGATION: 'navigation',
  WEB_VITAL: 'web_vital',
  REQUEST: 'request',
  BATCH_PROCESSING: 'batch_processing',
  CIRCUIT_BREAKER: 'circuit_breaker',
  NETWORK_QUALITY: 'network_quality'
} as const;

// Existing type mappings
export interface MonitoringEventDataMap {
  [MonitoringEventTypes.ERROR]: ErrorEventData;
  [MonitoringEventTypes.PERFORMANCE]: PerformanceMetric;
  [MonitoringEventTypes.USER_ACTION]: UserActionEventData;
  [MonitoringEventTypes.SYSTEM]: SystemEventData;
  [MonitoringEventTypes.OFFLINE]: OfflineEventData;
  [MonitoringEventTypes.SYNC]: SyncEventData;
  [MonitoringEventTypes.CONFLICT]: ConflictEventData;
  [MonitoringEventTypes.RESOURCE]: ResourceTiming;
  [MonitoringEventTypes.NAVIGATION]: NavigationTiming;
  [MonitoringEventTypes.WEB_VITAL]: WebVitalMetric;
  [MonitoringEventTypes.REQUEST]: RequestEventData;
  [MonitoringEventTypes.BATCH_PROCESSING]: BatchProcessingEventData;
  [MonitoringEventTypes.CIRCUIT_BREAKER]: CircuitBreakerEventData;
  [MonitoringEventTypes.NETWORK_QUALITY]: NetworkQualityEventData;
}

// Rest of existing types
export type MonitoringEventData<T extends MonitoringEventType = MonitoringEventType> = {
  eventType: T;
  data: MonitoringEventDataMap[T];
  timestamp: number;
  sessionId?: string;
};

export interface ErrorContext extends Record<string, unknown> {
  componentName?: string;
  location?: string;
  errorMessage?: string;
  errorName?: string;
  errorStack?: string;
  component?: string;
  operation?: string;
  context?: Record<string, unknown>;
  severity?: 'error' | 'warning' | 'info';
  handled?: boolean;
}

export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  timestamp: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface ResourceTiming extends PerformanceMetric {
  initiatorType: string;
  duration: number;
  startTime: number;
  responseEnd: number;
  transferSize?: number;
  decodedBodySize?: number;
  encodedBodySize?: number;
}

export interface NavigationTiming extends PerformanceMetric {
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  unloadEventStart?: number;
  unloadEventEnd?: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
  duration: number;
}

export interface MonitoringService {
  trackError(error: Error, context: ErrorContext): void;
  trackEvent<T extends MonitoringEventType>(
    eventType: T,
    data: MonitoringEventDataMap[T]
  ): void;
  updateWebVital(metric: WebVitalMetric): void;
  trackPerformanceMetric(metric: PerformanceMetric): void;
  trackResourceTiming(timing: ResourceTiming): void;
  trackNavigationTiming(timing: NavigationTiming): void;
  flushMetrics(): Promise<void>;
  getMetrics(): Record<string, number>;
  getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor';
  cleanup(): void;
}

export type MonitoringEventType = typeof MonitoringEventTypes[keyof typeof MonitoringEventTypes];

export interface MetricsBatch {
  metrics: MonitoringEventData<MonitoringEventType>[];
  timestamp: number;
  batchId: string;
}
