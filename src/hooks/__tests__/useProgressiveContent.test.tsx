import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgressiveContent } from '../useProgressiveContent';
import { monitoringService } from '@/lib/monitoring/service';
import { useInView } from 'react-intersection-observer';

jest.mock('@/lib/monitoring/service', () => ({
  monitoringService: {
    trackPerformanceMetric: jest.fn()
  }
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn()
}));

describe('useProgressiveContent', () => {
  const mockRef = jest.fn();
  const mockedUseInView = useInView as jest.Mock;
  let mockInView = false;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInView = false;
    mockedUseInView.mockImplementation(() => ({
      ref: mockRef,
      inView: mockInView
    }));
  });

  it('laadt content wanneer element in beeld komt', async () => {
    const mockData = { test: 'data' };
    const mockLoadContent = jest.fn().mockResolvedValue(mockData);

    const { result, rerender } = renderHook(() =>
      useProgressiveContent(mockLoadContent, { monitoringKey: 'test' })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();

    act(() => {
      mockInView = true;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.content).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    expect(mockLoadContent).toHaveBeenCalledTimes(1);
    expect(monitoringService.trackPerformanceMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'content_load_test',
        context: expect.objectContaining({
          priority: false,
          inView: true
        })
      })
    );
  });

  it('laadt direct wanneer priority true is', async () => {
    const mockData = { test: 'data' };
    const mockLoadContent = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useProgressiveContent(mockLoadContent, { priority: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.content).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    expect(mockLoadContent).toHaveBeenCalledTimes(1);
  });

  it('zet error state wanneer laden faalt', async () => {
    const mockError = new Error('Test error');
    const mockLoadContent = jest.fn().mockRejectedValue(mockError);

    const { result, rerender } = renderHook(() => useProgressiveContent(mockLoadContent));

    act(() => {
      mockInView = true;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.content).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('geeft triggerOnce door aan useInView', () => {
    const mockLoadContent = jest.fn().mockResolvedValue({ test: 'data' });

    renderHook(() => useProgressiveContent(mockLoadContent, { triggerOnce: true }));

    expect(mockedUseInView).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerOnce: true
      })
    );
  });

  it('kan handmatig opnieuw laden via reload', async () => {
    const mockLoadContent = jest
      .fn()
      .mockResolvedValueOnce({ test: 'first' })
      .mockResolvedValueOnce({ test: 'second' });

    const { result } = renderHook(() =>
      useProgressiveContent(mockLoadContent, { priority: true })
    );

    await waitFor(() => {
      expect(result.current.content).toEqual({ test: 'first' });
    });

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.content).toEqual({ test: 'second' });
    expect(mockLoadContent).toHaveBeenCalledTimes(2);
  });
});
