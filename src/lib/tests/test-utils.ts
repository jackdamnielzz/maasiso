import { vi } from 'vitest';
import type { NetworkInformation } from '../api/network-types';

/**
 * Creates a mock NetworkInformation object
 */
export function createNetworkInfoMock(): NetworkInformation {
  const mock = {
    effectiveType: '4g' as const,
    type: 'wifi' as const,
    rtt: 50,
    downlink: 10,
    metered: false,
    saveData: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true)
  } as NetworkInformation;

  // Make properties mutable for testing
  return new Proxy(mock, {
    get(target, prop) {
      return target[prop as keyof NetworkInformation];
    },
    set(target, prop, value) {
      if (prop in target) {
        (target as any)[prop] = value;
      }
      return true;
    }
  });
}

/**
 * Creates a mock window object
 */
export function createWindowMock(): Partial<Window> {
  return {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    performance: {
      now: vi.fn().mockReturnValue(0),
      timeOrigin: 0,
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      clearResourceTimings: vi.fn(),
      getEntries: vi.fn(),
      getEntriesByName: vi.fn(),
      getEntriesByType: vi.fn(),
      mark: vi.fn(),
      measure: vi.fn(),
      toJSON: vi.fn(),
      eventCounts: {
        size: 0,
        [Symbol.iterator]: vi.fn(),
        entries: vi.fn(),
        forEach: vi.fn(),
        get: vi.fn(),
        has: vi.fn(),
        keys: vi.fn(),
        values: vi.fn()
      },
      navigation: {} as PerformanceNavigation,
      timing: {} as PerformanceTiming,
      onresourcetimingbufferfull: null
    } as unknown as Performance
  };
}

export interface MockResponse extends Response {
  json(): Promise<any>;
  text(): Promise<string>;
  blob(): Promise<Blob>;
  arrayBuffer(): Promise<ArrayBuffer>;
  formData(): Promise<FormData>;
  clone(): MockResponse;
}

/**
 * Creates a mock Response object with enhanced functionality
 */
export function createMockResponse(data: any, init: ResponseInit = {}): MockResponse {
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], { type: 'application/json' });
  
  const response = new Response(blob, {
    status: 200,
    statusText: 'OK',
    ...init,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...(init.headers || {})
    })
  }) as MockResponse;

  // Override methods to work with the provided data
  response.json = () => Promise.resolve(data);
  response.text = () => Promise.resolve(jsonData);
  response.blob = () => Promise.resolve(blob);
  response.arrayBuffer = () => blob.arrayBuffer();
  response.formData = () => Promise.reject(new Error('FormData not supported in mock'));
  response.clone = () => createMockResponse(data, init);

  return response;
}

/**
 * Creates a mock error response
 */
export function createMockErrorResponse(status: number, message: string): MockResponse {
  return createMockResponse({ error: message }, {
    status,
    statusText: message
  });
}

export type MockFetchFn = ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: Response | MockResponse): MockFetchFn;
  mockResolvedValue(value: Response | MockResponse): MockFetchFn;
  mockRejectedValueOnce(error: Error): MockFetchFn;
  mockRejectedValue(error: Error): MockFetchFn;
  mockImplementation(fn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>): MockFetchFn;
  mockImplementationOnce(fn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>): MockFetchFn;
};

/**
 * Creates a typed fetch mock with enhanced functionality
 */
export function createFetchMock(): MockFetchFn {
  const mock = vi.fn() as MockFetchFn;
  
  // Preserve mock functionality
  const originalMethods = {
    mockResolvedValueOnce: mock.mockResolvedValueOnce.bind(mock),
    mockResolvedValue: mock.mockResolvedValue.bind(mock),
    mockRejectedValueOnce: mock.mockRejectedValueOnce.bind(mock),
    mockRejectedValue: mock.mockRejectedValue.bind(mock),
    mockImplementation: mock.mockImplementation.bind(mock),
    mockImplementationOnce: mock.mockImplementationOnce.bind(mock)
  };

  // Override methods to maintain chainability
  mock.mockResolvedValueOnce = function(value) {
    originalMethods.mockResolvedValueOnce(value);
    return mock;
  };

  mock.mockResolvedValue = function(value) {
    originalMethods.mockResolvedValue(value);
    return mock;
  };

  mock.mockRejectedValueOnce = function(error) {
    originalMethods.mockRejectedValueOnce(error);
    return mock;
  };

  mock.mockRejectedValue = function(error) {
    originalMethods.mockRejectedValue(error);
    return mock;
  };

  mock.mockImplementation = function(fn) {
    originalMethods.mockImplementation(fn);
    return mock;
  };

  mock.mockImplementationOnce = function(fn) {
    originalMethods.mockImplementationOnce(fn);
    return mock;
  };

  return mock;
}

/**
 * Creates a mock API response with common patterns
 */
export function createMockApiResponse<T>(data: T, meta?: { 
  status?: number,
  headers?: Record<string, string>,
  delay?: number 
}): MockResponse {
  const response = createMockResponse({
    data,
    success: true,
    timestamp: new Date().toISOString()
  }, {
    status: meta?.status || 200,
    headers: meta?.headers
  });

  if (meta?.delay) {
    const originalJson = response.json.bind(response);
    response.json = () => new Promise(resolve => 
      setTimeout(() => resolve(originalJson()), meta.delay)
    );
  }

  return response;
}

/**
 * Creates common test scenarios for API testing
 */
export function createApiTestScenarios<T>(successData: T) {
  return {
    success: () => createMockApiResponse(successData),
    notFound: () => createMockErrorResponse(404, 'Resource not found'),
    serverError: () => createMockErrorResponse(500, 'Internal server error'),
    timeout: (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<never>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
    networkError: () => Promise.reject(new TypeError('Network error')),
    rateLimited: () => createMockErrorResponse(429, 'Too many requests'),
    unauthorized: () => createMockErrorResponse(401, 'Unauthorized'),
    forbidden: () => createMockErrorResponse(403, 'Forbidden'),
    delayed: (ms: number) => createMockApiResponse(successData, { delay: ms })
  };
}
