import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RequestQueue } from '../request-queue';

describe('Request Queue Batch Timing', () => {
  let queue: RequestQueue;
  const mockFetch = jest.fn();
  // Store original fetch implementation
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

  const createMockResponse = (requests: any[]) => {
    // Create response data matching the queue's expected format
    const responseData = {
      data: requests.map((req, index) => ({
        data: {
          id: index + 1,
          value: `test-${index + 1}`
        }
      }))
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  };

  it('processes batch after maxDelay', async () => {
    const request1 = new Request('http://example.com/api/1');
    const request2 = new Request('http://example.com/api/2');

    // Mock implementation that returns proper batch response format
    mockFetch.mockImplementation((...args: any[]) => {
      const [, init] = args;
      const batchRequests = init?.body ? JSON.parse(init.body.toString()) : [];
      return Promise.resolve(createMockResponse(batchRequests));
    });

    const promise1 = queue.enqueue<unknown>(request1);
    const promise2 = queue.enqueue<unknown>(request2);

    // Fast-forward time by maxDelay and handle promises
    jest.advanceTimersByTime(50);
    jest.runAllTimers();

    const results = await Promise.all([promise1, promise2]);

    // Verify response data format
    expect(results[0]).toEqual({
      id: 1,
      value: 'test-1'
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: expect.stringContaining('"method":"GET"')
      })
    );
  });

  it('processes batch immediately when maxBatchSize is reached', async () => {
    const requests = Array.from({ length: 5 }, (_, i) => 
      new Request(`http://example.com/api/${i + 1}`)
    );

    // Mock implementation that returns proper batch response format
    mockFetch.mockImplementation((...args: any[]) => {
      const [, init] = args;
      const batchRequests = init?.body ? JSON.parse(init.body.toString()) : [];
      return Promise.resolve(createMockResponse(batchRequests));
    });

    const promises = requests.map(request => queue.enqueue<unknown>(request));

    // Even with maxBatchSize reached, we still need to process microtasks
    jest.runAllTimers();
    const results = await Promise.all(promises);

    // Verify all responses have correct format
    results.forEach((result, index) => {
      expect(result).toEqual({
        id: index + 1,
        value: `test-${index + 1}`
      });
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: expect.stringContaining('"method":"GET"')
      })
    );
  });

  it('handles batch processing errors', async () => {
    const request = new Request('http://example.com/api/error');
    
    mockFetch.mockImplementation(() => 
      Promise.reject(new Error('Network failure'))
    );

    const promise = queue.enqueue(request);
    
    // Fast-forward time and handle all timers
    jest.advanceTimersByTime(50);
    jest.runAllTimers();
    
    await expect(promise).rejects.toThrow('Network failure');
  }, 10000); // Increase timeout for error handling
});
