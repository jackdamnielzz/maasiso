import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryProvider, queryClient } from './QueryProvider';
import { useQuery } from '@tanstack/react-query';

// Test component that uses React Query
function TestComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve('test data'),
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data}</div>;
}

describe('QueryProvider', () => {
  beforeEach(() => {
    // Clear the query cache before each test
    queryClient.clear();
  });

  it('provides query client to children', async () => {
    const { getByText } = render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    // Should show loading state initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // Should show data after loading
    await waitFor(() => {
      expect(getByText('test data')).toBeInTheDocument();
    });
  });

  it('uses configured default options', async () => {
    const mockFn = jest.fn().mockResolvedValue('test data');
    
    function TestErrorComponent() {
      const { error } = useQuery({
        queryKey: ['test-error'],
        queryFn: () => {
          mockFn();
          throw new Error('test error');
        },
      });

      if (error) return <div>Error: {error.message}</div>;
      return null;
    }

    const { getByText } = render(
      <QueryProvider>
        <TestErrorComponent />
      </QueryProvider>
    );

    // Retry is disabled in defaultOptions to fail fast in UI.
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(getByText('Error: test error')).toBeInTheDocument();
    });
  });

  it('maintains query cache', async () => {
    const mockFn = jest.fn().mockResolvedValue('cached data');

    function TestCacheComponent() {
      const { data } = useQuery({
        queryKey: ['test-cache'],
        queryFn: mockFn,
      });

      return <div>{data}</div>;
    }

    const { getByText, rerender } = render(
      <QueryProvider>
        <TestCacheComponent />
      </QueryProvider>
    );

    // Wait for initial data
    await waitFor(() => {
      expect(getByText('cached data')).toBeInTheDocument();
    });

    // Rerender should use cached data
    rerender(
      <QueryProvider>
        <TestCacheComponent />
      </QueryProvider>
    );

    expect(getByText('cached data')).toBeInTheDocument();
    expect(mockFn).toHaveBeenCalledTimes(1); // Should only call once due to caching
  });
});
