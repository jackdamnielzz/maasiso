import { NetworkEventListener, NetworkEventMap, NetworkMonitor, NetworkState } from './network-types';

// Define NetworkConnection type for TypeScript
interface NetworkConnection extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}


export type { NetworkMonitor };

export class BrowserNetworkMonitor implements NetworkMonitor {
  private state: NetworkState = {
    connected: true,
    quality: 1,
    timestamp: Date.now()
  };

  private listeners: Map<keyof NetworkEventMap, Set<NetworkEventListener<any>>> = new Map();
  private checkInterval: number | undefined;

  start(): void {
    if (this.checkInterval) return;

    // Initial state
    this.updateConnectionState();

    // Listen for connection changes
    navigator.connection?.addEventListener('change', this.handleConnectionChange);

    // Periodically check connection quality
    this.checkInterval = window.setInterval(() => {
      this.checkConnectionQuality();
    }, 30000); // Check every 30 seconds
  }

  stop(): void {
    if (!this.checkInterval) return;

    navigator.connection?.removeEventListener('change', this.handleConnectionChange);
    
    window.clearInterval(this.checkInterval);
    this.checkInterval = undefined;
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  getConnectionQuality(): number {
    return this.state.quality;
  }

  addEventListener<K extends keyof NetworkEventMap>(
    type: K,
    listener: NetworkEventListener<K>
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener<K extends keyof NetworkEventMap>(
    type: K,
    listener: NetworkEventListener<K>
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  private handleConnectionChange = () => {
    this.updateConnectionState();
    this.dispatchEvent('change', {
      type: 'change',
      quality: this.state.quality,
      throughput: navigator.connection?.downlink || 0,
      latency: navigator.connection?.rtt || 0
    });
  };

  private updateConnectionState(): void {
    const connection = navigator.connection;
    const prevState = { ...this.state };

    // Update connection status
    this.state.connected = navigator.onLine;
    this.state.timestamp = Date.now();

    // Calculate connection quality (0-1)
    if (connection) {
      const { downlink, effectiveType, rtt } = connection;
      
      // Normalize metrics to 0-1 range
      const speedScore = Math.min(downlink / 10, 1); // Assume 10 Mbps is max
      const latencyScore = Math.max(0, 1 - (rtt / 1000)); // Assume 1000ms is min
      
      // Weight the scores (favor speed slightly)
      this.state.quality = (speedScore * 0.6) + (latencyScore * 0.4);

      // Adjust for connection type
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        this.state.quality *= 0.5;
      } else if (effectiveType === '3g') {
        this.state.quality *= 0.8;
      }
    } else {
      // Fallback if Network Information API not available
      this.state.quality = this.state.connected ? 1 : 0;
    }

    // Dispatch change event if state changed significantly
    if (
      prevState.connected !== this.state.connected ||
      Math.abs(prevState.quality - this.state.quality) > 0.2
    ) {
      this.dispatchEvent('change', {
        type: 'change',
        quality: this.state.quality,
        throughput: navigator.connection?.downlink || 0,
        latency: navigator.connection?.rtt || 0
      });
    }
  }

  private async checkConnectionQuality(): Promise<void> {
    try {
      const start = Date.now();
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const rtt = Date.now() - start;
        const quality = Math.max(0, 1 - (rtt / 1000)); // 1000ms = 0 quality
        
        if (Math.abs(this.state.quality - quality) > 0.2) {
          this.state.quality = quality;
          this.state.timestamp = Date.now();
          this.dispatchEvent('change', {
            type: 'change',
            quality: this.state.quality,
            throughput: navigator.connection?.downlink || 0,
            latency: navigator.connection?.rtt || 0
          });
        }
      }
    } catch (error) {
      // Failed health check indicates poor connection
      if (this.state.quality > 0.3) {
        this.state.quality = 0.3; // Reduce quality but don't assume complete failure
        this.state.timestamp = Date.now();
        this.dispatchEvent('change', {
          type: 'change',
          quality: this.state.quality,
          throughput: navigator.connection?.downlink || 0,
          latency: navigator.connection?.rtt || 0
        });
      }
    }
  }

  private dispatchEvent<K extends keyof NetworkEventMap>(
    type: K,
    event: NetworkEventMap[K]
  ): void {
    this.listeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in network event listener:', error);
      }
    });
  }
}
