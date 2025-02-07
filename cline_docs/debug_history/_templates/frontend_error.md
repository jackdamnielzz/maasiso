# Frontend Debug Session Template

## Session Metadata
```yaml
id: DBG-YYYYMMDD-NNN
category: frontend
component: [component name]
route: [affected route]
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
- Node Version: [version]
- Next.js Version: [version]
- Git Commit: [hash]
- Environment Variables: [relevant env vars]

### Performance Metrics
```json
{
  "coreWebVitals": {
    "LCP": "value (threshold: 2500ms)",
    "FID": "value (threshold: 100ms)",
    "CLS": "value (threshold: 0.1)",
    "TTFB": "value (threshold: 800ms)",
    "TTI": "value (threshold: 3800ms)"
  },
  "resourceMetrics": {
    "imageLoading": "value (threshold: 1000ms)",
    "scriptLoading": "value (threshold: 500ms)",
    "cssSize": "value (threshold: 50KB)",
    "totalBundleSize": "value (threshold: 200KB)"
  }
}
```

## Investigation Steps

### [HH:MM] Initial Analysis
**Action:**
- What was checked

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

### Verification Steps
1. Component Tests
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
       "metric": "value"
     },
     "after": {
       "metric": "value"
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
   - Files changed
   - New documentation added

## Related Issues
- [Links to related debug sessions]
- [Links to related GitHub issues]

## Search Tags
- #frontend
- #[component-name]
- #[specific-feature]
- #[error-type]
