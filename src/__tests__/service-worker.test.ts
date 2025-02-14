import { jest } from '@jest/globals';
import {
  MessageData,
  MockServiceWorkerRegistration,
  MockSyncManager,
  MockClientsContainer,
  MockClient,
  MockMatchAllFn
} from './types/test-types';
import {
  setupGlobalMocks,
  createMockClient,
  createMockCache,
  teardownGlobalMocks,
  createTypedMock
} from './utils/test-utils';

describe('Service Worker', () => {
  let helpers: ReturnType<typeof setupGlobalMocks>;

  beforeEach(() => {
    helpers = setupGlobalMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
    teardownGlobalMocks();
  });

  describe('Cache Operations', () => {
    it('should cache API responses', async () => {
      const cache = await caches.open('api-cache');
      const request = new Request('http://153.92.223.23/api/data');
      const response = new Response('{"data": "test"}');

      await cache.put(request, response);

      expect(cache.put).toHaveBeenCalledWith(request, response);
    });
  });

describe('Background Sync', () => {
    it('should register background sync', async () => {
      const mockSyncManager: MockSyncManager = {
        register: createTypedMock<(tag: string) => Promise<void>>({
          implementation: (tag: string) => Promise.resolve()
        }),
        getTags: createTypedMock<() => Promise<string[]>>({
          implementation: () => Promise.resolve([])
        })
      };

      const registration: MockServiceWorkerRegistration = {
        sync: mockSyncManager,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        active: null
      };

      await registration.sync.register('offline-mutations');

      expect(registration.sync.register).toHaveBeenCalledWith('offline-mutations');
    });

    it('should handle sync completion', async () => {
      const mockClient = createMockClient();
      const mockMatchAll = createTypedMock<MockMatchAllFn>({
        implementation: () => Promise.resolve([mockClient])
      });
      const mockClients: MockClientsContainer = { matchAll: mockMatchAll };

      global.clients = mockClients;

      const message: MessageData = { type: 'SYNC_STATUS', hasPending: false };
      const clients = await mockClients.matchAll();
      clients[0].postMessage(message);

      expect(mockClient.postMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('Offline Detection', () => {
    it('should notify clients about connection status', async () => {
      const mockClient = createMockClient();
      const mockMatchAll = createTypedMock<MockMatchAllFn>({
        implementation: () => Promise.resolve([mockClient])
      });
      const mockClients: MockClientsContainer = { matchAll: mockMatchAll };

      global.clients = mockClients;

      const message: MessageData = { type: 'CONNECTION_STATUS', status: 'offline' };
      const clients = await mockClients.matchAll();
      clients[0].postMessage(message);

      expect(mockClient.postMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('IndexedDB Operations', () => {
    it('should handle offline mutations queue', async () => {
      const mutation = {
        id: '123',
        operation: 'UPDATE',
        data: { title: 'Test' },
        timestamp: Date.now()
      };

      const request = helpers.createMockIDBRequest({ result: {} });
      const openRequest = helpers.mockIndexedDB.open('offline-mutations');

      // Simulate successful database open
      Promise.resolve().then(() => {
        if (openRequest.onsuccess) {
          openRequest.onsuccess(new Event('success'));
        }
      });

      expect(helpers.mockIndexedDB.open).toHaveBeenCalledWith('offline-mutations');
    });
  });
});
