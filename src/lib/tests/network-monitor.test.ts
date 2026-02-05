import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserNetworkMonitor } from '../api/network-monitor';
import type { Mock } from 'vitest';

type MockCalls = [string, EventListener][];

describe('BrowserNetworkMonitor', () => {
  let monitor: BrowserNetworkMonitor;
  let mockConnection: any;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock connection API
    mockConnection = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      downlink: 5,
      effectiveType: '4g',
      rtt: 50
    };

    // Mock window event listeners
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');

    // Mock navigator
    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      configurable: true
    });

    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true
    });

    monitor = new BrowserNetworkMonitor();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('should initialize with default state', () => {
    expect(monitor.isConnected()).toBe(true);
    expect(monitor.getConnectionQuality()).toBe(1);
  });

  it('should start monitoring connection', () => {
    monitor.start();

    expect(mockConnection.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should stop monitoring connection', () => {
    monitor.start();
    monitor.stop();

    expect(mockConnection.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update quality on connection change', () => {
    monitor.start();

    // Simulate connection change
    const calls = (mockConnection.addEventListener as Mock).mock.calls as MockCalls;
    const changeHandler = calls.find(call => call[0] === 'change')?.[1];
    
    // Update connection metrics
    mockConnection.downlink = 2;
    mockConnection.rtt = 200;
    
    changeHandler?.(new Event('change'));

    expect(monitor.getConnectionQuality()).toBeLessThan(1);
  });

  it('should handle missing Network Information API', () => {
    // Remove connection API
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true
    });

    monitor = new BrowserNetworkMonitor();
    monitor.start();

    expect(monitor.getConnectionQuality()).toBe(1);
  });

  it('should check connection quality periodically', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    monitor.start();

    // Fast-forward 30 seconds
    await vi.advanceTimersByTimeAsync(30000);

    expect(mockFetch).toHaveBeenCalledWith('/api/health', {
      method: 'HEAD',
      cache: 'no-cache'
    });
  });

  it('should handle failed health checks', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    monitor.start();
    
    const initialQuality = monitor.getConnectionQuality();
    expect(initialQuality).toBeGreaterThan(0.3);

    // Fast-forward 30 seconds
    await vi.advanceTimersByTimeAsync(30000);

    // Quality should be reduced after failed health check
    expect(monitor.getConnectionQuality()).toBe(0.3);
  });

  it('should notify listeners of significant quality changes', () => {
    const listener = vi.fn();
    monitor.addEventListener('change', listener);
    monitor.start();

    // Simulate poor connection
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    // Fast-forward 30 seconds
    vi.advanceTimersByTime(30000);

    expect(listener).toHaveBeenCalled();
  });
});
