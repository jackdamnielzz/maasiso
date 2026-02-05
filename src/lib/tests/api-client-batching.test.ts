import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../api/client';
import { QueueFullError } from '../api/request-queue';
import { MockFetchFn, createFetchMock, createMockResponse } from './test-utils';

describe('API Client Request Batching', () => {
  let client: ApiClient;
  let fetchMock: MockFetchFn;

  beforeEach(() => {
    client = new ApiClient();
    fetchMock = createFetchMock();
    global.fetch = fetchMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Request Batching', () => {
    it('should batch multiple GET requests', async () => {
      const batchConfig = {
        maxBatchSize: 2,
        maxDelay: 50
      };

      // Queue multiple requests
      const promise1 = client.get('/users/1', { batch: batchConfig });
      const promise2 = client.get('/users/2', { batch: batchConfig });

      // Mock batch response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { data: { id: 1, name: 'User 1' } },
          { data: { id: 2, name: 'User 2' } }
        ]
      }));

      // Wait for batch processing
      await vi.advanceTimersByTimeAsync(60);
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should make single batch request
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ id: 1, name: 'User 1' });
      expect(result2).toEqual({ id: 2, name: 'User 2' });
    });

    it('should respect batch size limits', async () => {
      const batchConfig = {
        maxBatchSize: 2,
        maxDelay: 1000
      };

      // Mock batch response before enqueue; queue can process immediately at max size
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { data: { id: 1 } },
          { data: { id: 2 } }
        ]
      }));

      // Queue up to limit
      const promise1 = client.get('/users/1', { batch: batchConfig });
      const promise2 = client.get('/users/2', { batch: batchConfig });

      // Should reject when exceeding limit
      await expect(
        client.get('/users/3', { batch: batchConfig })
      ).rejects.toThrow(QueueFullError);

      // Process batch
      await vi.advanceTimersByTimeAsync(60);
      await Promise.all([promise1, promise2]);
    });

    it('should handle mixed success/failure in batch', async () => {
      const batchConfig = {
        maxBatchSize: 2,
        maxDelay: 50
      };

      // Queue requests
      const promise1 = client.get('/users/1', { batch: batchConfig });
      const promise2 = client.get('/users/error', { batch: batchConfig });
      const failedRequestCheck = expect(promise2).rejects.toThrow('Not found');

      // Mock response with mixed success/failure
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { data: { id: 1 } },
          { error: 'Not found' }
        ]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);

      // First request should succeed
      await expect(promise1).resolves.toEqual({ id: 1 });
      // Second request should fail
      await failedRequestCheck;
    });

    it('should handle batch request failures', async () => {
      const batchConfig = {
        maxBatchSize: 2,
        maxDelay: 50
      };

      // Queue requests
      const promise1 = client.get('/users/1', { batch: batchConfig });
      const promise2 = client.get('/users/2', { batch: batchConfig });
      const firstFailureCheck = expect(promise1).rejects.toThrow('Network error');
      const secondFailureCheck = expect(promise2).rejects.toThrow('Network error');

      // Mock batch failure
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);

      // All requests should fail
      await firstFailureCheck;
      await secondFailureCheck;
    });

    it('should deduplicate identical requests', async () => {
      const batchConfig = {
        maxBatchSize: 2,
        maxDelay: 50,
        deduplicate: true
      };

      // Queue duplicate requests
      const promise1 = client.get('/users/1', { batch: batchConfig });
      const promise2 = client.get('/users/1', { batch: batchConfig });

      // Mock response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { data: { id: 1 } }
        ]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should make single request
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('should process batch immediately when full', async () => {
      const batchConfig = {
        maxBatchSize: 2,
        maxDelay: 1000
      };

      // Mock batch response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { data: { id: 1 } },
          { data: { id: 2 } }
        ]
      }));

      // Queue up to limit
      const promise1 = client.get('/users/1', { batch: batchConfig });
      const promise2 = client.get('/users/2', { batch: batchConfig });

      // Should process without waiting for maxDelay
      await Promise.all([promise1, promise2]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should work with cache and circuit breaker', async () => {
      const options = {
        batch: {
          maxBatchSize: 2,
          maxDelay: 50
        },
        cacheOptions: {
          enabled: true,
          ttl: 1000
        },
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      };

      // First batch request
      const promise1 = client.get('/users/1', options);
      const promise2 = client.get('/users/2', options);

      // Mock batch response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { data: { id: 1 } },
          { data: { id: 2 } }
        ]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);
      await Promise.all([promise1, promise2]);

      // Second request should use cache
      const cachedResult = await client.get('/users/1', options);
      expect(cachedResult).toEqual({ id: 1 });
      expect(fetchMock).toHaveBeenCalledTimes(1); // No additional API call
    });
  });
});
