import { clientEnv } from '../config/client-env';
import { apiLogger } from '../monitoring/logger';
import { ApiCache } from './cache';
import { CircuitBreaker, CircuitBreakerConfig, CircuitOpenError } from './circuit-breaker';
import { RequestQueue, BatchConfig } from './request-queue';
import { BrowserNetworkMonitor } from './network-monitor';
import { NetworkMonitor, NetworkEventMap } from './network-types';
import { CircuitBreakerState } from '../monitoring/types';

// Enable debug logging in development
const DEBUG = clientEnv.debug;

// Event interfaces
interface RequestQueueEvents {
  'batch-processed': (metrics: { duration: number; successCount: number; errorCount: number; queueSize: number }) => void;
}

interface CircuitBreakerEvents {
  'state-change': (state: CircuitBreakerState) => void;
}

interface ApiCacheEvents {
  'cache-hit': (key: string) => void;
  'cache-miss': (key: string) => void;
}

// Extend the classes to include event handling
declare module './request-queue' {
  export interface RequestQueue {
    on<K extends keyof RequestQueueEvents>(event: K, listener: RequestQueueEvents[K]): void;
  }
}

declare module './circuit-breaker' {
  export interface CircuitBreaker {
    on<K extends keyof CircuitBreakerEvents>(event: K, listener: CircuitBreakerEvents[K]): void;
    stats: { failures: number };
  }
}

declare module './cache' {
  export interface ApiCache {
    on<K extends keyof ApiCacheEvents>(event: K, listener: ApiCacheEvents[K]): void;
  }
}


interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay between retries in milliseconds */
  retryDelay?: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff?: boolean;
  /** Maximum delay between retries in milliseconds */
  maxRetryDelay?: number;
  /** Status codes that should trigger a retry */
  retryableStatusCodes?: number[];
  /** Whether to retry on network errors */
  retryNetworkErrors?: boolean;
}

interface ApiCacheOptions {
  /** Enable caching for this request (default: true for GET requests) */
  enabled?: boolean;
  /** Time to live in milliseconds */
  ttl?: number;
  /** Use stale data while revalidating */
  staleWhileRevalidate?: boolean;
  /** Force cache revalidation */
  revalidate?: boolean;
}

type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';

interface FetchOptions extends Omit<RequestInit, 'cache'> {
  /** Retry configuration */
  retry?: RetryConfig;
  /** Cache configuration */
  cacheOptions?: ApiCacheOptions;
  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerConfig;
  /** Batch configuration */
  batch?: BatchConfig;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Query parameters */
  params?: Record<string, string | number | boolean>;
  /** Response type */
  responseType?: ResponseType;
}

/** Default cache configuration */
const DEFAULT_CACHE_CONFIG: Required<ApiCacheOptions> = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: false,
  revalidate: false
};

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  useExponentialBackoff: true,
  maxRetryDelay: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryNetworkErrors: true
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any,
    public response?: Response
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Calculate delay for next retry attempt
 */
function calculateRetryDelay(attempt: number, config: Required<RetryConfig>): number {
  if (!config.useExponentialBackoff) {
    return config.retryDelay;
  }

  const exponentialDelay = config.retryDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return Math.min(exponentialDelay + jitter, config.maxRetryDelay);
}

/**
 * Check if an error should trigger a retry
 */
function shouldRetry(error: Error, config: Required<RetryConfig>): boolean {
  if (config.retryNetworkErrors && error instanceof TypeError) {
    return true;
  }

  if (error instanceof ApiError) {
    return config.retryableStatusCodes.includes(error.status);
  }

  return false;
}

/**
 * Convert Headers object to plain object
 */
function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * Add query parameters to URL
 */
