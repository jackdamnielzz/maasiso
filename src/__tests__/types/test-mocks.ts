/**
 * Type definitions for test mocks
 * This file centralizes all mock types used in tests to ensure consistency
 * and improve maintainability.
 */

import { jest } from '@jest/globals';

// Message Types
export type MessageData = {
  type: 'SYNC_STATUS' | 'CONNECTION_STATUS';
  status?: 'online' | 'offline';
  hasPending?: boolean;
};

// Service Worker Types
export interface MockSyncManager {
  register: jest.Mock;
  getTags: jest.Mock;
}

export interface MockServiceWorkerRegistration {
  sync: MockSyncManager;
}

// Client Types
export interface MockClient {
  postMessage: jest.Mock;
}

export interface MockClients {
  matchAll: jest.Mock;
}

// Cache Types
export interface MockCache {
  put: jest.Mock;
  match: jest.Mock;
  delete: jest.Mock;
  keys: jest.Mock;
  addAll: jest.Mock;
  add: jest.Mock;
}

export interface MockCacheStorage {
  open: jest.Mock;
  match: jest.Mock;
  has: jest.Mock;
  keys: jest.Mock;
  delete: jest.Mock;
}

// IndexedDB Types
export interface MockObjectStore {
  add: jest.Mock;
}

export interface MockTransaction {
  objectStore(): MockObjectStore;
}

export interface MockIDBDatabase {
  transaction(): MockTransaction;
}

export interface MockIDBFactory {
  open: jest.Mock;
}

// Test Environment Types
export interface TestGlobals {
  clients: MockClients;
  caches: MockCacheStorage;
  indexedDB: MockIDBFactory;
  ServiceWorkerRegistration: {
    prototype: {
      sync: MockSyncManager;
    };
  };
}

/**
 * Helper function to create a mock client
 * @returns A properly typed mock client
 */
export function createMockClient(): MockClient {
  return {
    postMessage: jest.fn() as jest.Mock
  };
}

/**
 * Helper function to create mock clients
 * @returns A properly typed mock clients object
 */
export function createMockClients(): MockClients {
  const client = createMockClient();
  const matchAll = jest.fn() as jest.Mock;
  matchAll.mockReturnValue(Promise.resolve([client]));
  return { matchAll };
}

/**
 * Helper function to create a mock cache
 * @returns A properly typed mock cache
 */
export function createMockCache(): MockCache {
  return {
    put: jest.fn() as jest.Mock,
    match: jest.fn() as jest.Mock,
    delete: jest.fn() as jest.Mock,
    keys: jest.fn() as jest.Mock,
    addAll: jest.fn() as jest.Mock,
    add: jest.fn() as jest.Mock
  };
}

/**
 * Helper function to create a mock IDB factory
 * @returns A properly typed mock IndexedDB factory
 */
export function createMockIDBFactory(): MockIDBFactory {
  const mockObjectStore: MockObjectStore = {
    add: jest.fn() as jest.Mock
  };

  const mockTransaction: MockTransaction = {
    objectStore: () => mockObjectStore
  };

  const mockDB: MockIDBDatabase = {
    transaction: () => mockTransaction
  };

  const open = jest.fn() as jest.Mock;
  open.mockReturnValue(Promise.resolve(mockDB));

  return { open };
}

/**
 * Helper function to setup all global mocks
 * @returns An object containing all mock instances
 */
export function setupGlobalMocks(): TestGlobals {
  const mockCache = createMockCache();
  const mockCacheStorage: MockCacheStorage = {
    open: jest.fn().mockReturnValue(Promise.resolve(mockCache)) as jest.Mock,
    match: jest.fn() as jest.Mock,
    has: jest.fn() as jest.Mock,
    keys: jest.fn() as jest.Mock,
    delete: jest.fn() as jest.Mock
  };

  const mockClients = createMockClients();
  const mockIDBFactory = createMockIDBFactory();

  const mockSyncManager: MockSyncManager = {
    register: jest.fn().mockReturnValue(Promise.resolve()) as jest.Mock,
    getTags: jest.fn().mockReturnValue(Promise.resolve([])) as jest.Mock
  };

  const mockServiceWorkerRegistration = {
    prototype: {
      sync: mockSyncManager
    }
  };

  return {
    clients: mockClients,
    caches: mockCacheStorage,
    indexedDB: mockIDBFactory,
    ServiceWorkerRegistration: mockServiceWorkerRegistration
  };
}

/**
 * Helper function to apply global mocks to the test environment
 * @param mocks The mock objects to apply
 */
export function applyGlobalMocks(mocks: TestGlobals): void {
  Object.entries(mocks).forEach(([key, value]) => {
    Object.defineProperty(global, key, {
      value,
      writable: true,
      configurable: true
    });
  });
}
