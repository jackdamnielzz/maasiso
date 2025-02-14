import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiLoadTester } from './load-test';
import { monitoredFetch } from '../monitoredFetch';
import { getStaticFetchOptions, getListFetchOptions, getDynamicFetchOptions } from '../api/cache';

// Mock dependencies
vi.mock('../monitoredFetch');
vi.mock('../api/cache');
vi.mock('../config/client-env', () => ({
  default: {
    clientEnv: {
      apiUrl: 'http://test-api.com'
    }
  }
}));

describe('ApiLoadTester', () => {
  let loadTester: ApiLoadTester;
  
  beforeEach(() => {
    loadTester = new ApiLoadTester();
    vi.clearAllMocks();
    
    // Mock successful response
    (monitoredFetch as any).mockResolvedValue({
      ok: true,
      headers: new Map([['x-cache', 'HIT']])
    });
  });

  describe('runTest', () => {
    it('runs load test with correct number of requests', async () => {
      const config = {
        endpoint: '/test',
        requestsPerSecond: 10,
        durationSeconds: 2,
        concurrentUsers: 2
      };

      const result = await loadTester.runTest(config);

      expect(result.totalRequests).toBe(20); // 10 rps * 2 seconds
      expect(monitoredFetch).toHaveBeenCalledTimes(20);
    });

    it('calculates metrics correctly', async () => {
      // Mock response times
      let callCount = 0;
      (monitoredFetch as any).mockImplementation(() => {
        callCount++;
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              headers: new Map([['x-cache', callCount % 2 ? 'HIT' : 'MISS']])
            });
          }, 50); // 50ms response time
        });
      });

      const result = await loadTester.runTest({
        endpoint: '/test',
        requestsPerSecond: 5,
        durationSeconds: 1,
        concurrentUsers: 1
      });

      expect(result.successfulRequests).toBe(5);
      expect(result.failedRequests).toBe(0);
      expect(result.cacheHitRate).toBe(0.4); // 2 out of 5 requests are hits
      expect(result.averageResponseTime).toBeGreaterThanOrEqual(50);
    });

    it('handles errors correctly', async () => {
      (monitoredFetch as any).mockRejectedValue(new Error('API Error'));

      const result = await loadTester.runTest({
        endpoint: '/test',
        requestsPerSecond: 5,
        durationSeconds: 1,
        concurrentUsers: 1
      });

      expect(result.successfulRequests).toBe(0);
      expect(result.failedRequests).toBe(5);
      expect(result.errorRate).toBe(1);
      expect(result.errors).toHaveLength(5);
      expect(result.errors[0].message).toBe('API Error');
    });
  });

  describe('runTestSuite', () => {
    it('tests all endpoint types with correct configurations', async () => {
      await loadTester.runTestSuite();

      // Static endpoint test
      expect(getStaticFetchOptions).toHaveBeenCalledWith('/api/pages/home');
      expect(monitoredFetch).toHaveBeenCalledWith(
        '/api/pages/home',
        expect.any(String),
        expect.any(Object)
      );

      // List endpoint test
      expect(getListFetchOptions).toHaveBeenCalledWith('/api/blog-posts');
      expect(monitoredFetch).toHaveBeenCalledWith(
        '/api/blog-posts',
        expect.any(String),
        expect.any(Object)
      );

      // Dynamic endpoint test
      expect(getDynamicFetchOptions).toHaveBeenCalled();
      expect(monitoredFetch).toHaveBeenCalledWith(
        '/api/blog-posts/latest',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('generateReport', () => {
    it('generates a detailed report with all metrics', async () => {
      const results = await loadTester.runTestSuite();
      const report = loadTester.generateReport(results);

      expect(report).toContain('# API Load Test Report');
      expect(report).toContain('## static Endpoint');
      expect(report).toContain('## list Endpoint');
      expect(report).toContain('## dynamic Endpoint');
      expect(report).toContain('Success Rate');
      expect(report).toContain('Error Rate');
      expect(report).toContain('Cache Hit Rate');
      expect(report).toContain('Response Times');
    });

    it('includes error details in report when errors occur', async () => {
      (monitoredFetch as any).mockRejectedValue(new Error('Test Error'));
      
      const results = await loadTester.runTestSuite();
      const report = loadTester.generateReport(results);

      expect(report).toContain('### Errors');
      expect(report).toContain('Test Error');
    });
  });
});
