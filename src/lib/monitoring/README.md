# Monitoring System

A comprehensive monitoring system for tracking performance metrics and errors in the application. This system provides real-time monitoring of core web vitals, JavaScript errors, network issues, and React component errors.

## Features

- Performance monitoring (Core Web Vitals)
- Error tracking and logging
- Network request monitoring
- React component error tracking
- Warning system for non-critical issues

## Performance Monitoring

The performance monitoring system tracks the following metrics:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Usage

```tsx
import { initPerformanceMonitoring } from '@/lib/monitoring/performance';

// Initialize in your app
initPerformanceMonitoring();
```

### Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|------------------|------|
| FCP    | ≤1.8s| 1.8s - 3.0s     | >3.0s|
| LCP    | ≤2.5s| 2.5s - 4.0s     | >4.0s|
| FID    | ≤100ms| 100ms - 300ms   | >300ms|
| CLS    | ≤0.1 | 0.1 - 0.25      | >0.25|
| TTFB   | ≤0.8s| 0.8s - 1.8s     | >1.8s|

## Error Monitoring

The error monitoring system captures:

- Uncaught JavaScript errors
- Unhandled promise rejections
- Network request errors
- React component errors
- Custom warnings and errors

### Usage with Error Boundaries

```tsx
import { ErrorBoundary } from '@/components/core/ErrorBoundary';
import { errorMonitor } from '@/providers/MonitoringProvider';

// Automatically logs errors from error boundaries
function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}

// Manual error logging
errorMonitor.logError({
  message: 'Custom error message',
  type: 'error',
  source: 'custom',
  timestamp: Date.now(),
  url: window.location.href,
  userAgent: window.navigator.userAgent,
  metadata: {
    customField: 'value',
  },
});

// Warning logging
errorMonitor.logWarning('Warning message', {
  source: 'feature-name',
});
```

### Network Error Monitoring

Network errors are automatically captured for fetch requests. The system tracks:

- HTTP error responses (non-200 status codes)
- Network failures
- Request timeouts

## Integration with External Services

The monitoring system is designed to be extensible. To integrate with external monitoring services (e.g., Sentry, LogRocket):

1. Modify the `logError` method in `error.ts`
2. Add your service's API calls in the TODO section
3. Configure any necessary environment variables

Example:

```typescript
// In error.ts
logError(details: ErrorDetails) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', details);
  }

  // Send to your monitoring service
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(details);
  }
}
```

## Best Practices

1. Error Boundaries:
   - Place error boundaries strategically around major features
   - Provide meaningful error messages
   - Include retry functionality where appropriate

2. Performance Monitoring:
   - Monitor trends over time
   - Set up alerts for degrading metrics
   - Regularly review performance data

3. Error Logging:
   - Include relevant context in error metadata
   - Use appropriate error types and sources
   - Add stack traces when available

4. Custom Monitoring:
   - Use warning logs for non-critical issues
   - Add custom metrics for business-critical features
   - Monitor user interactions when relevant

## Testing

The monitoring system includes comprehensive tests:

```bash
# Run all monitoring tests
npm test src/lib/monitoring

# Run specific test file
npm test src/lib/monitoring/monitoring.test.ts
```

## Configuration

The monitoring system can be configured through environment variables:

```env
# Enable/disable monitoring in development
NEXT_PUBLIC_ENABLE_MONITORING=true

# External service configuration
NEXT_PUBLIC_SENTRY_DSN=your-dsn
NEXT_PUBLIC_LOGROCKET_APP_ID=your-app-id
```

## Future Improvements

1. Add real-time monitoring dashboard
2. Implement custom metric tracking
3. Add user session tracking
4. Enhance error grouping and categorization
5. Add performance budget monitoring