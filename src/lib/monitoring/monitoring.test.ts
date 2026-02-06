import { initPerformanceMonitoring } from './performance';
import { errorMonitor } from './error';

describe('Monitoring System', () => {
  const originalPerformanceObserver = global.PerformanceObserver;
  const originalNodeEnv = process.env.NODE_ENV;
  const setNodeEnv = (value: string | undefined) => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setNodeEnv('development');
  });

  afterEach(() => {
    setNodeEnv(originalNodeEnv);
    global.PerformanceObserver = originalPerformanceObserver;
  });

  it('initializes performance observer with expected entry types', () => {
    const observe = jest.fn();
    const disconnect = jest.fn();

    class MockPO {
      static supportedEntryTypes = [
        'paint',
        'largest-contentful-paint',
        'first-input',
        'layout-shift',
        'navigation',
      ];

      constructor(_callback: PerformanceObserverCallback) {}
      observe = observe;
      disconnect = disconnect;
      takeRecords = () => [];
    }

    global.PerformanceObserver = MockPO as unknown as typeof PerformanceObserver;

    initPerformanceMonitoring();

    expect(observe).toHaveBeenCalledWith({
      entryTypes: [
        'paint',
        'largest-contentful-paint',
        'first-input',
        'layout-shift',
        'navigation',
      ],
    });
  });

  it('initializes error monitor once', () => {
    errorMonitor.init();
    errorMonitor.init();
    expect((errorMonitor as any).isInitialized).toBe(true);
  });

  it('logs component errors through logError', () => {
    const spy = jest.spyOn(errorMonitor as any, 'logError').mockImplementation(() => {});

    errorMonitor.logComponentError(new Error('Component error'), 'Component stack');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Component error',
        source: 'react',
        type: 'error',
      })
    );
  });

  it('logs warnings through logError', () => {
    const spy = jest.spyOn(errorMonitor as any, 'logError').mockImplementation(() => {});

    errorMonitor.logWarning('Warning message', { source: 'test' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Warning message',
        source: 'other',
        type: 'warning',
        metadata: { source: 'test' },
      })
    );
  });
});
