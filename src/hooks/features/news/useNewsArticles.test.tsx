import { renderHook, waitFor } from '@testing-library/react';
import { QueryProvider, queryClient } from '@/providers/QueryProvider';
import { useNewsArticles, useNewsArticle } from './useNewsArticles';
import { NewsArticle } from '@/lib/types';

// Mock data
const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Test News 1',
    content: 'Test content 1',
    slug: 'test-news-1',
    createdAt: '2025-03-17T09:00:00.000Z',
    updatedAt: '2025-03-17T09:30:00.000Z',
    publishedAt: '2025-03-17T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test News 2',
    content: 'Test content 2',
    slug: 'test-news-2',
    createdAt: '2025-03-17T09:00:00.000Z',
    updatedAt: '2025-03-17T09:30:00.000Z',
    publishedAt: '2025-03-17T10:00:00.000Z',
  },
];

// Mock fetch
global.fetch = jest.fn();

describe('News Hooks', () => {
  beforeEach(() => {
    queryClient.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('useNewsArticles', () => {
    it('fetches news articles successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNewsArticles),
      });

      const { result } = renderHook(() => useNewsArticles(), {
        wrapper: QueryProvider,
      });

      // Should be loading initially
      expect(result.current.isLoading).toBe(true);

      // Should have data after loading
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNewsArticles);
      });

      // Should have called fetch with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/news-articles'),
        expect.any(Object)
      );
    });

    it('handles query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNewsArticles),
      });

      const params = {
        page: 1,
        pageSize: 10,
        category: 'test',
        tag: 'example',
      };

      renderHook(() => useNewsArticles(params), {
        wrapper: QueryProvider,
      });

      // Should include query parameters in URL
      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=10');
      expect(url).toContain('category=test');
      expect(url).toContain('tag=example');
    });

    it('handles errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNewsArticles(), {
        wrapper: QueryProvider,
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('useNewsArticle', () => {
    it('fetches single news article successfully', async () => {
      const mockArticle = mockNewsArticles[0];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const { result } = renderHook(() => useNewsArticle('test-news-1'), {
        wrapper: QueryProvider,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockArticle);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/news-articles/test-news-1'),
        expect.any(Object)
      );
    });

    it('handles errors for single article', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNewsArticle('non-existent'), {
        wrapper: QueryProvider,
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  it('caches data correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNewsArticles),
    });

    // First render
    const { result, rerender } = renderHook(() => useNewsArticles(), {
      wrapper: QueryProvider,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockNewsArticles);
    });

    // Second render should use cached data
    rerender();

    expect(global.fetch).toHaveBeenCalledTimes(1); // Should only call once due to caching
  });
});