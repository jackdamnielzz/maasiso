import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgressiveLoading } from '../useProgressiveLoading';
import { useInView } from 'react-intersection-observer';

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn()
}));

describe('useProgressiveLoading', () => {
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

  it('laadt data wanneer element in beeld komt', async () => {
    const mockData = { test: 'data' };
    const mockLoadData = jest.fn().mockResolvedValue(mockData);

    const { result, rerender } = renderHook(() => useProgressiveLoading(mockLoadData));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    act(() => {
      mockInView = true;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    expect(mockLoadData).toHaveBeenCalledTimes(1);
  });

  it('zet error state wanneer laden faalt', async () => {
    const mockError = new Error('Test error');
    const mockLoadData = jest.fn().mockRejectedValue(mockError);

    const { result, rerender } = renderHook(() => useProgressiveLoading(mockLoadData));

    act(() => {
      mockInView = true;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('geeft triggerOnce door aan useInView', () => {
    const mockLoadData = jest.fn().mockResolvedValue({ test: 'data' });

    renderHook(() => useProgressiveLoading(mockLoadData, { triggerOnce: true }));

    expect(mockedUseInView).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerOnce: true
      })
    );
  });
});
