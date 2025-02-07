/**
 * Centralized type definitions for test mocks
 */

// Service Worker Types
export interface MockServiceWorkerRegistration {
  sync: MockSyncManager;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  active: ServiceWorker | null;
}

export interface MockSyncManager {
  getTags: jest.Mock<Promise<string[]>, []>;
  register: jest.Mock<Promise<void>, [string]>;
}

// Message Types
export interface MessageData {
  type: string;
  payload?: any;
  hasPending?: boolean;
  status?: 'online' | 'offline';
}

// Client Types
export interface MockClient {
  postMessage: jest.Mock<void, [MessageData]>;
}

export interface MockClientsContainer {
  matchAll: () => Promise<MockClient[]>;
}

export interface MockClients {
  matchAll: jest.Mock<Promise<MockClient[]>, []>;
}

export type MockMatchAllFn = () => Promise<MockClient[]>;

export interface MockCacheStorage {
  open: jest.Mock<Promise<Cache>>;
  match: jest.Mock<Promise<Response | undefined>>;
  has: jest.Mock<Promise<boolean>>;
  delete: jest.Mock<Promise<boolean>>;
  keys: jest.Mock<Promise<string[]>>;
}

export interface MockCache {
  match: jest.Mock<Promise<Response | undefined>>;
  put: jest.Mock<Promise<void>>;
  delete: jest.Mock<Promise<boolean>>;
}

// IndexedDB Types
export interface MockIDBFactory {
  open: jest.Mock<IDBOpenDBRequest>;
  deleteDatabase: jest.Mock<IDBOpenDBRequest>;
  cmp: jest.Mock<number, [string, string]>;
  databases: jest.Mock<Promise<IDBDatabaseInfo[]>>;
}

// IDB Request Types
export interface MockIDBRequest extends Omit<IDBOpenDBRequest, 'source'> {
  error: DOMException | null;
  result: any;
  source: IDBObjectStore | IDBIndex | IDBCursor | null;
  transaction: IDBTransaction | null;
  readyState: IDBRequestReadyState;
  onsuccess: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onblocked: ((event: Event) => void) | null;
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null;
}

export interface MockIDBOpenDBRequest extends MockIDBRequest {
  source: null;
}

export function createMockIDBRequest(options: {
  result?: any;
  error?: DOMException | null;
}): MockIDBOpenDBRequest {
  const request: MockIDBOpenDBRequest = {
    error: options.error || null,
    result: options.result,
    source: null,
    transaction: null,
    readyState: 'pending',
    onsuccess: null,
    onerror: null,
    onblocked: null,
    onupgradeneeded: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => true)
  };

  // Simulate async operation
  Promise.resolve().then(() => {
    if (request.onsuccess && !options.error) {
      request.readyState = 'done';
      request.result = options.result;
      request.onsuccess(new Event('success'));
    } else if (request.onerror && options.error) {
      request.readyState = 'done';
      request.error = options.error;
      request.onerror(new Event('error'));
    }
  });

  return request;
}

// Utility Types
export type SafeMock<T> = T extends (...args: any[]) => any 
  ? jest.Mock<ReturnType<T>, Parameters<T>>
  : T extends object
  ? { [K in keyof T]: SafeMock<T[K]> }
  : jest.Mock;

// Global Augmentations
declare global {
  var ServiceWorkerRegistration: {
    prototype: ServiceWorkerRegistration;
    new(): ServiceWorkerRegistration;
  };
  var clients: MockClientsContainer;
  var caches: CacheStorage;
  var indexedDB: IDBFactory;
}

// Test Environment Types
export interface TestEnvironment {
  setupGlobalMocks(): void;
  teardownGlobalMocks(): void;
  createTestHelpers(): TestHelpers;
}

export interface TestHelpers {
  mockServiceWorkerRegistration: MockServiceWorkerRegistration;
  mockClients: MockClients;
  mockCaches: MockCacheStorage;
  mockIndexedDB: MockIDBFactory;
  createMockIDBRequest: typeof createMockIDBRequest;
}

// Mock Creation Types
export interface MockOptions {
  implementation?: (...args: any[]) => any;
  returnValue?: any;
}

// Error Types for Testing
export interface MockError extends Error {
  code?: string;
  status?: number;
}
