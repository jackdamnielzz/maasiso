import { describe, beforeEach, it, expect } from 'vitest';
import { benchmark } from './utils';
import { ApiCache } from '../api/cache';
import type { BenchmarkResult } from './types';

interface TestData {
  id?: number;
  value: string | number;
  data?: string;
}

describe('Cache Performance', () => {
  let cache: ApiCache;

  beforeEach(() => {
    cache = new ApiCache({
      onError: error => console.error('Cache error:', error)
    });
  });

  it('measures cache set performance', async () => {
    const testData: TestData = { id: 1, value: 'test' };
    const ttl = 1000;

    const { metrics } = await benchmark<void>(
      'Cache - set operation',
      async () => {
        const key = `test-key-${Date.now()}`;
        cache.set(key, testData, ttl);
        return Promise.resolve();
      },
      1000 // Many iterations for accurate measurement
    );

    // Cache set should be very fast
    expect(metrics.p95).toBeLessThan(1); // Less than 1ms
  });

  it('measures cache get performance', async () => {
    const testData: TestData = { id: 1, value: 'test' };
    const key = 'test-key';
    const ttl = 5000;

    // Prime the cache
    await cache.set(key, testData, ttl);

    const { metrics } = await benchmark<TestData | undefined>(
      'Cache - get operation',
      async () => cache.get(key),
      10000 // Many iterations for accurate measurement
    );

    // Cache retrieval should be extremely fast
    expect(metrics.p95).toBeLessThan(0.5); // Less than 0.5ms
  });

  it('measures cache hit ratio', async () => {
    const items = 100;
    const operations = 1000;
    const accessPattern = [
      // Frequently accessed items (80% of operations)
      ...Array(Math.floor(operations * 0.8)).fill(null).map(() => 
        Math.floor(Math.random() * (items * 0.2)) // Access first 20% of items
      ),
      // Less frequently accessed items (20% of operations)
      ...Array(Math.floor(operations * 0.2)).fill(null).map(() => 
        Math.floor(Math.random() * items)
      )
    ].sort(() => Math.random() - 0.5); // Shuffle access pattern

    const ttl = 5000;

    // Prime the cache with all possible items
    await Promise.all(
      Array(items).fill(null).map((_, i) => 
        cache.set(`key-${i}`, { value: `data-${i}` }, ttl)
      )
    );

    let hits = 0;
    let misses = 0;

    // Execute access pattern
    for (const itemIndex of accessPattern) {
      const key = `key-${itemIndex}`;
      const result = await cache.get<TestData>(key);
      
      if (result !== undefined) {
        hits++;
      } else {
        misses++;
        // Simulate real-world behavior: cache miss leads to cache set
        await cache.set(key, { value: `data-${itemIndex}` }, ttl);
      }
    }

    const hitRatio = hits / operations;
    console.log('\nCache Hit Ratio:');
    console.log(`Hits: ${hits}`);
    console.log(`Misses: ${misses}`);
    console.log(`Ratio: ${(hitRatio * 100).toFixed(2)}%`);

    // Hit ratio should be close to target
    expect(hitRatio).toBeGreaterThan(0.75);
  });

  it('measures stale-while-revalidate performance', async () => {
    const key = 'test-key';
    const initialData: TestData = { value: 'initial' };
    const updatedData: TestData = { value: 'updated' };
    const ttl = 1;

    // Set initial data
    await cache.set(key, initialData, ttl);

    // Wait for data to become stale
    await new Promise(resolve => setTimeout(resolve, ttl + 1));

    // Prepare revalidation function
    const revalidate = async () => {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API call
      return updatedData;
    };

    const { metrics } = await benchmark<TestData>(
      'Cache - stale-while-revalidate',
      async () => {
        const staleData = await cache.get<TestData>(key);
        if (staleData) {
          // Trigger background revalidation
          revalidate().then(newData => cache.set(key, newData, ttl));
          return staleData;
        }
        const newData = await revalidate();
        await cache.set(key, newData, ttl);
        return newData;
      },
      100
    );

    // Stale data should be returned quickly
    expect(metrics.p95).toBeLessThan(1); // Less than 1ms for stale data
  });

  it('measures cache memory usage', async () => {
    const items = 10000;
    const dataSize = 1000; // ~1KB per item
    const ttl = 5000;

    // Generate test data
    const generateData = (size: number) => {
      return Array(size).fill('x').join('');
    };

    // Record starting memory
    const startMemory = process.memoryUsage();

    // Fill cache
    for (let i = 0; i < items; i++) {
      await cache.set(
        `key-${i}`,
        { data: generateData(dataSize) },
        ttl
      );
    }

    // Record ending memory
    const endMemory = process.memoryUsage();

    // Calculate memory impact
    const heapDiff = endMemory.heapUsed - startMemory.heapUsed;
    const heapPerItem = heapDiff / items;

    console.log('\nCache Memory Usage:');
    console.log(`Total heap impact: ${(heapDiff / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Average heap per item: ${(heapPerItem / 1024).toFixed(2)}KB`);
    console.log(`Items stored: ${items}`);

    // Memory usage should be reasonable
    expect(heapPerItem).toBeLessThan(2048); // Less than 2KB overhead per item
  });

  it('measures concurrent operation performance', async () => {
    const operations = 1000;
    const concurrentOperations = 50;
    const ttl = 5000;

    const { metrics } = await benchmark<Array<TestData | undefined>>(
      'Cache - concurrent operations',
      () => Promise.all(
        Array(concurrentOperations).fill(null).map((_, i) => {
          const key = `concurrent-key-${i}`;
          cache.set(key, { value: i }, ttl);
          return cache.get(key);
        })
      ),
      operations / concurrentOperations
    );

    // Average time per operation should be good
    const avgTimePerOperation = metrics.mean / concurrentOperations;
    console.log(`\nAverage time per concurrent operation: ${avgTimePerOperation.toFixed(2)}ms`);
    expect(avgTimePerOperation).toBeLessThan(1);
  });
});
