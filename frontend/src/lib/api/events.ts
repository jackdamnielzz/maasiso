/**
 * Type-safe event emitter implementation
 */

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventCallback<T> = (data: T) => void;

export abstract class TypedEventEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: Array<EventCallback<T[K]>> } = {};

  on<K extends EventKey<T>>(event: K, callback: EventCallback<T[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
  }

  off<K extends EventKey<T>>(event: K, callback: EventCallback<T[K]>): void {
    const callbacks = this.listeners[event];
    if (callbacks) {
      this.listeners[event] = callbacks.filter(cb => cb !== callback);
    }
  }

  emit<K extends EventKey<T>>(event: K, data: T[K]): void {
    this.listeners[event]?.forEach(callback => callback(data));
  }

  removeAllListeners<K extends EventKey<T>>(event?: K): void {
    if (event) {
      this.listeners[event] = [];
    } else {
      this.listeners = {};
    }
  }
}

// Define event types for each component
export interface RequestQueueEvents {
  'batch-processed': {
    duration: number;
    successCount: number;
    errorCount: number;
    queueSize: number;
  };
}

export interface CircuitBreakerEvents {
  'state-change': {
    state: string;
    failures: number;
  };
}

export interface ApiCacheEvents {
  'cache-hit': string;
  'cache-miss': string;
}

// Export event emitter types
export type RequestQueueEmitter = TypedEventEmitter<RequestQueueEvents>;
export type CircuitBreakerEmitter = TypedEventEmitter<CircuitBreakerEvents>;
export type ApiCacheEmitter = TypedEventEmitter<ApiCacheEvents>;
