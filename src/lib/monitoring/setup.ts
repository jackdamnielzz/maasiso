import { apiClient } from '../api/client';
import { performanceLog } from './service';
import { CircuitBreakerState } from './types';

export const initMonitoring = () => {
  // Track batch processing metrics
  apiClient.onBatchProcessed(({ duration, successCount, errorCount, queueSize }) => {
    performanceLog.track('batch_processing', {
      duration,
      success_count: successCount,
      error_count: errorCount,
      queue_size: queueSize
    });
  });

  // Monitor circuit breaker states
  apiClient.onCircuitBreakerStateChange((service, state, stats) => {
    performanceLog.track('circuit_breaker', {
      service,
      state,
      failure_count: stats.failures
    });
  });

  // Track network quality changes
  apiClient.onNetworkQualityChange(({ quality, throughput, latency }) => {
    performanceLog.track('network_quality', {
      quality,
      throughput,
      latency
    });
  });

  // Monitor cache performance
  apiClient.onCacheHit((key) => {
    performanceLog.increment('cache_hits');
  });

  apiClient.onCacheMiss((key) => {
    performanceLog.increment('cache_misses');
  });
};

// Initialize monitoring when module loads
if (typeof window !== 'undefined') {
  initMonitoring();
}
