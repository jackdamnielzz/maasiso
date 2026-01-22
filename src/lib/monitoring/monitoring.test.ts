import { initPerformanceMonitoring } from './performance';
import { errorMonitor } from './error';

// Mock PerformanceObserver
class MockPerformanceObserver implements PerformanceObserver {
  private callback: PerformanceObserverCallback;
  static readonly supportedEntryTypes = [
    'paint',
    'largest-contentful-paint',
    'first-input',
    'layout-shift',
    'navigation',
  ];

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }

  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}

// @ts-ignore - Override PerformanceObserver for testing
global.PerformanceObserver = MockPerformanceObserver;

// Spy on observer methods
const observeSpy = jest.spyOn(MockPerformanceObserver.prototype, 'observe');
const disconnectSpy = jest.spyOn(MockPerformanceObserver.prototype, 'disconnect');

// Mock console methods
const originalConsoleError = console.error;
const mockConsoleError = jest.fn();

describe('Monitoring System', () => {
  beforeAll(() => {
    console.error = mockConsoleError;
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    observeSpy.mockClear();
    disconnectSpy.mockClear();
    mockConsoleError.mockClear();
    jest.clearAllMocks();
  });

  describe('Performance Monitoring', () => {
    it('initializes performance observer with correct entry types', () => {
      initPerformanceMonitoring();

      expect(observeSpy).toHaveBeenCalledWith({
        entryTypes: [
          'paint',
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
          'navigation',
        ],
      });
    });

    it('handles different performance entry types', () => {
      let observerCallback: PerformanceObserverCallback;
      let observer: MockPerformanceObserver;

      // @ts-ignore - Override constructor to capture callback
      MockPerformanceObserver.prototype.constructor = function(callback: PerformanceObserverCallback) {
        observerCallback = callback;
        observer = this;
        return this;
      };

      initPerformanceMonitoring();

      const mockEntryList = {
        getEntries: () => [{
          entryType: 'paint',
          name: 'first-contentful-paint',
          startTime: 1000,
        }] as PerformanceEntryList,
      } as PerformanceObserverEntryList;

      // Test FCP entry
      observerCallback!(mockEntryList, observer!);

      const mockLCPEntryList = {
        getEntries: () => [{
          entryType: 'largest-contentful-paint',
          startTime: 2000,
        }] as PerformanceEntryList,
      } as PerformanceObserverEntryList;

      // Test LCP entry
      observerCallback!(mockLCPEntryList, observer!);

      // Verify metrics were logged
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Error Monitoring', () => {
    it('initializes error monitoring', () => {
      errorMonitor.init();
      expect(errorMonitor['isInitialized']).toBe(true);
    });

    it('logs JavaScript errors', () => {
      errorMonitor.init();

      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test error'),
        message: 'Test error',
        filename: 'test.js',
        lineno: 1,
        colno: 1,
      });

      window.dispatchEvent(errorEvent);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('logs unhandled promise rejections', () => {
      errorMonitor.init();

      const promiseRejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(new Error('Promise rejection')),
        reason: new Error('Promise rejection'),
      });

      window.dispatchEvent(promiseRejectionEvent);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('logs component errors', () => {
      const error = new Error('Component error');
      const componentStack = 'Component stack trace';

      errorMonitor.logComponentError(error, componentStack);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('logs warnings', () => {
      const warning = 'Warning message';
      const metadata = { source: 'test' };

      errorMonitor.logWarning(warning, metadata);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('handles network errors', async () => {
      errorMonitor.init();

      const originalFetch = window.fetch;
      const mockFetchResponse = { ok: false, status: 500, statusText: 'Server Error' };
      window.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      try {
        await fetch('https://example.com/api');
      } catch (error) {
        // Ignore error
      }

      expect(mockConsoleError).toHaveBeenCalled();
      window.fetch = originalFetch;
    });
  });
});