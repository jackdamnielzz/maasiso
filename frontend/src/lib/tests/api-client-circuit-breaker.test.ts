import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from '../api/client';
import { CircuitOpenError } from '../api/circuit-breaker';
import { MockFetchFn, createFetchMock, createMockResponse } from './test-utils';

describe('API Client Circuit Breaker Integration', () => {
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

  describe('Circuit Breaker Behavior', () => {
    it('should open circuit after consecutive failures', async () => {
      // Configure circuit breaker to open after 2 failures
      const options = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      };

      // First failure
      fetchMock.mockRejectedValueOnce(new Error('API Error'));
      await expect(client.get('/test', options)).rejects.toThrow('API Error');

      // Second failure - should open circuit
      fetchMock.mockRejectedValueOnce(new Error('API Error'));
      await expect(client.get('/test', options)).rejects.toThrow('API Error');

      // Circuit is now open - should fail fast without calling API
      await expect(client.get('/test', options)).rejects.toThrow(CircuitOpenError);
      expect(fetchMock).toHaveBeenCalledTimes(2); // No additional API call
    });

    it('should attempt recovery after reset timeout', async () => {
      const options = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      };

      // Force circuit open
      fetchMock
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(client.get('/test', options)).rejects.toThrow('API Error');
      await expect(client.get('/test', options)).rejects.toThrow('API Error');

      // Circuit is open
      await expect(client.get('/test', options)).rejects.toThrow(CircuitOpenError);

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Next request should be allowed (half-open state)
      fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));
      const result = await client.get('/test', options);
      expect(result).toEqual({ success: true });
    });

    it('should maintain separate circuits for different endpoint groups', async () => {
      const options = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      };

      // Open circuit for /users endpoint
      fetchMock
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(client.get('/users/123', options)).rejects.toThrow('API Error');
      await expect(client.get('/users/456', options)).rejects.toThrow('API Error');

      // /users circuit should be open
      await expect(client.get('/users/789', options)).rejects.toThrow(CircuitOpenError);

      // But /posts endpoint should still work
      fetchMock.mockResolvedValueOnce(createMockResponse({ id: 1 }));
      const result = await client.get('/posts/1', options);
      expect(result).toEqual({ id: 1 });
    });

    it('should handle API errors correctly', async () => {
      const options = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      };

      // Simulate API errors
      fetchMock
        .mockResolvedValueOnce(createMockResponse({ error: 'Server Error' }, { status: 500 }))
        .mockResolvedValueOnce(createMockResponse({ error: 'Server Error' }, { status: 500 }));

      // First failure
      await expect(client.get('/test', options)).rejects.toThrow(ApiError);

      // Second failure - should open circuit
      await expect(client.get('/test', options)).rejects.toThrow(ApiError);

      // Circuit should be open
      await expect(client.get('/test', options)).rejects.toThrow(CircuitOpenError);
    });

    it('should close circuit after successful recovery', async () => {
      const options = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000,
          halfOpenLimit: 2
        }
      };

      // Force circuit open
      fetchMock
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(client.get('/test', options)).rejects.toThrow('API Error');
      await expect(client.get('/test', options)).rejects.toThrow('API Error');

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Successful requests in half-open state
      fetchMock
        .mockResolvedValueOnce(createMockResponse({ success: true }))
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      await client.get('/test', options);
      await client.get('/test', options);

      // Circuit should be closed - additional requests should work
      fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));
      const result = await client.get('/test', options);
      expect(result).toEqual({ success: true });
    });

    it('should respect half-open request limit', async () => {
      const options = {
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000,
          halfOpenLimit: 1
        }
      };

      // Force circuit open
      fetchMock
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(client.get('/test', options)).rejects.toThrow('API Error');
      await expect(client.get('/test', options)).rejects.toThrow('API Error');

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // First request in half-open should be allowed
      fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));
      const promise1 = client.get('/test', options);

      // Second request should be rejected due to limit
      const promise2 = client.get('/test', options);

      await expect(promise2).rejects.toThrow(CircuitOpenError);
      await expect(promise1).resolves.toEqual({ success: true });
    });
  });
});
