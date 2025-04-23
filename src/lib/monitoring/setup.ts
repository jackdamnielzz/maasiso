import { apiClient } from '../api/client';
import { performanceLog } from './service';
import { CircuitBreakerState, MonitoringEventTypes } from './types';

export const initMonitoring = () => {
  // Track batch processing metrics
  apiClient.onBatchProcessed(({ duration, successCount, errorCount, queueSize }) => {
    performanceLog.trackEvent(MonitoringEventTypes.BATCH_PROCESSING, {
      duration,
      success_count: successCount,
      error_count: errorCount,
      queue_size: queueSize
    });
  });

  // Monitor circuit breaker states
  apiClient.onCircuitBreakerStateChange((service, state, stats) => {
    performanceLog.trackEvent(MonitoringEventTypes.CIRCUIT_BREAKER, {
      service,
      state,
      failure_count: stats.failures
    });
  });

  // Track network quality changes
  apiClient.onNetworkQualityChange(({ quality, throughput, latency }) => {
    performanceLog.trackEvent(MonitoringEventTypes.NETWORK_QUALITY, {
      quality,
      throughput,
      latency
    });
  });

  // Monitor cache performance
  apiClient.onCacheHit((key) => {
    performanceLog.trackPerformanceMetric({
      name: 'cache_hits',
      value: 1,
      timestamp: Date.now()
    });
  });

  apiClient.onCacheMiss((key) => {
    performanceLog.trackPerformanceMetric({
      name: 'cache_misses',
      value: 1,
      timestamp: Date.now()
    });
  });
};

// Initialize monitoring when module loads
if (typeof window !== 'undefined') {
  initMonitoring();
}
