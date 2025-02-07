# API Client Retry Logic Implementation

## Problem Description
The API client needed robust retry logic to handle various failure scenarios:
- Network errors
- Server errors (5xx status codes)
- Rate limiting (429)
- Configurable retry behavior

## Solution Components

### 1. Retry Configuration
```typescript
interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  useExponentialBackoff?: boolean;
  maxRetryDelay?: number;
  retryableStatusCodes?: number[];
  retryNetworkErrors?: boolean;
}
```

Default configuration:
```typescript
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  useExponentialBackoff: true,
  maxRetryDelay: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryNetworkErrors: true
};
```

### 2. Exponential Backoff
- Base delay increases exponentially with each retry
- Includes jitter to prevent thundering herd
- Respects maximum delay limit

```typescript
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  if (!config.useExponentialBackoff) {
    return config.retryDelay;
  }

  const exponentialDelay = config.retryDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return Math.min(exponentialDelay + jitter, config.maxRetryDelay);
}
```

### 3. Error Handling
- Custom ApiError class for HTTP errors
- Network error detection
- Status code based retry decisions

```typescript
function shouldRetry(error: Error, config: RetryConfig): boolean {
  if (config.retryNetworkErrors && error instanceof TypeError) {
    return true;
  }
  if (error instanceof ApiError) {
    return config.retryableStatusCodes.includes(error.status);
  }
  return false;
}
```

### 4. Request/Response Logging
- Logs all requests with timing information
- Tracks retry attempts
- Records error details

## Testing Strategy

1. Network Error Tests
```typescript
it('should retry on network errors', async () => {
  const networkError = new TypeError('Failed to fetch');
  fetchMock
    .mockRejectedValueOnce(networkError)
    .mockRejectedValueOnce(networkError)
    .mockResolvedValueOnce(createMockResponse({ success: true }));

  const result = await client.get('/test');
  expect(result).toEqual({ success: true });
  expect(fetchMock.mock.calls.length).toBe(3);
});
```

2. Status Code Tests
```typescript
it('should retry on specified status codes', async () => {
  fetchMock
    .mockResolvedValueOnce(createMockResponse({}, { status: 503 }))
    .mockResolvedValueOnce(createMockResponse({}, { status: 502 }))
    .mockResolvedValueOnce(createMockResponse({ success: true }));

  const result = await client.get('/test');
  expect(result).toEqual({ success: true });
});
```

3. Backoff Tests
```typescript
it('should use exponential backoff', async () => {
  vi.useFakeTimers();
  const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
  // ... test implementation
  expect(setTimeoutSpy.mock.calls[1][1]).toBeGreaterThan(
    setTimeoutSpy.mock.calls[0][1]
  );
});
```

## Usage Examples

### Basic Usage
```typescript
const result = await apiClient.get('/endpoint');
```

### Custom Retry Configuration
```typescript
const result = await apiClient.get('/endpoint', {
  retry: {
    maxRetries: 5,
    retryDelay: 500,
    useExponentialBackoff: true,
    maxRetryDelay: 5000,
    retryableStatusCodes: [500, 503]
  }
});
```

### POST with Retry
```typescript
const result = await apiClient.post('/endpoint', data, {
  retry: {
    maxRetries: 3,
    retryNetworkErrors: true
  }
});
```

## Benefits

1. **Reliability**
   - Automatic retry on transient failures
   - Graceful handling of network issues
   - Protection against rate limiting

2. **Performance**
   - Exponential backoff prevents server overload
   - Jitter prevents thundering herd
   - Configurable delays and limits

3. **Monitoring**
   - Comprehensive request logging
   - Error tracking
   - Performance metrics

4. **Flexibility**
   - Configurable retry behavior
   - Custom status code handling
   - Method-specific settings

## Related Files

- `frontend/src/lib/api/client.ts` - Main implementation
- `frontend/src/lib/tests/api-client.test.ts` - Test suite
- `frontend/src/lib/tests/test-utils.ts` - Testing utilities

## Future Improvements

1. **Caching Integration**
   - Cache successful responses
   - Serve stale data during retries
   - Cache invalidation on errors

2. **Circuit Breaking**
   - Track error rates
   - Temporarily disable retries
   - Gradual recovery

3. **Metrics Collection**
   - Success/failure rates
   - Response time tracking
   - Retry pattern analysis

## Tags
#api #retry-logic #error-handling #typescript #testing
