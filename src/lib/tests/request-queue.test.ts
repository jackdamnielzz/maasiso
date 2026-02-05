import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestQueue, QueueFullError, BatchProcessingError } from '../api/request-queue';
import { MockFetchFn, createFetchMock, createMockResponse } from './test-utils';

describe('RequestQueue', () => {
  let queue: RequestQueue;
  let fetchMock: MockFetchFn;
  const makeRequest = (path: string, init?: RequestInit): Request =>
    new Request(new URL(path, 'http://localhost').toString(), init);

  beforeEach(() => {
    fetchMock = createFetchMock();
    global.fetch = fetchMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Request Batching', () => {
    it('should batch requests within time window', async () => {
      queue = new RequestQueue({ maxDelay: 50 });

      // Mock batch response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { id: 1 },
          { id: 2 }
        ]
      }));

      // Queue multiple requests
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/2'));

      // Wait for batch processing
      await vi.advanceTimersByTimeAsync(60);
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should make single batch request
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ id: 1 });
      expect(result2).toEqual({ id: 2 });
    });

    it('should respect max batch size', async () => {
      queue = new RequestQueue({ maxBatchSize: 2 });

      // Mock batch response before enqueue; queue can process immediately at max size
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { id: 1 },
          { id: 2 }
        ]
      }));

      // Queue up to limit
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/2'));

      // Should reject when exceeding limit
      await expect(
        queue.enqueue(makeRequest('/api/users/3'))
      ).rejects.toThrow(QueueFullError);

      // Process batch
      await vi.advanceTimersByTimeAsync(60);
      await Promise.all([promise1, promise2]);
    });

    it('should process requests immediately when batch is full', async () => {
      queue = new RequestQueue({ maxBatchSize: 2, maxDelay: 1000 });

      // Mock batch response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { id: 1 },
          { id: 2 }
        ]
      }));

      // Queue up to limit
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/2'));

      // Should process without waiting for maxDelay
      await Promise.all([promise1, promise2]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate identical requests', async () => {
      queue = new RequestQueue({ deduplicate: true });

      // Queue duplicate requests
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/1'));

      // Mock response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [{ id: 1 }]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should make single request
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('should not deduplicate when disabled', async () => {
      queue = new RequestQueue({ deduplicate: false });

      // Queue duplicate requests
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/1'));

      // Mock response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [{ id: 1 }, { id: 1 }]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should include both in batch
      expect(result1).toEqual({ id: 1 });
      expect(result2).toEqual({ id: 1 });
      expect(result1).not.toBe(result2);
    });
  });

  describe('Error Handling', () => {
    it('should handle individual request failures', async () => {
      queue = new RequestQueue();

      // Queue requests
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/error'));
      const failedRequestCheck = expect(promise2).rejects.toThrow('Not found');

      // Mock response with mixed success/failure
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [
          { id: 1 },
          { error: 'Not found' }
        ]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);

      // First request should succeed
      await expect(promise1).resolves.toEqual({ id: 1 });
      await failedRequestCheck;
    });

    it('should handle batch request failures', async () => {
      queue = new RequestQueue();

      // Queue requests
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/2'));
      const firstFailureCheck = expect(promise1).rejects.toThrow(BatchProcessingError);
      const secondFailureCheck = expect(promise2).rejects.toThrow(BatchProcessingError);

      // Mock batch failure
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);

      // All requests should fail with BatchProcessingError
      await firstFailureCheck;
      await secondFailureCheck;
    });

    it('should handle invalid batch responses', async () => {
      queue = new RequestQueue();

      // Queue request
      const promise = queue.enqueue(makeRequest('/api/users/1'));
      const invalidResponseCheck = expect(promise).rejects.toThrow('Invalid batch response format');

      // Mock invalid response format
      fetchMock.mockResolvedValueOnce(createMockResponse({ invalid: 'format' }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);

      // Should fail with format error
      await invalidResponseCheck;
    });
  });

  describe('Queue Management', () => {
    it('should track queue statistics', async () => {
      queue = new RequestQueue();

      // Queue requests
      queue.enqueue(makeRequest('/api/users/1'));
      queue.enqueue(makeRequest('/api/users/2'));

      // Check stats
      const stats = queue.getStats();
      expect(stats.totalRequests).toBe(2);
      expect(stats.batchCount).toBe(1);
      expect(stats.oldestRequest).toBeLessThanOrEqual(Date.now());
    });

    it('should clean up processed requests', async () => {
      queue = new RequestQueue();

      // Queue and process requests
      const promise1 = queue.enqueue(makeRequest('/api/users/1'));
      const promise2 = queue.enqueue(makeRequest('/api/users/2'));

      // Mock response
      fetchMock.mockResolvedValueOnce(createMockResponse({
        data: [{ id: 1 }, { id: 2 }]
      }));

      // Wait for processing
      await vi.advanceTimersByTimeAsync(60);
      await Promise.all([promise1, promise2]);

      // Queue should be empty
      const stats = queue.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.batchCount).toBe(0);
    });
  });
});
