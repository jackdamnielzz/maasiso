import { renderHook, act } from '@testing-library/react';
import { useProgressiveContent } from '../useProgressiveContent';
import { monitoringService } from '@/lib/monitoring/service';

// Mock monitoringService
jest.mock('@/lib/monitoring/service', () => ({
  monitoringService: {
    trackPerformanceMetric: jest.fn()
  }
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useProgressiveContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(performance, 'now').mockImplementation(() => 1000);
  });

  it('should load content when in view', async () => {
    const mockData = { test: 'data' };
    const mockLoadContent = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => 
      useProgressiveContent(mockLoadContent, { monitoringKey: 'test' })
    );

    // Initially not loading, no content
    expect(result.current.loading).toBe(false);
    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();

    // Simulate coming into view
    act(() => {
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);
    });

    // Should start loading
    expect(result.current.loading).toBe(true);

    // Wait for content to load
    await act(async () => {
      await Promise.resolve();
    });

    // Should have content and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.content).toEqual(mockData);
    expect(result.current.error).toBeNull();

    // Should track performance metric
    expect(monitoringService.trackPerformanceMetric).toHaveBeenCalledWith({
      name: 'content_load_test',
      value: 0, // mocked performance.now() returns same value
      timestamp: expect.any(Number),
      context: {
        priority: false,
        inView: true
      }
    });
  });

  it('should load content immediately when priority is true', async () => {
    const mockData = { test: 'data' };
    const mockLoadContent = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => 
      useProgressiveContent(mockLoadContent, { priority: true })
    );

    // Should start loading immediately
    expect(result.current.loading).toBe(true);

    // Wait for content to load
    await act(async () => {
      await Promise.resolve();
    });

    // Should have content and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.content).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading errors', async () => {
    const mockError = new Error('Test error');
    const mockLoadContent = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => 
      useProgressiveContent(mockLoadContent)
    );

    // Simulate coming into view
    act(() => {
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);
    });

    // Wait for error to be caught
    await act(async () => {
      await Promise.resolve();
    });

    // Should have error and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.content).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should respect triggerOnce option', async () => {
    const mockLoadContent = jest.fn().mockResolvedValue({ test: 'data' });

    renderHook(() => 
      useProgressiveContent(mockLoadContent, { triggerOnce: true })
    );

    // Simulate coming into view multiple times
    act(() => {
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);
      callback([{ isIntersecting: false }]);
      callback([{ isIntersecting: true }]);
    });

    // Should only call loadContent once
    expect(mockLoadContent).toHaveBeenCalledTimes(1);
  });

  it('should allow manual reload', async () => {
    const mockData = { test: 'data' };
    const mockLoadContent = jest.fn()
      .mockResolvedValueOnce(mockData)
      .mockResolvedValueOnce({ test: 'updated' });

    const { result } = renderHook(() => 
      useProgressiveContent(mockLoadContent, { priority: true })
    );

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.content).toEqual(mockData);

    // Trigger reload
    await act(async () => {
      await result.current.reload();
    });

    // Should have updated content
    expect(result.current.content).toEqual({ test: 'updated' });
    expect(mockLoadContent).toHaveBeenCalledTimes(2);
  });
});
