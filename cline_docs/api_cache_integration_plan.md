# API Cache Integration Plan

## Current Status
We have two separate components that need to be integrated:
1. ApiCache class (in-memory caching with TTL)
2. ApiClient with retry logic

## Integration Goals
1. Cache GET requests automatically
2. Support cache configuration per request
3. Maintain type safety
4. Handle stale data during retries

## Implementation Plan

### Phase 1: Cache Configuration

Add cache options to FetchOptions:
```typescript
interface CacheOptions {
  /** Enable caching for this request */
  cache?: boolean;
  /** Time to live in milliseconds */
  ttl?: number;
  /** Use stale data while revalidating */
  staleWhileRevalidate?: boolean;
}

interface FetchOptions extends RequestInit {
  retry?: RetryConfig;
  cache?: CacheOptions;
}
```

### Phase 2: ApiClient Integration

Modify GET method to handle caching:
```typescript
class ApiClient {
  private cache = new ApiCache();

  async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const url = this.getUrl(path);
    
    // Try cache first
    if (options.cache?.cache !== false) {
      const cached = this.cache.get<T>(url);
      if (cached !== null) {
        return cached;
      }
    }

    // Fetch fresh data
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'GET',
    });
    const data = await response.json();

    // Cache the response
    if (options.cache?.cache !== false) {
      this.cache.set(url, data, options.cache?.ttl);
    }

    return data;
  }
}
```

### Phase 3: Stale Data Handling

Add support for stale-while-revalidate:
```typescript
async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = this.getUrl(path);
  
  // Check cache
  const cached = this.cache.get<T>(url);
  
  if (options.cache?.staleWhileRevalidate && cached !== null) {
    // Return stale data immediately and revalidate in background
    this.revalidate(url, options).catch(console.error);
    return cached;
  }
  
  // Normal flow...
}

private async revalidate(url: string, options: FetchOptions): Promise<void> {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      method: 'GET',
    });
    const data = await response.json();
    this.cache.set(url, data, options.cache?.ttl);
  } catch (error) {
    // Log but don't throw since this is background revalidation
    console.error('Background revalidation failed:', error);
  }
}
```

### Phase 4: Cache Headers Support

Add support for cache control headers:
```typescript
function getCacheTTL(response: Response, options: FetchOptions): number | undefined {
  // Check Cache-Control header
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl) {
    const maxAge = cacheControl.match(/max-age=(\d+)/);
    if (maxAge) {
      return parseInt(maxAge[1], 10) * 1000; // Convert to milliseconds
    }
  }
  
  // Fall back to options
  return options.cache?.ttl;
}
```

### Phase 5: Testing

1. Cache Hit Tests
```typescript
it('should return cached data', async () => {
  const data = { test: 'data' };
  client.cache.set('/test', data);
  
  const result = await client.get('/test');
  expect(result).toEqual(data);
  expect(fetchMock).not.toHaveBeenCalled();
});
```

2. Stale Data Tests
```typescript
it('should return stale data while revalidating', async () => {
  const staleData = { test: 'stale' };
  const freshData = { test: 'fresh' };
  
  client.cache.set('/test', staleData);
  fetchMock.mockResolvedValueOnce(createMockResponse(freshData));
  
  const result = await client.get('/test', {
    cache: { staleWhileRevalidate: true }
  });
  
  expect(result).toEqual(staleData);
  await vi.runAllTimersAsync();
  expect(client.cache.get('/test')).toEqual(freshData);
});
```

3. Cache Control Tests
```typescript
it('should respect cache-control headers', async () => {
  const headers = new Headers({
    'Cache-Control': 'max-age=60'
  });
  
  fetchMock.mockResolvedValueOnce(createMockResponse(
    { test: 'data' },
    { headers }
  ));
  
  await client.get('/test');
  expect(client.cache.getTTL('/test')).toBe(60000);
});
```

## Success Criteria

1. Performance
   - Reduced API calls for cached data
   - Fast response times with stale data
   - Efficient background revalidation

2. Reliability
   - Proper cache invalidation
   - Correct TTL handling
   - Graceful error handling

3. Developer Experience
   - Simple cache configuration
   - Clear cache behavior
   - Type-safe responses

## Timeline

1. Day 1: Cache Configuration & Basic Integration
2. Day 2: Stale Data Handling
3. Day 3: Cache Headers Support
4. Day 4: Testing & Documentation
5. Day 5: Review & Optimization

## Future Improvements

1. Cache Persistence
   - LocalStorage backup
   - IndexedDB storage
   - Cache synchronization

2. Cache Invalidation
   - Pattern-based invalidation
   - Resource dependencies
   - Manual invalidation API

3. Performance Optimization
   - Compression
   - Partial caching
   - Preloading
