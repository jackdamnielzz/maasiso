import { describe, beforeEach, it, expect } from 'vitest';
import { benchmark } from './utils';
import { CircuitBreaker, CircuitBreakerConfig } from '../api/circuit-breaker';
import type { BenchmarkResult } from './types';

describe('Circuit Breaker Performance', () => {
  let breaker: CircuitBreaker;
  const config: Required<CircuitBreakerConfig> = {
    failureThreshold: 5,
    resetTimeout: 1000,
    halfOpenLimit: 3,
    failureWindow: 60000
  };

  beforeEach(() => {
    breaker = new CircuitBreaker(config);
  });

  it('measures successful operation performance', async () => {
    const operation = () => Promise.resolve('success');

    const { metrics } = await benchmark(
      'Circuit breaker - successful operation',
      () => breaker.execute(operation),
      1000 // More iterations for accurate overhead measurement
    );

    // Circuit breaker overhead should be minimal
    expect(metrics.p95).toBeLessThan(1); // Less than 1ms overhead
  });

  it('measures failure detection performance', async () => {
    const operation = () => Promise.reject(new Error('test error'));
    let failures = 0;

    const { metrics } = await benchmark(
      'Circuit breaker - failure detection',
      async () => {
        try {
          await breaker.execute(operation);
        } catch (error) {
          failures++;
          return failures;
        }
      },
      config.failureThreshold * 2 // Test beyond failure threshold
    );

    // Failure detection should be quick
    expect(metrics.p95).toBeLessThan(5); // Less than 5ms
    expect(failures).toBeGreaterThan(config.failureThreshold);
  });

  it('measures state transition performance', async () => {
    const failOperation = () => Promise.reject(new Error('test error'));
    const successOperation = () => Promise.resolve('success');

    // Force circuit breaker to open
    for (let i = 0; i < config.failureThreshold; i++) {
      try {
        await breaker.execute(failOperation);
      } catch (error) {
        // Expected
      }
    }

    // Measure transition timing
    const startTime = performance.now();
    
    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, config.resetTimeout));

    // Attempt half-open state operations
    const { metrics } = await benchmark(
      'Circuit breaker - half-open state',
      () => breaker.execute(successOperation),
      config.halfOpenLimit
    );

    const totalTransitionTime = performance.now() - startTime;

    // Log transition timing
    console.log('\nCircuit Breaker State Transition:');
    console.log(`Total transition time: ${totalTransitionTime.toFixed(2)}ms`);
    console.log(`Average operation time in half-open state: ${metrics.mean.toFixed(2)}ms`);

    // Transitions should be timely
    expect(totalTransitionTime).toBeGreaterThanOrEqual(config.resetTimeout);
    expect(metrics.p95).toBeLessThan(5); // Operations in half-open state should be quick
  });

  it('measures concurrent operation performance', async () => {
    const operation = () => Promise.resolve('success');
    const concurrentOperations = 10;

    const { metrics } = await benchmark(
      'Circuit breaker - concurrent operations',
      () => Promise.all(
        Array(concurrentOperations).fill(null).map(() => 
          breaker.execute(operation)
        )
      ),
      50
    );

    // Average time per operation should be good
    const avgTimePerOperation = metrics.mean / concurrentOperations;
    console.log(`\nAverage time per concurrent operation: ${avgTimePerOperation.toFixed(2)}ms`);
    expect(avgTimePerOperation).toBeLessThan(2);
  });

  it('measures memory usage under load', async () => {
    const operation = () => Promise.resolve('success');
    const iterations = 10000;

    // Record starting memory
    const startMemory = process.memoryUsage();

    // Run many operations
    await Promise.all(
      Array(iterations).fill(null).map(() => 
        breaker.execute(operation)
      )
    );

    // Record ending memory
    const endMemory = process.memoryUsage();

    // Calculate memory impact
    const heapDiff = endMemory.heapUsed - startMemory.heapUsed;
    const heapPerOperation = heapDiff / iterations;

    console.log('\nCircuit Breaker Memory Usage:');
    console.log(`Total heap impact: ${(heapDiff / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Average heap per operation: ${heapPerOperation.toFixed(2)} bytes`);

    // Memory impact should be reasonable
    expect(heapPerOperation).toBeLessThan(1000); // Less than 1KB per operation
  });
});