function addQueryParams(url: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return url;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Create AbortController with timeout
 */
function createTimeoutController(timeout?: number): { controller: AbortController; timeoutId?: number } {
  const controller = new AbortController();
  if (!timeout) return { controller };

  const timeoutId = window.setTimeout(() => {
    controller.abort(new Error('Request timeout'));
  }, timeout);

  return { controller, timeoutId };
}

async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const retryConfig: Required<RetryConfig> = {
    ...DEFAULT_RETRY_CONFIG,
    ...options.retry
  };

  const headers = new Headers(options.headers);

  if (clientEnv.strapiToken) {
    headers.set('Authorization', `Bearer ${clientEnv.strapiToken}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add query parameters
  const urlWithParams = addQueryParams(url, options.params);

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    const requestLog = apiLogger.logRequest(
      options.method || 'GET',
      urlWithParams,
      headers,
      options.body
    );
    const startTime = Date.now();

    // Setup timeout
    const { controller, timeoutId } = createTimeoutController(options.timeout);

    try {
      const response = await fetch(urlWithParams, {
        ...options,
        headers,
        signal: controller.signal,
      });

      // Clear timeout if request completed
      if (timeoutId) clearTimeout(timeoutId);

      // Handle response based on type
      let data: any;
      if (options.responseType) {
        data = await response[options.responseType]();
      } else {
        data = await response.json().catch(() => null);
      }

      apiLogger.logResponse(requestLog, response, data, startTime);

      if (!response.ok) {
        const error = new ApiError(response.status, response.statusText, data, response);
        apiLogger.logError(requestLog, error);
        throw error;
      }

      if (options.responseType) {
        return new Response(data, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        apiLogger.logError(requestLog, timeoutError);
        throw timeoutError;
      }

      lastError = error as Error;
      apiLogger.logError(requestLog, lastError);
      
      if (attempt < retryConfig.maxRetries - 1 && shouldRetry(lastError, retryConfig)) {
        const delay = calculateRetryDelay(attempt, retryConfig);
        apiLogger.logRequest(
          'RETRY',
          urlWithParams,
          headers,
          `Retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw lastError;
    }
  }

  throw lastError;
}

export class ApiClient {
  private baseUrl: string;
  private cache: ApiCache;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private requestQueue: RequestQueue;
  private networkMonitor: NetworkMonitor;

  // Public methods for monitoring
  public onBatchProcessed(callback: (metrics: { duration: number; successCount: number; errorCount: number; queueSize: number }) => void): void {
    this.requestQueue.on('batch-processed', callback);
  }

  public onCircuitBreakerStateChange(callback: (service: string, state: CircuitBreakerState, stats: { failures: number }) => void): void {
    this.circuitBreakers.forEach((breaker, service) => {
      breaker.on('state-change', (state: CircuitBreakerState) => {
        callback(service, state, breaker.stats);
      });
    });
  }

  public onNetworkQualityChange(callback: (metrics: { quality: number; throughput: number; latency: number }) => void): void {
    this.networkMonitor.addEventListener('change', (event: NetworkEventMap['change']) => {
      callback({
        quality: event.quality,
        throughput: event.throughput,
        latency: event.latency
      });
    });
  }

  public onCacheHit(callback: (key: string) => void): void {
    this.cache.on('cache-hit', callback);
  }

  public onCacheMiss(callback: (key: string) => void): void {
    this.cache.on('cache-miss', callback);
  }

  constructor() {
    if (!clientEnv.apiUrl) {
      throw new Error('API URL is not configured. Please check environment variables.');
    }
    this.baseUrl = clientEnv.apiUrl;
    
    if (DEBUG) {
      console.log('API Client initialized with:', {
        baseUrl: this.baseUrl,
        debug: DEBUG
      });
    }
    this.cache = new ApiCache({
      onError: error => {
        apiLogger.logError({
          method: 'CACHE',
          url: 'internal',
          headers: {},
          body: null,
          timestamp: new Date().toISOString()
        }, error);
      }
    });
    this.circuitBreakers = new Map();
    this.requestQueue = new RequestQueue();
    this.networkMonitor = new BrowserNetworkMonitor();

    // Connect network monitor to request queue
    this.networkMonitor.addEventListener('change', (event: NetworkEventMap['change']) => {
      const status = { online: this.networkMonitor.isConnected() };
      if (status.online) {
        this.requestQueue.flush();
      }
    });

    this.networkMonitor.addEventListener('change', (event: NetworkEventMap['change']) => {
      const quality = this.networkMonitor.getConnectionQuality();
      if (quality > 0.7) { // Consider > 0.7 as good quality
        this.requestQueue.retryFailed();
      }
    });
  }

