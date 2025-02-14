export interface NetworkInformation {
  effectiveType: string;
  type: string;
  rtt: number;
  downlink: number;
  metered: boolean;
  saveData: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

export interface NetworkQualityEvent {
  quality: number;
  throughput: number;
  latency: number;
  type: 'change';
}

export interface NetworkEventMap {
  'change': NetworkQualityEvent;
}

export interface NetworkMonitor {
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

export type NetworkEventListener<K extends keyof NetworkEventMap> = (
  ev: NetworkEventMap[K]
) => void;

export interface NetworkState {
  connected: boolean;
  quality: number;
  timestamp: number;
}
