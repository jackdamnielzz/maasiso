# Network Monitor Documentation

## Overview

The Network Monitor system provides real-time monitoring of network conditions, enabling applications to adapt their behavior based on connection quality. It uses the Network Information API with a fallback to health checks for broader browser support.

## API Reference

### NetworkMonitor Interface

```typescript
interface NetworkMonitor {
  start(): void;
  stop(): void;
  isConnected(): boolean;
  getConnectionQuality(): number;
  addEventListener<K extends keyof NetworkEventMap>(
    type: K,
    listener: (ev: NetworkEventMap[K]) => void
  ): void;
  removeEventListener<K extends keyof NetworkEventMap>(
    type: K,
    listener: (ev: NetworkEventMap[K]) => void
  ): void;
}
```

#### Methods

- `start()`: Initializes monitoring and starts periodic health checks
- `stop()`: Stops monitoring and cleans up event listeners
- `isConnected()`: Returns current connection status (boolean)
- `getConnectionQuality()`: Returns connection quality score (0-1)
- `addEventListener()`: Registers a listener for network events
- `removeEventListener()`: Removes a previously registered listener

### Connection Quality

The quality score (0-1) is calculated using multiple factors:
- Download speed (60% weight)
- Network latency (40% weight)
- Connection type adjustments:
  - 4G/WiFi: No adjustment
  - 3G: 20% reduction
  - 2G: 50% reduction

## Usage Examples

### Basic Setup

```typescript
import { BrowserNetworkMonitor } from './network-monitor';

const monitor = new BrowserNetworkMonitor();

// Start monitoring
monitor.start();

// Check connection status
if (monitor.isConnected()) {
  const quality = monitor.getConnectionQuality();
  console.log(`Connection quality: ${quality}`);
}

// Stop monitoring when done
monitor.stop();
```

### Event Handling

```typescript
const monitor = new BrowserNetworkMonitor();

// Listen for network changes
monitor.addEventListener('change', (event) => {
  const quality = monitor.getConnectionQuality();
  console.log(`Network quality changed: ${quality}`);
  
  // Adapt application behavior
  if (quality < 0.3) {
    // Poor connection: Enable offline mode
  } else if (quality < 0.7) {
    // Fair connection: Reduce data usage
  } else {
    // Good connection: Full functionality
  }
});

monitor.start();
```

## Integration Patterns

### Circuit Breaker Integration

The Network Monitor works with the Circuit Breaker pattern to prevent cascade failures:

```typescript
const monitor = new BrowserNetworkMonitor();
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});

monitor.addEventListener('change', () => {
  const quality = monitor.getConnectionQuality();
  
  // Adjust circuit breaker thresholds based on network quality
  if (quality < 0.3) {
    breaker.updateConfig({
      failureThreshold: 3,  // More sensitive
      resetTimeout: 60000   // Longer reset
    });
  } else {
    breaker.updateConfig({
      failureThreshold: 5,  // Normal sensitivity
      resetTimeout: 30000   // Normal reset
    });
  }
});
```

### Request Batching Integration

Adapt batch processing based on network conditions:

```typescript
const monitor = new BrowserNetworkMonitor();
const requestQueue = new RequestQueue({
  maxBatchSize: 10,
  maxWaitTime: 100
});

monitor.addEventListener('change', () => {
  const quality = monitor.getConnectionQuality();
  
  // Adjust batch parameters based on network quality
  if (quality < 0.5) {
    requestQueue.updateConfig({
      maxBatchSize: 5,     // Smaller batches
      maxWaitTime: 200     // Longer collection window
    });
  } else {
    requestQueue.updateConfig({
      maxBatchSize: 10,    // Normal batch size
      maxWaitTime: 100     // Normal timing
    });
  }
});
```

### Cache Integration

Optimize cache behavior based on network conditions:

```typescript
const monitor = new BrowserNetworkMonitor();
const cache = new Cache({
  staleness: 300000  // 5 minutes
});

monitor.addEventListener('change', () => {
  const quality = monitor.getConnectionQuality();
  
  // Adjust cache parameters based on network quality
  if (quality < 0.3) {
    cache.updateConfig({
      staleness: 600000    // 10 minutes
    });
  } else {
    cache.updateConfig({
      staleness: 300000    // 5 minutes
    });
  }
});
```

## Performance Considerations

### Health Check Timing
- Default interval: 30 seconds
- Configurable through constructor options
- Consider increasing interval on mobile devices
- Health checks use HEAD requests to minimize data usage

### Resource Usage
- Minimal CPU impact
- Low memory footprint
- Negligible network overhead (HEAD requests)
- Event listeners are cleaned up on stop()

### Browser Support
- Primary: Network Information API
- Fallback: Health check ping
- Always available: navigator.onLine

### Best Practices
1. Start monitoring early in application lifecycle
2. Clean up by calling stop() when monitoring is no longer needed
3. Use debounced handlers for change events
4. Implement graceful degradation for poor connections
5. Cache quality values to prevent excessive calculations

## Error Handling

```typescript
const monitor = new BrowserNetworkMonitor();

try {
  monitor.start();
} catch (error) {
  console.error('Failed to start network monitoring:', error);
  // Fallback to assuming good connection
}

monitor.addEventListener('change', (event) => {
  try {
    // Handle network changes
  } catch (error) {
    console.error('Error handling network change:', error);
  }
});
```

## Revision History
- 2024-01-11: Initial documentation