  private getCircuitBreaker(path: string, config?: CircuitBreakerConfig): CircuitBreaker {
    const group = path.split('/')[1] || 'default';
    let breaker = this.circuitBreakers.get(group);
    if (!breaker) {
      breaker = new CircuitBreaker(config);
      this.circuitBreakers.set(group, breaker);
    }
    return breaker;
  }

  private async executeWithCircuitBreaker<T>(
    path: string,
    operation: () => Promise<T>,
    options?: FetchOptions
  ): Promise<T> {
    const breaker = this.getCircuitBreaker(path, options?.circuitBreaker);
    
    try {
      return await breaker.execute(operation);
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        const requestLog = {
          method: 'CIRCUIT',
          url: this.getUrl(path),
          headers: headersToObject(new Headers()),
          body: 'Circuit breaker open',
          timestamp: new Date().toISOString()
        };
        apiLogger.logError(requestLog, error);
      }
      throw error;
    }
  }

  private getCacheTTL(response: Response, options?: ApiCacheOptions): number {
    const cacheControl = response.headers.get('Cache-Control');
    if (cacheControl) {
      const maxAge = cacheControl.match(/max-age=(\d+)/);
      if (maxAge) {
        return parseInt(maxAge[1], 10) * 1000;
      }
    }
    return options?.ttl ?? DEFAULT_CACHE_CONFIG.ttl;
  }

  private async revalidate(url: string, options: FetchOptions): Promise<void> {
    const requestLog = {
      method: 'REVALIDATE',
      url,
      headers: {},
      body: null,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetchWithRetry(url, {
        ...options,
        method: 'GET',
        cacheOptions: {
          ...options.cacheOptions,
          enabled: false // Prevent infinite revalidation
        }
      });
      
      const data = await response.json();
      const ttl = this.getCacheTTL(response, options.cacheOptions);
      
      this.cache.set(url, data, ttl);
      apiLogger.logResponse(requestLog, response, data, Date.now());
    } catch (error) {
      apiLogger.logError(requestLog, error as Error);
    }
  }

  private getUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return this.executeWithCircuitBreaker(path, async () => {
      const url = this.getUrl(path);
      const cacheConfig: ApiCacheOptions = {
        ...DEFAULT_CACHE_CONFIG,
        ...options.cacheOptions
      };

      if (cacheConfig.enabled) {
        const cached = this.cache.get<T>(url);
        if (cached !== undefined) {
          if (cacheConfig.staleWhileRevalidate) {
            this.revalidate(url, options).catch(error => {
              apiLogger.logError({
                method: 'REVALIDATE',
                url,
                headers: {},
                body: null,
                timestamp: new Date().toISOString()
              }, error);
            });
            return cached;
          }
          if (!cacheConfig.revalidate) {
            return cached;
          }
        }
      }

      if (options.batch) {
        return this.requestQueue.enqueue(new Request(url, {
          ...options,
          method: 'GET'
        }));
      }

      const response = await fetchWithRetry(url, {
        ...options,
        method: 'GET',
      });

      if (options.responseType) {
        return response[options.responseType]() as Promise<T>;
      }

      const data = await response.json();

      if (cacheConfig.enabled) {
        const ttl = this.getCacheTTL(response, cacheConfig);
        this.cache.set(url, data, ttl);
      }

      return data;
    }, options);
  }

  async post<T>(path: string, data: any, options: FetchOptions = {}): Promise<T> {
    return this.executeWithCircuitBreaker(path, async () => {
      const response = await fetchWithRetry(this.getUrl(path), {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (options.responseType) {
        return response[options.responseType]() as Promise<T>;
      }

      return response.json();
    }, options);
  }

  async put<T>(path: string, data: any, options: FetchOptions = {}): Promise<T> {
    return this.executeWithCircuitBreaker(path, async () => {
      const response = await fetchWithRetry(this.getUrl(path), {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (options.responseType) {
        return response[options.responseType]() as Promise<T>;
      }

      return response.json();
    }, options);
  }

  async delete<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return this.executeWithCircuitBreaker(path, async () => {
      const response = await fetchWithRetry(this.getUrl(path), {
        ...options,
        method: 'DELETE',
      });

      if (options.responseType) {
        return response[options.responseType]() as Promise<T>;
      }

      return response.json();
    }, options);
  }
}

export const apiClient = new ApiClient();
