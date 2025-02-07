import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../api/client';
import { MockFetchFn, createFetchMock, createMockResponse } from './test-utils';

describe('API Cache Integration', () => {
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

  describe('GET Request Caching', () => {
    it('should cache successful GET responses', async () => {
      const data = { test: 'data' };
      fetchMock.mockResolvedValueOnce(createMockResponse(data));

      // First request should hit the network
      const result1 = await client.get('/test');
      expect(result1).toEqual(data);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second request should use cache
      const result2 = await client.get('/test');
      expect(result2).toEqual(data);
      expect(fetchMock).toHaveBeenCalledTimes(1); // No additional network request
    });

    it('should respect cache TTL', async () => {
      const data = { test: 'data' };
      fetchMock.mockResolvedValueOnce(createMockResponse(data));

      // First request
      await client.get('/test', {
        cacheOptions: { ttl: 1000 } // 1 second TTL
      });

      // Advance time past TTL
      await vi.advanceTimersByTimeAsync(1500);

      // Second request should hit network again
      await client.get('/test');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should handle stale-while-revalidate', async () => {
      const staleData = { test: 'stale' };
      const freshData = { test: 'fresh' };

      // Initial request
      fetchMock.mockResolvedValueOnce(createMockResponse(staleData));
      await client.get('/test');

      // Advance time past TTL
      await vi.advanceTimersByTimeAsync(6 * 60 * 1000); // Past default 5 minute TTL

      // Setup mock for revalidation
      fetchMock.mockResolvedValueOnce(createMockResponse(freshData));

      // Request with stale-while-revalidate
      const result = await client.get('/test', {
        cacheOptions: { staleWhileRevalidate: true }
      });

      // Should immediately return stale data
      expect(result).toEqual(staleData);

      // Run any pending promises
      await vi.runAllTimersAsync();

      // Cache should be updated with fresh data
      const finalResult = await client.get('/test');
      expect(finalResult).toEqual(freshData);
    });

    it('should respect Cache-Control header', async () => {
      const data = { test: 'data' };
      const headers = new Headers({
        'Cache-Control': 'max-age=60' // 60 seconds
      });

      fetchMock.mockResolvedValueOnce(createMockResponse(data, { headers }));
      await client.get('/test');

      // Advance time by 30 seconds (within max-age)
      await vi.advanceTimersByTimeAsync(30 * 1000);
      await client.get('/test');
      expect(fetchMock).toHaveBeenCalledTimes(1); // Should use cache

      // Advance time past max-age
      await vi.advanceTimersByTimeAsync(31 * 1000);
      await client.get('/test');
      expect(fetchMock).toHaveBeenCalledTimes(2); // Should revalidate
    });

    it('should force revalidation when requested', async () => {
      const oldData = { test: 'old' };
      const newData = { test: 'new' };

      // Initial request
      fetchMock.mockResolvedValueOnce(createMockResponse(oldData));
      await client.get('/test');

      // Setup mock for revalidation
      fetchMock.mockResolvedValueOnce(createMockResponse(newData));

      // Force revalidation
      const result = await client.get('/test', {
        cacheOptions: { revalidate: true }
      });

      expect(result).toEqual(newData);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should not cache when disabled', async () => {
      const data = { test: 'data' };
      fetchMock.mockResolvedValueOnce(createMockResponse(data));

      // First request with caching disabled
      await client.get('/test', {
        cacheOptions: { enabled: false }
      });

      // Second request should hit network again
      await client.get('/test', {
        cacheOptions: { enabled: false }
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should not cache error responses', async () => {
      const error = new Error('API Error');
      fetchMock
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      // First request fails
      await expect(client.get('/test')).rejects.toThrow(error);

      // Second request should succeed and not use cache
      const result = await client.get('/test');
      expect(result).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should handle revalidation errors gracefully', async () => {
      const staleData = { test: 'stale' };
      fetchMock
        .mockResolvedValueOnce(createMockResponse(staleData))
        .mockRejectedValueOnce(new Error('Revalidation failed'));

      // Initial request
      await client.get('/test');

      // Advance time past TTL
      await vi.advanceTimersByTimeAsync(6 * 60 * 1000);

      // Request with stale-while-revalidate
      const result = await client.get('/test', {
        cacheOptions: { staleWhileRevalidate: true }
      });

      // Should return stale data despite revalidation error
      expect(result).toEqual(staleData);

      // Run any pending promises
      await vi.runAllTimersAsync();

      // Stale data should still be available
      const finalResult = await client.get('/test', {
        cacheOptions: { staleWhileRevalidate: true }
      });
      expect(finalResult).toEqual(staleData);
    });
  });
});
