import type {
  TimingMetric,
  PerformanceMetrics,
  BenchmarkResult,
  NetworkCondition,
  NetworkSettings
} from './types';

/**
 * Calculate percentile from sorted array of numbers
 */
function calculatePercentile(sortedData: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sortedData.length) - 1;
  return sortedData[index];
}

/**
 * Calculate performance metrics from array of timing measurements
 */
function calculateMetrics(timings: number[]): PerformanceMetrics {
  const sorted = [...timings].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    p50: calculatePercentile(sorted, 50),
    p95: calculatePercentile(sorted, 95),
    p99: calculatePercentile(sorted, 99),
    samples: sorted.length
  };
}

/**
 * Performance measurement wrapper
 */
async function measure<T>(
  operation: () => Promise<T>
): Promise<{ result: T; timing: TimingMetric }> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();

  return {
    result,
    timing: {
      start,
      end,
      duration: end - start
    }
  };
}

/**
 * Run multiple iterations of an operation and collect timing metrics
 */
async function benchmark<T>(
  name: string,
  operation: () => Promise<T>,
  iterations: number = 100
): Promise<BenchmarkResult<T>> {
  console.log(`Running benchmark: ${name}`);
  console.log(`Iterations: ${iterations}`);

  const timings: number[] = [];
  const results: T[] = [];

  for (let i = 0; i < iterations; i++) {
    const { result, timing } = await measure(operation);
    timings.push(timing.duration);
    results.push(result);

    // Progress indicator every 10%
    if (i % Math.max(1, Math.floor(iterations / 10)) === 0) {
      console.log(`Progress: ${Math.round((i / iterations) * 100)}%`);
    }
  }

  const metrics = calculateMetrics(timings);

  console.log('\nResults:');
  console.log(`Min: ${metrics.min.toFixed(2)}ms`);
  console.log(`Max: ${metrics.max.toFixed(2)}ms`);
  console.log(`Mean: ${metrics.mean.toFixed(2)}ms`);
  console.log(`P50: ${metrics.p50.toFixed(2)}ms`);
  console.log(`P95: ${metrics.p95.toFixed(2)}ms`);
  console.log(`P99: ${metrics.p99.toFixed(2)}ms`);
  console.log(`Samples: ${metrics.samples}`);

  return { metrics, results };
}

/**
 * Simulate network conditions
 */
function simulateNetworkCondition(condition: NetworkCondition): NetworkSettings {
  const conditions: Record<NetworkCondition, NetworkSettings> = {
    '4g': { latency: 100, downloadSpeed: 1000 }, // 1 Mbps
    '3g': { latency: 200, downloadSpeed: 750 }, // 750 Kbps
    '2g': { latency: 300, downloadSpeed: 250 }, // 250 Kbps
    'slow-2g': { latency: 500, downloadSpeed: 100 } // 100 Kbps
  };

  return conditions[condition];
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Measure memory usage
 */
function getMemoryUsage(): { used: number; total: number } | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize
    };
  }
  return null;
}

/**
 * Report memory metrics
 */
function reportMemoryMetrics(): void {
  const memory = getMemoryUsage();
  if (memory) {
    console.log('\nMemory Usage:');
    console.log(`Used: ${formatBytes(memory.used)}`);
    console.log(`Total: ${formatBytes(memory.total)}`);
    console.log(`Utilization: ${((memory.used / memory.total) * 100).toFixed(2)}%`);
  }
}

export {
  calculateMetrics,
  measure,
  benchmark,
  simulateNetworkCondition,
  formatBytes,
  getMemoryUsage,
  reportMemoryMetrics
};
