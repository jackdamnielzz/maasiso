import { monitoredFetch } from '../monitoredFetch';
import { getStaticFetchOptions, getListFetchOptions, getDynamicFetchOptions, FetchOptions } from '../api/cache';
import { clientEnv } from '../config/client-env';

interface LoadTestConfig {
  endpoint: string;
  requestsPerSecond: number;
  durationSeconds: number;
  concurrentUsers: number;
}

interface LoadTestResult {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  timestamps: number[];
  responseTimes: number[];
  errors: Error[];
}

interface RequestMetrics {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: Error;
  cacheHit: boolean;
}

/**
 * Performs load testing on specified API endpoints
 */
export class ApiLoadTester {
  private results: Map<string, RequestMetrics[]> = new Map();

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[index];
  }

  /**
   * Make a single request and record metrics
   */
  private async makeRequest(
    endpoint: string,
    options: FetchOptions
  ): Promise<RequestMetrics> {
    const startTime = Date.now();
    const metrics: RequestMetrics = {
      timestamp: startTime,
      duration: 0,
      success: false,
      cacheHit: false
    };

    try {
      const response = await monitoredFetch(
        endpoint,
        `${clientEnv.apiUrl}${endpoint}`,
        options
      );

      metrics.success = response.ok;
      metrics.cacheHit = response.headers.get('x-cache') === 'HIT';
    } catch (error) {
      metrics.success = false;
      metrics.error = error as Error;
    } finally {
      metrics.duration = Date.now() - startTime;
    }

    return metrics;
  }

  /**
   * Run load test for a specific endpoint
   */
  async runTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const {
      endpoint,
      requestsPerSecond,
      durationSeconds,
      concurrentUsers
    } = config;

    console.log(`Starting load test for ${endpoint}`, config);

    const totalRequests = requestsPerSecond * durationSeconds;
    const requestsPerUser = Math.ceil(totalRequests / concurrentUsers);
    const delayBetweenRequests = 1000 / requestsPerSecond;

    const metrics: RequestMetrics[] = [];
    this.results.set(endpoint, metrics);

    // Create user sessions
    const userSessions = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      for (let i = 0; i < requestsPerUser; i++) {
        // Determine request type and options
        const options = endpoint.includes('static')
          ? getStaticFetchOptions(endpoint)
          : endpoint.includes('list')
          ? getListFetchOptions(endpoint)
          : getDynamicFetchOptions();

        const result = await this.makeRequest(endpoint, options);
        metrics.push(result);

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    });

    // Wait for all user sessions to complete
    await Promise.all(userSessions);

    // Calculate results
    const successfulRequests = metrics.filter(m => m.success).length;
    const failedRequests = metrics.filter(m => !m.success).length;
    const cacheHits = metrics.filter(m => m.cacheHit).length;

    const responseTimes = metrics.map(m => m.duration).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    const result: LoadTestResult = {
      endpoint,
      totalRequests: metrics.length,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      errorRate: failedRequests / metrics.length,
      cacheHitRate: cacheHits / metrics.length,
      timestamps: metrics.map(m => m.timestamp),
      responseTimes,
      errors: metrics.filter(m => m.error).map(m => m.error!),
    };

    console.log(`Load test completed for ${endpoint}`, result);
    return result;
  }

  /**
   * Run a complete test suite across different endpoints
   */
  async runTestSuite(): Promise<Map<string, LoadTestResult>> {
    const results = new Map<string, LoadTestResult>();

    // Test static content endpoints
    const staticResult = await this.runTest({
      endpoint: '/api/pages/home',
      requestsPerSecond: 50,
      durationSeconds: 30,
      concurrentUsers: 10
    });
    results.set('static', staticResult);

    // Test list endpoints
    const listResult = await this.runTest({
      endpoint: '/api/blog-posts',
      requestsPerSecond: 30,
      durationSeconds: 30,
      concurrentUsers: 5
    });
    results.set('list', listResult);

    // Test dynamic endpoints
    const dynamicResult = await this.runTest({
      endpoint: '/api/blog-posts/latest',
      requestsPerSecond: 20,
      durationSeconds: 30,
      concurrentUsers: 3
    });
    results.set('dynamic', dynamicResult);

    return results;
  }

  /**
   * Generate a detailed report from test results
   */
  generateReport(results: Map<string, LoadTestResult>): string {
    let report = '# API Load Test Report\n\n';

    results.forEach((result, type) => {
      report += `## ${type} Endpoint (${result.endpoint})\n\n`;
      report += `- Total Requests: ${result.totalRequests}\n`;
      report += `- Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%\n`;
      report += `- Error Rate: ${(result.errorRate * 100).toFixed(2)}%\n`;
      report += `- Cache Hit Rate: ${(result.cacheHitRate * 100).toFixed(2)}%\n\n`;

      report += '### Response Times\n';
      report += `- Average: ${result.averageResponseTime.toFixed(2)}ms\n`;
      report += `- 95th Percentile: ${result.p95ResponseTime.toFixed(2)}ms\n`;
      report += `- 99th Percentile: ${result.p99ResponseTime.toFixed(2)}ms\n\n`;

      if (result.errors.length > 0) {
        report += '### Errors\n';
        result.errors.forEach(error => {
          report += `- ${error.message}\n`;
        });
        report += '\n';
      }
    });

    return report;
  }
}
