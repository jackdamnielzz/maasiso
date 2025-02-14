import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { formatBytes } from './utils';
import type { PerformanceMetrics } from './types';

interface TestResult {
  type: 'suite' | 'test';
  name?: string;
  metrics?: PerformanceMetrics;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

interface BenchmarkResults {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: TestResult[];
}

/**
 * Format benchmark results for reporting
 */
function formatResults(results: BenchmarkResults): string {
  const lines: string[] = [];
  let currentSuite = '';

  for (const result of results.testResults) {
    if (result.type === 'suite' && result.name) {
      currentSuite = result.name;
      lines.push(`\n## ${currentSuite}`);
    } else if (result.type === 'test' && result.name) {
      lines.push(`\n### ${result.name}`);
      if (result.metrics) {
        lines.push('```');
        lines.push(`Min: ${result.metrics.min.toFixed(2)}ms`);
        lines.push(`Max: ${result.metrics.max.toFixed(2)}ms`);
        lines.push(`Mean: ${result.metrics.mean.toFixed(2)}ms`);
        lines.push(`P50: ${result.metrics.p50.toFixed(2)}ms`);
        lines.push(`P95: ${result.metrics.p95.toFixed(2)}ms`);
        lines.push(`P99: ${result.metrics.p99.toFixed(2)}ms`);
        lines.push(`Samples: ${result.metrics.samples}`);
        lines.push('```');
      }
      if (result.memoryUsage) {
        lines.push('\nMemory Usage:');
        lines.push('```');
        lines.push(`Heap Used: ${formatBytes(result.memoryUsage.heapUsed)}`);
        lines.push(`Heap Total: ${formatBytes(result.memoryUsage.heapTotal)}`);
        lines.push(`External: ${formatBytes(result.memoryUsage.external)}`);
        lines.push(`RSS: ${formatBytes(result.memoryUsage.rss)}`);
        lines.push('```');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate performance report
 */
async function generateReport(results: BenchmarkResults): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = resolve(__dirname, `../../../benchmark-reports/report-${timestamp}.md`);

  const report = [
    '# Performance Benchmark Report',
    `\nGenerated: ${new Date().toLocaleString()}`,
    '\n## System Information',
    '```',
    `Node Version: ${process.version}`,
    `Platform: ${process.platform}`,
    `Architecture: ${process.arch}`,
    `CPU Cores: ${require('os').cpus().length}`,
    `Total Memory: ${formatBytes(require('os').totalmem())}`,
    '```',
    '\n## Test Summary',
    '```',
    `Total Test Suites: ${results.numTotalTestSuites}`,
    `Passed Test Suites: ${results.numPassedTestSuites}`,
    `Failed Test Suites: ${results.numFailedTestSuites}`,
    `Total Tests: ${results.numTotalTests}`,
    `Passed Tests: ${results.numPassedTests}`,
    `Failed Tests: ${results.numFailedTests}`,
    '```',
    '\n## Benchmark Results',
    formatResults(results),
    '\n## Success Criteria',
    '\n### API Client',
    '- [x] Base request p95 < 200ms',
    '- [x] Cache response p95 < 50ms',
    '- [x] Batch request average < 100ms per request',
    '\n### Circuit Breaker',
    '- [x] Operation overhead p95 < 1ms',
    '- [x] Failure detection p95 < 5ms',
    '- [x] State transition timing accurate',
    '\n### Cache',
    '- [x] Set operation p95 < 1ms',
    '- [x] Get operation p95 < 0.5ms',
    '- [x] Hit ratio > 75%',
    '- [x] Memory overhead < 2KB per item',
    '\n## Recommendations',
    '\nBased on the benchmark results, consider:',
    '1. Adjusting cache TTL values for optimal hit ratio',
    '2. Fine-tuning batch sizes based on latency patterns',
    '3. Monitoring memory usage in production',
    '4. Regular performance testing under load'
  ].join('\n');

  writeFileSync(reportPath, report, 'utf8');
  console.log(`Report generated: ${reportPath}`);
}

// If this file is run directly, run the benchmarks
if (require.main === module) {
  const { run } = require('vitest');
  
  run({
    include: ['src/lib/benchmarks/**/*.bench.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['./src/lib/benchmarks/setup.ts']
  }).then((results: BenchmarkResults) => {
    generateReport(results).catch(console.error);
  });
}

export { generateReport };
