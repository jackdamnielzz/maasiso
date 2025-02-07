import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ApiCache, apiCache, CacheError } from '../api/cache';

describe('ApiCache', () => {
  const mockErrorHandler = vi.fn();
  const cache = new ApiCache({
    ttl: 1000,
    maxEntries: 3,
    onError: mockErrorHandler
  });

  beforeEach(() => {
    cache.clear();
    mockErrorHandler.mockClear();
    vi.useFakeTimers();
  });

  test('should store and retrieve values', () => {
    cache.set('valid-key', { data: 'test' });
    expect(cache.get('valid-key')).toEqual({ data: 'test' });
  });

  test('should return undefined for expired entries', () => {
    cache.set('temp', { data: 'temp' }, 10);
    vi.advanceTimersByTime(100);
    expect(cache.get('temp')).toBeUndefined();
  });

  test('should handle invalid keys gracefully', () => {
    cache.set('', { data: 'invalid' });
    expect(cache.get('')).toBeUndefined();
    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(CacheError)
    );
    expect(mockErrorHandler.mock.calls[0][0].message).toBe('Cache key must be a non-empty string');
  });

  test('should prevent caching empty objects', () => {
    cache.set('empty', {});
    expect(cache.get('empty')).toBeUndefined();
    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(CacheError)
    );
    expect(mockErrorHandler.mock.calls[0][0].message).toBe('Refusing to cache empty object');
  });

  test('should enforce max entries limit', () => {
    cache.set('key1', '1');
    cache.set('key2', '2');
    cache.set('key3', '3');
    cache.set('key4', '4');
    
    expect(cache.getStats().size).toBe(3);
    expect(cache.get('key1')).toBeUndefined();
  });

  test('should provide accurate statistics', () => {
    cache.set('stat1', '1');
    cache.set('stat2', '2');
    cache.get('missing');
    
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.activeEntries).toBe(2);
  });

  test('singleton instance should work', () => {
    apiCache.set('singleton', 'works');
    expect(apiCache.get('singleton')).toBe('works');
  });

  test('should handle undefined and null keys', () => {
    cache.set(undefined, 'test');
    cache.set(null, 'test');
    expect(cache.get(undefined)).toBeUndefined();
    expect(cache.get(null)).toBeUndefined();
  });

  test('should handle undefined values', () => {
    cache.set('key', undefined);
    expect(cache.get('key')).toBeUndefined();
  });

  test('cleanup should remove expired entries', () => {
    cache.set('expire1', 'data1', 50);
    cache.set('expire2', 'data2', 150);
    
    vi.advanceTimersByTime(100);
    cache.cleanup();
    
    expect(cache.get('expire1')).toBeUndefined();
    expect(cache.get('expire2')).toBe('data2');
  });
});
