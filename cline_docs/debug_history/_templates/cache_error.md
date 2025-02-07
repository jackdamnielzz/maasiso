# Cache Debug Session Template

## Session Metadata
```yaml
id: DBG-YYYYMMDD-NNN
category: cache
type: [browser-cache|api-cache|static-cache]
component: [affected cache system]
status: in-progress
startTime: [ISO timestamp]
environment: [development|staging|production]
```

## Cache Context
### Cache Performance
```json
{
  "hitRate": {
    "current": "value",
    "threshold": "90%",
    "trend": "increasing|decreasing|stable"
  },
  "staleRate": {
    "current": "value",
    "threshold": "10%",
    "trend": "increasing|decreasing|stable"
  },
  "size": {
    "current": "value",
    "limit": "value",
    "trend": "increasing|decreasing|stable"
  },
  "invalidations": {
    "rate": "value",
    "pattern": "random|periodic|specific"
  }
}
```

### Cache Configuration
```typescript
interface CacheConfig {
  strategy: 'stale-while-revalidate' | 'cache-first' | 'network-first';
  ttl: {
    default: number;
    static: number;
    api: number;
  };
  invalidation: {
    automatic: boolean;
    triggers: string[];
  };
  storage: {
    type: 'memory' | 'persistent';
    maxSize: number;
  };
}
```

### Cache Tiers
```json
{
  "browser": {
    "status": "active|degraded|failed",
    "hitRate": "value",
    "size": "value"
  },
  "cdn": {
    "status": "active|degraded|failed",
    "hitRate": "value",
    "size": "value"
  },
  "api": {
    "status": "active|degraded|failed",
    "hitRate": "value",
    "size": "value"
  },
  "database": {
    "status": "active|degraded|failed",
    "hitRate": "value",
    "size": "value"
  }
}
```

## Investigation Steps

### [HH:MM] Cache Analysis
**Cache State:**
```json
{
  "entries": "count",
  "size": "value",
  "oldestEntry": "timestamp",
  "newestEntry": "timestamp",
  "invalidations": "count"
}
```

**Cache Patterns:**
- Access patterns
- Update frequency
- Invalidation triggers
- Storage utilization

**Cache Issues:**
- Identified problems
- Impact assessment
- Affected components

### [HH:MM] [Next Analysis Step]
**Focus Area:**
- What was analyzed

**Tools Used:**
- List of tools

**Results:**
- Findings from analysis

## Cache Optimization

### 1. Strategy Updates
```typescript
// Before
const cacheStrategy = {
  type: 'cache-first',
  ttl: 3600
};

// After
const cacheStrategy = {
  type: 'stale-while-revalidate',
  ttl: {
    fresh: 3600,
    stale: 7200
  },
  revalidate: async () => {
    // Revalidation logic
  }
};
```

### 2. Configuration Changes
```typescript
// Cache configuration updates
const cacheConfig = {
  before: {
    // Old configuration
  },
  after: {
    // New configuration
  },
  changes: [
    // List of changes
  ]
};
```

### 3. Monitoring Updates
```typescript
// New cache monitoring
const cacheMonitoring = {
  metrics: [
    'hitRate',
    'staleRate',
    'size',
    'invalidations'
  ],
  alerts: {
    hitRate: {
      threshold: 0.9,
      window: '5m'
    },
    staleRate: {
      threshold: 0.1,
      window: '5m'
    }
  }
};
```

## Verification

### 1. Cache Testing
```typescript
describe('Cache Optimization', () => {
  test('Hit rate improvement', async () => {
    // Test implementation
  });

  test('Stale content handling', async () => {
    // Test implementation
  });

  test('Invalidation effectiveness', async () => {
    // Test implementation
  });
});
```

### 2. Metrics Comparison
```json
{
  "before": {
    "hitRate": "value",
    "staleRate": "value",
    "size": "value",
    "invalidations": "value"
  },
  "after": {
    "hitRate": "value",
    "staleRate": "value",
    "size": "value",
    "invalidations": "value"
  },
  "improvement": {
    "hitRate": "percentage",
    "staleRate": "percentage",
    "size": "percentage",
    "invalidations": "percentage"
  }
}
```

### 3. Performance Impact
```json
{
  "responseTime": {
    "before": "value",
    "after": "value",
    "improvement": "percentage"
  },
  "serverLoad": {
    "before": "value",
    "after": "value",
    "improvement": "percentage"
  },
  "bandwidth": {
    "before": "value",
    "after": "value",
    "improvement": "percentage"
  }
}
```

## Prevention Measures

### 1. Cache Monitoring
```typescript
// Cache health checks
const healthChecks = {
  interval: '1m',
  checks: [
    'hitRate',
    'staleRate',
    'size',
    'invalidations'
  ],
  alerts: {
    channels: ['slack', 'email'],
    thresholds: {
      hitRate: 0.9,
      staleRate: 0.1
    }
  }
};
```

### 2. Automated Testing
```typescript
// Cache regression tests
describe('Cache Regression', () => {
  // Test implementations
});
```

### 3. Documentation Updates
- Cache strategy documentation
- Invalidation procedures
- Monitoring guidelines
- Troubleshooting guides

## Related Issues
- [Links to related cache issues]
- [Links to performance impacts]
- [Links to monitoring dashboards]

## Search Tags
- #cache
- #[cache-type]
- #[component-name]
- #optimization
