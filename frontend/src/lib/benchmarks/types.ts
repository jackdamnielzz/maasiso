export interface TimingMetric {
  start: number;
  end: number;
  duration: number;
}

export interface PerformanceMetrics {
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  p99: number;
  samples: number;
}

export interface BenchmarkResult<T> {
  metrics: PerformanceMetrics;
  results: T[];
}

export type NetworkCondition = '4g' | '3g' | '2g' | 'slow-2g';

export interface NetworkSettings {
  latency: number;
  downloadSpeed: number;
}
