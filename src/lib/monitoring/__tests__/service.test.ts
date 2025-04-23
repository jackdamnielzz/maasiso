import { vi, Mock, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { performanceLog } from '../service';
import {
  MonitoringEventTypes,
  ErrorContext,
  BatchProcessingEventData,
  CircuitBreakerEventData,
  NetworkQualityEventData,
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

  describe('trackEvent', () => {
    it('should track batch processing metrics', () => {
      const batchMetrics: BatchProcessingEventData = {
        duration: 100,
        success_count: 5,
        error_count: 1,
        queue_size: 10
      };

      performanceLog.trackEvent(MonitoringEventTypes.BATCH_PROCESSING, batchMetrics);

      expect(console.log).toHaveBeenCalled();
      const loggedData = (console.log as Mock).mock.calls[0][1];
      expect(loggedData.type).toBe(MonitoringEventTypes.BATCH_PROCESSING);
      expect(loggedData.data).toEqual(batchMetrics);
    });

    it('should track circuit breaker state changes', () => {
      const breakerMetrics: CircuitBreakerEventData = {
        service: 'api',
        state: CircuitBreakerState.Open,
        failure_count: 3
      };

      performanceLog.trackEvent(MonitoringEventTypes.CIRCUIT_BREAKER, breakerMetrics);

      expect(console.log).toHaveBeenCalled();
      const loggedData = (console.log as Mock).mock.calls[0][1];
      expect(loggedData.type).toBe(MonitoringEventTypes.CIRCUIT_BREAKER);
      expect(loggedData.data).toEqual(breakerMetrics);
    });

    it('should track network quality metrics', () => {
      const networkMetrics: NetworkQualityEventData = {
        quality: 0.8,
        throughput: 1000,
        latency: 50
      };

      performanceLog.trackEvent(MonitoringEventTypes.NETWORK_QUALITY, networkMetrics);

      expect(console.log).toHaveBeenCalled();
      const loggedData = (console.log as Mock).mock.calls[0][1];
      expect(loggedData.type).toBe(MonitoringEventTypes.NETWORK_QUALITY);
      expect(loggedData.data).toEqual(networkMetrics);
    });
  });

  describe('performance metrics', () => {
    it('should track and retrieve metric values', () => {
      const timestamp = Date.now();
      
      performanceLog.trackPerformanceMetric({
        name: 'cache_hits',
        value: 1,
        timestamp
      });

      const metrics = performanceLog.getMetrics();
      expect(metrics['cache_hits']).toBe(1);
    });

    it('should track multiple metric updates', () => {
      const timestamp = Date.now();
      
      performanceLog.trackPerformanceMetric({
        name: 'cache_hits',
        value: 1,
        timestamp
      });

      performanceLog.trackPerformanceMetric({
        name: 'cache_hits',
        value: 2,
        timestamp: timestamp + 1000
      });

      const metrics = performanceLog.getMetrics();
      expect(metrics['cache_hits']).toBe(2);
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
      expect(loggedData.name).toBe(error.name);
      expect(loggedData.message).toBe('Test error');
      expect(loggedData.context.componentName).toBe('TestComponent');
    });
  });

  describe('metric batching', () => {
    it('should batch and send metrics', async () => {
      const timestamp = Date.now();
      
      // Track multiple metrics
      performanceLog.trackEvent(MonitoringEventTypes.BATCH_PROCESSING, {
        duration: 100,
        success_count: 5,
        error_count: 0,
        queue_size: 10
      });

      performanceLog.trackEvent(MonitoringEventTypes.NETWORK_QUALITY, {
        quality: 0.9,
        throughput: 1200,
        latency: 45
      });

      // Trigger flush
      await performanceLog.flushMetrics();

      expect(fetch).toHaveBeenCalled();
      const requestBody = JSON.parse((fetch as Mock).mock.calls[0][1].body);
      expect(requestBody.metrics).toHaveLength(2);
      expect(requestBody.metrics[0].eventType).toBe(MonitoringEventTypes.BATCH_PROCESSING);
      expect(requestBody.metrics[1].eventType).toBe(MonitoringEventTypes.NETWORK_QUALITY);
    });

    it('should handle failed requests by keeping metrics in buffer', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        Promise.resolve({ ok: false })
      );

      performanceLog.trackEvent(MonitoringEventTypes.BATCH_PROCESSING, {
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
        performanceLog.trackEvent(MonitoringEventTypes.BATCH_PROCESSING, {
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
