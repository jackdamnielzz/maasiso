import {
  MockServiceWorkerRegistration,
  MockSyncManager,
  MockClient,
  MockClients,
  MockCacheStorage,
  MockCache,
  MockIDBFactory,
  TestHelpers,
  MockOptions,
  SafeMock,
  createMockIDBRequest,
  MockIDBRequest
} from '../types/test-types';

/**
 * Creates a type-safe mock function with optional implementation
 */
export function createTypedMock<T extends (...args: any[]) => any>(
  options: MockOptions = {}
): SafeMock<T> {
  if (options.implementation) {
    return jest.fn().mockImplementation(options.implementation) as SafeMock<T>;
  }
  if (options.returnValue !== undefined) {
    return jest.fn().mockReturnValue(options.returnValue) as SafeMock<T>;
  }
  return jest.fn() as SafeMock<T>;
}

/**
 * Creates a mock service worker registration
 */
export function createMockServiceWorkerRegistration(): MockServiceWorkerRegistration {
  const mockSyncManager: MockSyncManager = {
    getTags: createTypedMock<() => Promise<string[]>>({ returnValue: Promise.resolve([]) }),
    register: createTypedMock<(tag: string) => Promise<void>>({ returnValue: Promise.resolve() })
  };

  return {
    sync: mockSyncManager,
    addEventListener: createTypedMock(),
    removeEventListener: createTypedMock(),
    active: null
  };
}

/**
 * Creates a mock client
 */
export function createMockClient(): MockClient {
  return {
    postMessage: createTypedMock<(message: any) => void>()
  };
}

/**
 * Creates mock clients
 */
export function createMockClients(): MockClients {
  const mockClient = createMockClient();
  return {
    matchAll: createTypedMock<() => Promise<MockClient[]>>({
      returnValue: Promise.resolve([mockClient])
    })
  };
}

/**
 * Creates a mock cache
 */
export function createMockCache(): MockCache {
  return {
    match: createTypedMock<() => Promise<Response | undefined>>(),
    put: createTypedMock<() => Promise<void>>(),
    delete: createTypedMock<() => Promise<boolean>>()
  };
}

/**
 * Creates mock cache storage
 */
export function createMockCacheStorage(): MockCacheStorage {
  const mockCache = createMockCache();
  return {
    open: createTypedMock<() => Promise<Cache>>({ returnValue: Promise.resolve(mockCache as unknown as Cache) }),
    match: createTypedMock<() => Promise<Response | undefined>>(),
    has: createTypedMock<() => Promise<boolean>>(),
    delete: createTypedMock<() => Promise<boolean>>(),
    keys: createTypedMock<() => Promise<string[]>>({ returnValue: Promise.resolve([]) })
  };
}

/**
 * Creates mock IndexedDB
 */
export function createMockIndexedDB(): MockIDBFactory {
  const mockDb = {} as IDBDatabase;
  
  const createRequest = (result: any): IDBOpenDBRequest => {
    const request = {
      error: null as DOMException | null,
      result,
      source: null as any,
      transaction: null,
      readyState: 'pending' as IDBRequestReadyState,
      onsuccess: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onblocked: null as ((event: Event) => void) | null,
      onupgradeneeded: null as ((event: IDBVersionChangeEvent) => void) | null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(() => true)
    };

    // Make it look like a real IDBOpenDBRequest to TypeScript
    return request as unknown as IDBOpenDBRequest;
  };

  return {
    open: createTypedMock<() => IDBOpenDBRequest>({
      implementation: () => {
        const request = createRequest(mockDb);
        Promise.resolve().then(() => {
          if (request.onupgradeneeded) {
            request.onupgradeneeded(new Event('upgradeneeded') as IDBVersionChangeEvent);
          }
          if (request.onsuccess) {
            request.onsuccess(new Event('success'));
          }
        });
        return request;
      }
    }),
    deleteDatabase: createTypedMock<() => IDBOpenDBRequest>({
      implementation: () => {
        const request = createRequest(undefined);
        Promise.resolve().then(() => {
          if (request.onsuccess) {
            request.onsuccess(new Event('success'));
          }
        });
        return request;
      }
    }),
    cmp: createTypedMock<(a: string, b: string) => number>({ returnValue: 0 }),
    databases: createTypedMock<() => Promise<IDBDatabaseInfo[]>>({ returnValue: Promise.resolve([]) })
  };
}

/**
 * Creates test environment with all necessary mocks
 */
export function createTestEnvironment(): TestHelpers {
  const mockServiceWorkerRegistration = createMockServiceWorkerRegistration();
  const mockClients = createMockClients();
  const mockCaches = createMockCacheStorage();
  const mockIndexedDB = createMockIndexedDB();

  return {
    mockServiceWorkerRegistration,
    mockClients,
    mockCaches,
    mockIndexedDB,
    createMockIDBRequest
  };
}

/**
 * Sets up global mocks for testing
 */
export function setupGlobalMocks(): TestHelpers {
  const helpers = createTestEnvironment();

  // Set up global mocks
  global.ServiceWorkerRegistration = jest.fn(() => helpers.mockServiceWorkerRegistration) as any;
  global.clients = helpers.mockClients;
  global.caches = helpers.mockCaches as unknown as CacheStorage;
  global.indexedDB = helpers.mockIndexedDB as unknown as IDBFactory;

  return helpers;
}

/**
 * Tears down global mocks
 */
export function teardownGlobalMocks(): void {
  delete (global as any).ServiceWorkerRegistration;
  delete (global as any).clients;
  delete (global as any).caches;
  delete (global as any).indexedDB;
}
