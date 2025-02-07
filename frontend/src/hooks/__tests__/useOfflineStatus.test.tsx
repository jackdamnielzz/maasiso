import { renderHook, act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useOfflineStatus, OfflineStatusProvider } from '../useOfflineStatus';
import { monitoringService } from '../../lib/monitoring/service';
import { createMockServiceWorkerRegistration } from '../../__tests__/utils/test-utils';

// Mock monitoring service
jest.mock('../../lib/monitoring/service', () => ({
  monitoringService: {
    trackError: jest.fn()
  }
}));

// Mock useConflictResolution hook
jest.mock('../useConflictResolution', () => ({
  useConflictResolution: () => ({
    activeConflict: null,
    hasConflicts: false,
    handleConflictResolved: jest.fn(),
    dismissConflict: jest.fn(),
    showNextConflict: jest.fn()
  })
}));

describe('useOfflineStatus', () => {
  // Mock service worker
  const mockServiceWorker = {
    register: jest.fn(),
    ready: Promise.resolve(createMockServiceWorkerRegistration()),
    controller: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };

  // Store original navigator properties
  const originalNavigator = { ...window.navigator };
  const originalOnLine = window.navigator.onLine;
  
  // Mock event listeners
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window event listeners
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;

    // Mock service worker
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: mockServiceWorker
      },
      writable: true
    });

    // Mock service worker registration
    mockServiceWorker.register.mockResolvedValue(createMockServiceWorkerRegistration());
  });

  afterEach(() => {
    // Cleanup after each test
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: originalOnLine
    });
  });

  it('should initialize with the current online status', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });

    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current.isOffline).toBe(false);
  });

  it('should add and remove event listeners', () => {
    const { unmount } = renderHook(() => useOfflineStatus());

    // Check if event listeners were added
    expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));

    // Unmount the hook
    unmount();

    // Check if event listeners were removed
    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update status when online/offline events occur', async () => {
    // Start with online state
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });

    const { result } = renderHook(() => useOfflineStatus());

    // Get the offline handler from the mock
    const offlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )[1];

    // Get the online handler from the mock
    const onlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )[1];

    // Simulate going offline
    await act(async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineHandler(new Event('offline'));
      await Promise.resolve();
    });

    expect(result.current.isOffline).toBe(true);

    // Simulate going online
    await act(async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });
      onlineHandler(new Event('online'));
      await Promise.resolve();
    });

    expect(result.current.isOffline).toBe(false);
  });

  it('should register service worker and handle configuration', async () => {
    const mockPostMessage = jest.fn();
    const mockRegistration = {
      ...createMockServiceWorkerRegistration(),
      active: {
        postMessage: mockPostMessage
      }
    };
    mockServiceWorker.register.mockResolvedValue(mockRegistration);

    renderHook(() => useOfflineStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockServiceWorker.register).toHaveBeenCalledWith('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'CONFIG',
      config: {
        apiUrl: expect.any(String)
      }
    });
  });

  it('should handle service worker registration error', async () => {
    const error = new Error('Registration failed');
    mockServiceWorker.register.mockRejectedValue(error);

    renderHook(() => useOfflineStatus());

    // Wait for error handling
    await act(async () => {
      await Promise.resolve();
    });

    expect(monitoringService.trackError).toHaveBeenCalledWith(error, {
      component: 'ServiceWorker',
      operation: 'registration',
      apiUrl: expect.any(String),
      severity: 'error',
      handled: true
    });
  });

  it('should check for pending sync tags on mount', async () => {
    const mockTags = ['offline-mutations'];
    const registration = createMockServiceWorkerRegistration();
    registration.sync.getTags.mockResolvedValue(mockTags);
    mockServiceWorker.ready = Promise.resolve(registration);

    const { result } = renderHook(() => useOfflineStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.hasPendingSync).toBe(true);
  });

  it('should handle sync tag check error gracefully', async () => {
    const registration = createMockServiceWorkerRegistration();
    registration.sync.getTags.mockRejectedValue(new Error('Sync error'));
    mockServiceWorker.ready = Promise.resolve(registration);

    const { result } = renderHook(() => useOfflineStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.hasPendingSync).toBe(false);
  });

  it('should handle pending sync status messages', async () => {
    const { result } = renderHook(() => useOfflineStatus());

    await act(async () => {
      // Wait for initial setup
      await Promise.resolve();
    });

    // Mock service worker message handler
    const messageHandler = mockServiceWorker.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )[1];

    // Simulate sync pending message
    await act(async () => {
      messageHandler(new MessageEvent('message', {
        data: {
          type: 'SYNC_STATUS',
          hasPending: true
        }
      }));
      await Promise.resolve();
    });

    expect(result.current.hasPendingSync).toBe(true);

    // Simulate sync complete message
    await act(async () => {
      messageHandler(new MessageEvent('message', {
        data: {
          type: 'SYNC_STATUS',
          hasPending: false
        }
      }));
      await Promise.resolve();
    });

    expect(result.current.hasPendingSync).toBe(false);
  });

  describe('OfflineStatusProvider', () => {
    it('should render offline indicator when offline', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      render(
        <OfflineStatusProvider>
          <div>Child content</div>
        </OfflineStatusProvider>
      );

      expect(screen.getByText("You're offline")).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

      it('should show pending sync message when applicable', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        });

        render(
          <OfflineStatusProvider>
            <div>Child content</div>
          </OfflineStatusProvider>
        );

        // Mock service worker message handler
        const messageHandler = mockServiceWorker.addEventListener.mock.calls.find(
          call => call[0] === 'message'
        )[1];

        await act(async () => {
          messageHandler(new MessageEvent('message', {
            data: {
              type: 'SYNC_STATUS',
              hasPending: true
            }
          }));
          await Promise.resolve();
        });

        expect(screen.getByText(/Changes will sync when back online/i)).toBeInTheDocument();
      });
  });
});
