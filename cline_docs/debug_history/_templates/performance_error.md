# Performance Debug Session Template

## Session Metadata
```yaml
id: DBG-YYYYMMDD-NNN
category: performance
component: [affected component/route]
type: [core-web-vitals|resource-loading|api-performance|cache]
status: in-progress
startTime: [ISO timestamp]
environment: [development|staging|production]
```

## Performance Context
### Core Web Vitals
```json
{
  "LCP": {
    "current": "value",
    "threshold": "2500ms",
    "p75": "value",
    "trend": "increasing|decreasing|stable"
  },
  "FID": {
    "current": "value",
    "threshold": "100ms",
    "p75": "value",
    "trend": "increasing|decreasing|stable"
  },
  "CLS": {
    "current": "value",
    "threshold": "0.1",
    "p75": "value",
    "trend": "increasing|decreasing|stable"
  },
  "TTFB": {
    "current": "value",
    "threshold": "800ms",
    "p75": "value",
    "trend": "increasing|decreasing|stable"
  },
  "TTI": {
    "current": "value",
    "threshold": "3800ms",
    "p75": "value",
    "trend": "increasing|decreasing|stable"
  }
}
```

### Resource Performance
```json
{
  "images": {
    "loadTime": "value (threshold: 1000ms)",
    "size": "value",
    "optimizationRate": "value (threshold: 95%)"
  },
  "scripts": {
    "loadTime": "value (threshold: 500ms)",
    "size": "value",
    "chunkCount": "value"
  },
  "styles": {
    "size": "value (threshold: 50KB)",
    "unusedRules": "percentage"
  },
  "totalBundle": {
    "size": "value (threshold: 200KB)",
    "gzippedSize": "value"
  }
}
```

### API Performance
```json
{
  "endpoints": {
    "responseTime": "value (threshold: 200ms)",
    "errorRate": "value (threshold: 1%)",
    "requestsPerMinute": "value"
  },
  "cache": {
    "hitRate": "value (threshold: 90%)",
    "staleRate": "value (threshold: 10%)",
    "size": "value"
  }
}
```

## Investigation Steps

### [HH:MM] Performance Profiling
**Tools Used:**
- Chrome DevTools Performance Panel
- Next.js Analytics
- Custom Performance Monitoring

**Metrics Collected:**
```json
{
  "rendering": {
    "componentBreakdown": [
      {
        "component": "name",
        "renderTime": "value",
        "rerendersCount": "value"
      }
    ]
  },
  "network": {
    "requests": "count",
    "totalSize": "value",
    "cacheHits": "value"
  },
  "memory": {
    "heapSize": "value",
    "garbageCollections": "count"
  }
}
```

**Findings:**
- Performance bottlenecks identified
- Resource loading issues
- Rendering inefficiencies

### [HH:MM] [Next Analysis Step]
**Focus Area:**
- What was analyzed

**Tools Used:**
- List of tools

**Results:**
- Findings from analysis

## Optimization Implementation

### 1. Component Optimizations
```typescript
// Before
const Component = () => {
  // Unoptimized code
};

// After
const Component = memo(() => {
  // Optimized code
});
```

### 2. Resource Optimizations
```typescript
// Image optimization
const imageLoader = {
  before: "unoptimized loading",
  after: "optimized with next/image"
};

// Bundle optimization
const bundleConfig = {
  before: "single chunk",
  after: "code splitting strategy"
};
```

### 3. API/Cache Optimizations
```typescript
// Cache strategy
const cacheConfig = {
  before: "no caching",
  after: "tiered caching with SWR"
};
```

## Verification

### 1. Performance Testing
```typescript
describe('Performance Improvements', () => {
  test('Component render time', async () => {
    // Test implementation
  });

  test('Resource loading', async () => {
    // Test implementation
  });

  test('API response time', async () => {
    // Test implementation
  });
});
```

### 2. Metrics Comparison
```json
{
  "before": {
    "LCP": "value",
    "FID": "value",
    "CLS": "value",
    "bundleSize": "value",
    "apiResponseTime": "value"
  },
  "after": {
    "LCP": "value",
    "FID": "value",
    "CLS": "value",
    "bundleSize": "value",
    "apiResponseTime": "value"
  },
  "improvement": {
    "LCP": "percentage",
    "FID": "percentage",
    "CLS": "percentage",
    "bundleSize": "percentage",
    "apiResponseTime": "percentage"
  }
}
```

### 3. User Experience Validation
- Lighthouse scores
- Real User Monitoring (RUM) data
- User feedback metrics

## Prevention Measures

### 1. Performance Budgets
```json
{
  "metrics": {
    "LCP": "2500ms",
    "FID": "100ms",
    "CLS": "0.1",
    "bundleSize": "200KB",
    "apiResponse": "200ms"
  },
  "monitoring": {
    "frequency": "every 5 minutes",
    "alerts": {
      "threshold": "90% of budget",
      "channels": ["slack", "email"]
    }
  }
}
```

### 2. Automated Testing
```typescript
// New performance test suite
describe('Performance Regression Tests', () => {
  // Test implementations
});
```

### 3. Documentation Updates
- Performance best practices
- Optimization guidelines
- Monitoring procedures

## Related Issues
- [Links to related performance issues]
- [Links to optimization tickets]
- [Links to monitoring dashboards]

## Search Tags
- #performance
- #[specific-metric]
- #[component-name]
- #optimization
