# API Debug Session Template

## Session Metadata
```yaml
id: DBG-YYYYMMDD-NNN
category: api
endpoint: [affected endpoint]
method: [HTTP method]
status: in-progress
startTime: [ISO timestamp]
environment: [development|staging|production]
```

## Error Context
### Initial Error
```
[Complete error message and stack trace]
```

### System State
- Strapi Version: [version]
- Node Version: [version]
- Git Commit: [hash]
- API Token: [last 4 chars]

### API Metrics
```json
{
  "endpoint": {
    "responseTime": "value (threshold: 200ms)",
    "errorRate": "value (threshold: 1%)",
    "requestsPerMinute": "value"
  },
  "cache": {
    "hitRate": "value (threshold: 90%)",
    "staleRate": "value (threshold: 10%)",
    "size": "value"
  },
  "authentication": {
    "tokenValidation": "status",
    "corsStatus": "status"
  }
}
```

## Investigation Steps

### [HH:MM] Initial Analysis
**Request Details:**
```http
[Complete HTTP request including headers]
```

**Response Details:**
```http
[Complete HTTP response including headers]
```

**Finding:**
- What was discovered

**Next Step:**
- What to check next

### [HH:MM] [Next Step Description]
**Action:**
- Steps taken

**Finding:**
- Results found

**Next Step:**
- Next action to take

## Resolution

### Root Cause
- Technical explanation of what caused the issue
- Contributing factors
- System weaknesses identified

### Solution Implementation
```typescript
// Code changes made
// With explanations
```

### API Response Before/After
```diff
- Previous Response
+ New Response
```

### Verification Steps
1. API Tests
   ```
   [Test results]
   ```

2. Integration Tests
   ```
   [Test results]
   ```

3. Performance Impact
   ```json
   {
     "before": {
       "responseTime": "value",
       "errorRate": "value",
       "cacheHitRate": "value"
     },
     "after": {
       "responseTime": "value",
       "errorRate": "value",
       "cacheHitRate": "value"
     }
   }
   ```

### Prevention Measures
1. Monitoring Added
   ```typescript
   // New monitoring code
   ```

2. Tests Added
   ```typescript
   // New test cases
   ```

3. Documentation Updated
   - API documentation changes
   - New error handling documentation
   - Updated integration guides

## Related Issues
- [Links to related debug sessions]
- [Links to related GitHub issues]
- [Links to related API documentation]

## Search Tags
- #api
- #[endpoint-name]
- #[error-type]
- #[http-method]

## API Reference
```typescript
// Updated API interface
interface UpdatedEndpoint {
  method: string;
  url: string;
  params: Record<string, any>;
  response: {
    success: ApiSuccessResponse;
    error: ApiErrorResponse;
  };
}
```

## Monitoring Updates
```typescript
// New monitoring rules
const newMonitoring = {
  endpoint: '[endpoint]',
  threshold: {
    responseTime: 200,
    errorRate: 0.01,
    cacheHitRate: 0.9
  },
  alerts: {
    slack: '#api-alerts',
    email: 'team@maasiso.com'
  }
};
