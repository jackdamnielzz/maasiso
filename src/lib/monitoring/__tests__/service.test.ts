import { vi, Mock, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { performanceLog } from '../service';
import {
  MonitoringEventTypes,
  ErrorContext,
  PerformanceMetrics,
  CircuitBreakerState
} from '../types';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({ ok: true })
    );

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('track', () => {
    it('should track batch processing metrics', () => {
      const batchMetrics = {
        duration: 100,
        success_count: 5,
        error_count: 1,
        queue_size: 10
      };

      performanceLog.track('batch_processing', batchMetrics);

      expect(console.log).toHaveBeenCalled();
      const loggedData = (console.log as Mock).mock.calls[0][1];
      expect(loggedData.type).toBe('batch_processing');
      expect(loggedData.payload).toEqual(batchMetrics);
    });

    it('should track circuit breaker state changes', () => {
      const breakerMetrics = {
        service: 'api',
        state: CircuitBreakerState.Open,
        failure_count: 3
      };

      performanceLog.track('circuit_breaker', breakerMetrics);

      expect(console.log).toHaveBeenCalled();
      const loggedData = (console.log as Mock).mock.calls[0][1];
      expect(loggedData.type).toBe('circuit_breaker');
      expect(loggedData.payload).toEqual(breakerMetrics);
    });

    it('should track network quality metrics', () => {
      const networkMetrics = {
        quality: 0.8,
        throughput: 1000,
        latency: 50
      };

      performanceLog.track('network_quality', networkMetrics);

      expect(console.log).toHaveBeenCalled();
      const loggedData = (console.log as Mock).mock.calls[0][1];
      expect(loggedData.type).toBe('network_quality');
      expect(loggedData.payload).toEqual(networkMetrics);
    });
  });

  describe('increment and metrics', () => {
    it('should increment and track metric values', () => {
      performanceLog.increment('cache_hits');
      expect(performanceLog.getMetricValue('cache_hits')).toBe(1);

      performanceLog.increment('cache_hits');
      expect(performanceLog.getMetricValue('cache_hits')).toBe(2);
    });

    it('should reset metric values', () => {
      performanceLog.increment('cache_misses');
      expect(performanceLog.getMetricValue('cache_misses')).toBe(1);

      performanceLog.resetMetric('cache_misses');
      expect(performanceLog.getMetricValue('cache_misses')).toBe(0);
    });
  });

  describe('error tracking', () => {
    it('should track errors with context', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        componentName: 'TestComponent',
        severity: 'error'
      };

      performanceLog.trackError(error, context);

      expect(console.error).toHaveBeenCalled();
      const loggedData = (console.error as Mock).mock.calls[0][1];
      expect(loggedData.eventType).toBe(MonitoringEventTypes.ERROR);
      expect(loggedData.data.error.message).toBe('Test error');
      expect(loggedData.data.componentName).toBe('TestComponent');
    });
  });

  describe('metric batching', () => {
    it('should batch and send metrics', async () => {
      // Track multiple metrics
      performanceLog.track('batch_processing', {
        duration: 100,
        success_count: 5,
        error_count: 0,
        queue_size: 10
      });

      performanceLog.track('network_quality', {
        quality: 0.9,
        throughput: 1200,
        latency: 45
      });

      // Trigger flush
      await performanceLog.flushMetrics();

      expect(fetch).toHaveBeenCalled();
      const requestBody = JSON.parse((fetch as Mock).mock.calls[0][1].body);
      expect(requestBody.metrics).toHaveLength(2);
      expect(requestBody.metrics[0].eventType).toBe('batch_processing');
      expect(requestBody.metrics[1].eventType).toBe('network_quality');
    });

    it('should handle failed requests by keeping metrics in buffer', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        Promise.resolve({ ok: false })
      );

      performanceLog.track('batch_processing', {
        duration: 100,
        success_count: 5,
        error_count: 0,
        queue_size: 10
      });

      await performanceLog.flushMetrics();

      // Should try to send again on next flush
      global.fetch = vi.fn().mockImplementation(() => 
        Promise.resolve({ ok: true })
      );
      await performanceLog.flushMetrics();

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should flush metrics when buffer size is reached', async () => {
      // Fill buffer to size limit (100)
      for (let i = 0; i < 100; i++) {
        performanceLog.track('batch_processing', {
          duration: i,
          success_count: 1,
          error_count: 0,
          queue_size: 1
        });
      }

      // Should trigger automatic flush
      expect(fetch).toHaveBeenCalled();
      const requestBody = JSON.parse((fetch as Mock).mock.calls[0][1].body);
      expect(requestBody.metrics).toHaveLength(100);
    });
  });
});
