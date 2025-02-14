import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { benchmark, simulateNetworkCondition } from './utils';
import { ApiClient } from '../api/client';
import { BatchProcessingError } from '../api/request-queue';
import { env } from '../env';
import type { NetworkCondition } from './types';

// Mock API endpoint for consistent testing
const TEST_API_URL = 'https://jsonplaceholder.typicode.com';

describe('API Client Performance', () => {
  let apiClient: InstanceType<typeof ApiClient>;

  beforeEach(() => {
    // Override env for testing
    env.apiUrl = TEST_API_URL;
    apiClient = new ApiClient();

    // Setup default mock fetch
    global.fetch = vi.fn().mockImplementation(async (url: string, options: RequestInit = {}) => {
      // Simulate network latency based on URL
      const urlStr = url.toString();
      const networkCondition = (['4g', '3g', '2g'] as NetworkCondition[])
        .find(c => urlStr.includes(c));
      
      if (networkCondition) {
        const network = simulateNetworkCondition(networkCondition);
        await new Promise(resolve => setTimeout(resolve, network.latency));
      }

      // Handle batch requests
      if (options.body && typeof options.body === 'string' && (urlStr.includes('/batch') || urlStr.endsWith('/batch'))) {
        console.debug('Mock received batch request:', {
          url,
          method: options.method,
          headers: options.headers,
          body: JSON.parse(options.body)
        });

        // Verify Content-Type
        const headers = options.headers as Record<string, string>;
        const contentType = headers?.['Content-Type'] || '';
        if (!contentType.includes('application/json')) {
          console.error('Invalid Content-Type:', contentType);
          throw new BatchProcessingError(
            'Invalid Content-Type for batch request',
            'batch'
          );
        }

        let batchRequests;
        try {
          batchRequests = JSON.parse(options.body);
          console.debug('Parsed batch requests:', batchRequests);
        } catch (e) {
          const error = e as Error;
          console.error('Failed to parse batch body:', options.body);
          throw new BatchProcessingError(
            `Failed to parse batch request body: ${error.message}`,
            'batch'
          );
        }
        
        // Validate batch request format
        if (!Array.isArray(batchRequests)) {
          console.error('Invalid batch format:', typeof batchRequests, batchRequests);
          throw new BatchProcessingError(
            `Invalid batch request format: expected array, got ${typeof batchRequests}`,
            'batch'
          );
        }

        // Add small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 10));

        // Process each request in the batch
        const results = batchRequests.map(req => {
          try {
            // Type check request format
            if (
              typeof req !== 'object' ||
              typeof req.url !== 'string' ||
              typeof req.method !== 'string' ||
              typeof req.headers !== 'object'
            ) {
              throw new Error(`Invalid request format: ${JSON.stringify(req)}`);
            }

            // Extract ID from URL string
            const urlParts = req.url.toString().split('/');
            const id = parseInt(urlParts[urlParts.length - 1] || '0');
            return {
              error: null,
              data: {
                id,
                value: `test-${id}`
              }
            };
          } catch (e) {
            const error = e as Error;
            console.error('Failed to process batch request:', error);
            return {
              error: error.message,
              data: null
            };
          }
        });

        console.debug('Mock processed batch results:', results);

        // Return batch response
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            data: results.map(r => r.data).filter(Boolean) // Extract data and filter out nulls
          }),
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Batch-Size': batchRequests.length.toString(),
            'X-Batch-Key': `GET:${url}`
          })
        });
      }

      // Handle regular requests
      const isRegularRequest = !urlStr.includes('/batch');
      if (isRegularRequest) {
        // Extract ID from URL for consistent response format
        const urlParts = urlStr.split('/');
        const id = parseInt(urlParts[urlParts.length - 1] || '0');
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [{
              id,
              value: `test-${id}`
            }]
          }),
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=3600'
          })
        });
      }

      // If we get here, something went wrong with batch handling
      throw new BatchProcessingError(
        'Unhandled batch request',
        'batch'
      );
    });
  });

  afterEach(() => {
    // Reset env and mocks
    env.apiUrl = '';
    vi.restoreAllMocks();
  });

  it('measures base request performance', async () => {
    const { metrics } = await benchmark(
      'GET /posts',
      () => apiClient.get('/posts'),
      50 // Reduced iterations for external API
    );

    // Success criteria: p95 < 200ms
    expect(metrics.p95).toBeLessThan(200);
  });

  it('measures cache performance improvement', async () => {
    // First request to populate cache
    await apiClient.get('/posts/1', {
      cacheOptions: {
        enabled: true,
        ttl: 5000
      }
    });

    const { metrics } = await benchmark(
      'GET /posts/1 (cached)',
      () => apiClient.get('/posts/1', {
        cacheOptions: {
          enabled: true,
          ttl: 5000
        }
      }),
      100
    );

    // Cache should be significantly faster
    expect(metrics.p95).toBeLessThan(50);
  });

  it('measures request batching efficiency', async () => {
    const batchSize = 5;
    const requests = Array.from({ length: batchSize }, (_, i) => i + 1);
    
    // Mock endpoint that supports batching
    const mockEndpoint = '/api/batch';

    interface TestResponse {
      data: {
        id: number;
        value: string;
      };
    }

    const { metrics, results } = await benchmark<TestResponse[]>(
      'Batch GET requests',
      () => Promise.all(
        requests.map(id => 
          apiClient.get<TestResponse>(`${mockEndpoint}/${id}`, {
            batch: {
              maxBatchSize: batchSize,
              maxDelay: 50,
              deduplicate: true
            }
          })
        )
      ),
      20 // Reduced iterations for batch testing
    );

    // Verify first batch of results
    results[0].forEach((result, index) => {
      expect(result.data.id).toBe(index + 1);
      expect(result.data.value).toBe(`test-${index + 1}`);
    });

    // Average time per request should be good
    const avgTimePerRequest = metrics.mean / batchSize;
    expect(avgTimePerRequest).toBeLessThan(100);

    // Cleanup
    vi.restoreAllMocks();
  });

  it('measures stale-while-revalidate performance', async () => {
    // Initial request to populate cache
    await apiClient.get('/posts/1', {
      cacheOptions: {
        enabled: true,
        ttl: 1,
        staleWhileRevalidate: true
      }
    });

    // Wait for cache to become stale
    await new Promise(resolve => setTimeout(resolve, 2));

    const { metrics } = await benchmark(
      'GET /posts/1 (stale-while-revalidate)',
      () => apiClient.get('/posts/1', {
        cacheOptions: {
          enabled: true,
          ttl: 1,
          staleWhileRevalidate: true
        }
      }),
      50
    );

    // Should return stale data quickly
    expect(metrics.p95).toBeLessThan(50);
  });

  it('measures performance under different network conditions', async () => {
    const conditions: NetworkCondition[] = ['4g', '3g', '2g'];
    
    for (const condition of conditions) {
      const network = simulateNetworkCondition(condition);
      
      const { metrics } = await benchmark(
        `GET /${condition}`,
        () => apiClient.get(`/${condition}`, {
          timeout: network.latency * 3
        }),
        20
      );

      // Log results for analysis
      console.log(`\nNetwork condition: ${condition}`);
      console.log(`Expected latency: ${network.latency}ms`);
      console.log(`Actual p95: ${metrics.p95.toFixed(2)}ms`);

      // Verify latency is within reasonable range
      // Allow for some overhead in processing
      const maxExpectedLatency = network.latency + 50; // 50ms overhead
      expect(metrics.p95).toBeLessThan(maxExpectedLatency);
    }

    // Cleanup
    vi.restoreAllMocks();
  });
});
