import { renderHook, act } from '@testing-library/react';
import { useProgressiveLoading } from '../useProgressiveLoading';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useProgressiveLoading', () => {
  it('should handle successful data loading', async () => {
    const mockData = { test: 'data' };
    const mockLoadData = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useProgressiveLoading(mockLoadData));

    // Initially not loading, no data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Simulate coming into view
    act(() => {
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);
    });

    // Should start loading
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await act(async () => {
      await Promise.resolve();
    });

    // Should have data and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading errors', async () => {
    const mockError = new Error('Test error');
    const mockLoadData = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useProgressiveLoading(mockLoadData));

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
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should respect triggerOnce option', async () => {
    const mockLoadData = jest.fn().mockResolvedValue({ test: 'data' });

    renderHook(() => useProgressiveLoading(mockLoadData, { triggerOnce: true }));

    // Simulate coming into view multiple times
    act(() => {
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);
      callback([{ isIntersecting: false }]);
      callback([{ isIntersecting: true }]);
    });

    // Should only call loadData once
    expect(mockLoadData).toHaveBeenCalledTimes(1);
  });
});
