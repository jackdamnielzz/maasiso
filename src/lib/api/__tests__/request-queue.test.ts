import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RequestQueue, BatchProcessingError } from '../request-queue';

// Mock the apiLogger
jest.mock('../logger', () => ({
  apiLogger: {
    logRequest: jest.fn().mockReturnValue({}),
    logResponse: jest.fn()
  }
}));

describe('Request Queue', () => {
  let queue: RequestQueue;
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    // Type assertion to handle the mock function type
    global.fetch = mockFetch as typeof global.fetch;
    queue = new RequestQueue();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const createMockResponse = (data: any) => {
    return new Response(
      JSON.stringify({ data }),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  };

  describe('Request Deduplication', () => {
    it('deduplicates identical requests in the same batch', async () => {
      const request = new Request('http://example.com/api/1');
      
      mockFetch.mockImplementation((...args: any[]) => {
        const [, init] = args;
        const batchRequests = init?.body ? JSON.parse(init.body.toString()) : [];
        return Promise.resolve(createMockResponse(batchRequests));
      });

      // Queue the same request twice
      const promise1 = queue.enqueue<unknown>(request);
      const promise2 = queue.enqueue<unknown>(request);

      // Fast-forward time by maxDelay
      jest.advanceTimersByTime(50);
      
      // Use real timers for promise resolution
      jest.useRealTimers();
      const results = await Promise.all([promise1, promise2]);

      // Should only make one fetch call with one request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const batchBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(batchBody).toHaveLength(1);

      // Both promises should resolve with the same data
      expect(results[0]).toEqual(results[1]);
    });
  });

  describe('Failed Request Handling', () => {
    it('moves failed requests to failed queue', async () => {
      const request = new Request('http://example.com/api/error');
      
      // Setup mock to return a failed response first time
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(
        JSON.stringify({ error: 'Network failure' }),
        { status: 500 }
      )));

      const promise = queue.enqueue<unknown>(request);
      
      // Fast-forward time by maxDelay
      jest.advanceTimersByTime(50);
      
      // Use real timers for promise resolution
      jest.useRealTimers();
      await expect(promise).rejects.toThrow('Batch request failed: 500');

      // Switch back to fake timers
      jest.useFakeTimers();

      // Setup mock for retry
      mockFetch.mockImplementationOnce(() => Promise.resolve(createMockResponse([{ id: 1 }])));
      
      // Retry failed requests
      queue.retryFailed();
      jest.advanceTimersByTime(50);
      
      // Use real timers for promise resolution
      jest.useRealTimers();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should attempt to process the failed request again
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Queue Events', () => {
    it('emits batch-processed event with metrics', async () => {
      const request = new Request('http://example.com/api/1');
      const eventHandler = jest.fn();

      queue.on('batch-processed', eventHandler);
      
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse([{ id: 1 }])));

      const promise = queue.enqueue<unknown>(request);
      jest.advanceTimersByTime(50);
      
      // Use real timers for promise resolution
      jest.useRealTimers();
      await promise;

      expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
        successCount: 1,
        errorCount: 0,
        queueSize: 0,
        duration: expect.any(Number)
      }));
    });

    it('emits batch-processed event on failure with error metrics', async () => {
      const request = new Request('http://example.com/api/error');
      const eventHandler = jest.fn();

      queue.on('batch-processed', eventHandler);
      
      mockFetch.mockImplementation(() => Promise.resolve(new Response(
        JSON.stringify({ error: 'Network failure' }),
        { status: 500 }
      )));

      const promise = queue.enqueue<unknown>(request);
      jest.advanceTimersByTime(50);
      
      // Use real timers for promise resolution
      jest.useRealTimers();
      try {
        await promise;
      } catch (error) {
        // Expected error
      }

      expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
        successCount: 0,
        errorCount: 1,
        queueSize: 0,
        duration: expect.any(Number)
      }));
    });
  });
});
