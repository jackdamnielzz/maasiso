import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from '../api/client';
import { 
  MockFetchFn, 
  createFetchMock, 
  createApiTestScenarios,
  createMockApiResponse
} from './test-utils';

describe('ApiClient', () => {
  let client: ApiClient;
  let fetchMock: MockFetchFn;
  let scenarios: ReturnType<typeof createApiTestScenarios<{ id: string }>>;

  beforeEach(() => {
    client = new ApiClient();
    fetchMock = createFetchMock();
    global.fetch = fetchMock;
    scenarios = createApiTestScenarios({ id: 'test-123' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      fetchMock
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.success);

      const result = await client.get('/test', {
        retry: {
          maxRetries: 3,
          retryDelay: 10,
          retryNetworkErrors: true
        }
      });

      expect(result).toEqual({
        data: { id: 'test-123' },
        success: true,
        timestamp: expect.any(String)
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should retry on specified status codes', async () => {
      fetchMock
        .mockImplementationOnce(scenarios.serverError)
        .mockImplementationOnce(scenarios.rateLimited)
        .mockImplementationOnce(scenarios.success);

      const result = await client.get('/test', {
        retry: {
          maxRetries: 3,
          retryDelay: 10,
          retryableStatusCodes: [429, 500]
        }
      });

      expect(result).toEqual({
        data: { id: 'test-123' },
        success: true,
        timestamp: expect.any(String)
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable status codes', async () => {
      fetchMock.mockImplementationOnce(scenarios.forbidden);

      await expect(client.get('/test')).rejects.toThrow(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should respect maximum retry attempts', async () => {
      fetchMock
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.networkError);

      await expect(client.get('/test', {
        retry: {
          maxRetries: 3,
          retryDelay: 10
        }
      })).rejects.toThrow('Network error');

      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      fetchMock
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.success);

      const promise = client.get('/test', {
        retry: {
          maxRetries: 3,
          retryDelay: 100,
          useExponentialBackoff: true
        }
      });

      // Run retries
      for (let i = 0; i < 2; i++) {
        await vi.runAllTimersAsync();
      }

      await promise;

      // First retry should be around 100ms (+ jitter)
      expect(setTimeoutSpy.mock.calls[0][1]).toBeGreaterThanOrEqual(100);
      expect(setTimeoutSpy.mock.calls[0][1]).toBeLessThanOrEqual(200);

      // Second retry should be around 200ms (+ jitter)
      expect(setTimeoutSpy.mock.calls[1][1]).toBeGreaterThanOrEqual(200);
      expect(setTimeoutSpy.mock.calls[1][1]).toBeLessThanOrEqual(300);

      vi.useRealTimers();
    });

    it('should respect maximum retry delay', async () => {
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      fetchMock
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.networkError)
        .mockImplementationOnce(scenarios.success);

      const promise = client.get('/test', {
        retry: {
          maxRetries: 3,
          retryDelay: 100,
          useExponentialBackoff: true,
          maxRetryDelay: 150
        }
      });

      // Run retries
      for (let i = 0; i < 2; i++) {
        await vi.runAllTimersAsync();
      }

      await promise;

      // All delays should be <= maxRetryDelay
      setTimeoutSpy.mock.calls.forEach(call => {
        expect(call[1]).toBeLessThanOrEqual(150);
      });

      vi.useRealTimers();
    });
  });

  describe('HTTP Methods', () => {
    it('should send GET request', async () => {
      fetchMock.mockImplementationOnce(scenarios.success);
      
      const result = await client.get('/test');
      
      expect(result).toEqual({
        data: { id: 'test-123' },
        success: true,
        timestamp: expect.any(String)
      });
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'GET'
      });
    });

    it('should send POST request with data', async () => {
      fetchMock.mockImplementationOnce(scenarios.success);
      
      const data = { name: 'test' };
      await client.post('/test', data);

      const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
      const headers = new Headers(requestInit.headers);
      expect(requestInit.method).toBe('POST');
      expect(requestInit.body).toBe(JSON.stringify(data));
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should send PUT request with data', async () => {
      fetchMock.mockImplementationOnce(scenarios.success);
      
      const data = { name: 'test' };
      await client.put('/test', data);

      const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
      const headers = new Headers(requestInit.headers);
      expect(requestInit.method).toBe('PUT');
      expect(requestInit.body).toBe(JSON.stringify(data));
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should send DELETE request', async () => {
      fetchMock.mockImplementationOnce(scenarios.success);
      
      await client.delete('/test');
      
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'DELETE'
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError for non-2xx responses', async () => {
      fetchMock.mockImplementationOnce(scenarios.notFound);

      try {
        await client.get('/test');
        fail('Expected ApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(404);
        expect(apiError.message).toBe('API Error: 404 Resource not found');
      }
    });

    it('should include response details in ApiError', async () => {
      const response = createMockApiResponse({ code: 'INVALID_INPUT', details: ['Field required'] }, {
        status: 400,
        headers: { 'x-request-id': '123' }
      });
      fetchMock.mockResolvedValueOnce(response);

      try {
        await client.get('/test');
        fail('Expected ApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.response).toBeDefined();
        expect(apiError.data).toEqual({
          data: { code: 'INVALID_INPUT', details: ['Field required'] },
          success: true,
          timestamp: expect.any(String)
        });
      }
    });

    it('should handle network timeouts', async () => {
      vi.useFakeTimers();
      fetchMock.mockImplementationOnce(scenarios.timeout);

      const promise = client.get<unknown>('/test', { timeout: 1000 });
      const timeoutCheck = expect(promise).rejects.toThrow('Request timeout');
      
      await vi.advanceTimersByTimeAsync(1500);
      
      await timeoutCheck;
      
      vi.useRealTimers();
    });
  });

  describe('Request Configuration', () => {
    it('should merge custom headers', async () => {
      fetchMock.mockImplementationOnce(scenarios.success);

      await client.get<unknown>('/test', {
        headers: {
          'X-Custom-Header': 'test',
          'Authorization': 'Bearer token'
        }
      });

      const requestHeaders = new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers);
      expect(requestHeaders.get('X-Custom-Header')).toBe('test');
      expect(requestHeaders.get('Authorization')).toBe('Bearer token');
    });

    it('should handle query parameters', async () => {
      fetchMock.mockImplementationOnce(scenarios.success);

      await client.get<unknown>('/test', {
        params: {
          page: 1,
          limit: 10,
          filter: 'active'
        }
      });

      const requestedUrl = String(fetchMock.mock.calls[0][0]);
      expect(requestedUrl).toContain('/test?page=1&limit=10&filter=active');
    });

    it('should support response type configuration', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      fetchMock.mockResolvedValueOnce(new Response(blob));

      const result = await client.get<Blob>('/test', { responseType: 'blob' });
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
