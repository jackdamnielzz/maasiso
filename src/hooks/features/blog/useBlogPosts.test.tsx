import { renderHook, waitFor } from '@testing-library/react';
import { QueryProvider, queryClient } from '@/providers/QueryProvider';
import { useBlogPosts, useBlogPost } from './useBlogPosts';
import { BlogPost } from '@/lib/types';

// Mock data
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Test content 1',
    slug: 'test-post-1',
    createdAt: '2025-03-17T09:00:00.000Z',
    updatedAt: '2025-03-17T09:30:00.000Z',
    publishedAt: '2025-03-17T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test Post 2',
    content: 'Test content 2',
    slug: 'test-post-2',
    createdAt: '2025-03-17T09:00:00.000Z',
    updatedAt: '2025-03-17T09:30:00.000Z',
    publishedAt: '2025-03-17T10:00:00.000Z',
  },
];

// Mock fetch
global.fetch = jest.fn();

describe('Blog Hooks', () => {
  beforeEach(() => {
    queryClient.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('useBlogPosts', () => {
    it('fetches blog posts successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBlogPosts),
      });

      const { result } = renderHook(() => useBlogPosts(), {
        wrapper: QueryProvider,
      });

      // Should be loading initially
      expect(result.current.isLoading).toBe(true);

      // Should have data after loading
      await waitFor(() => {
        expect(result.current.data).toEqual(mockBlogPosts);
      });

      // Should have called fetch with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/blog-posts'),
        expect.any(Object)
      );
    });

    it('handles query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBlogPosts),
      });

      const params = {
        page: 1,
        pageSize: 10,
        category: 'test',
        tag: 'example',
      };

      renderHook(() => useBlogPosts(params), {
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

      const { result } = renderHook(() => useBlogPosts(), {
        wrapper: QueryProvider,
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('useBlogPost', () => {
    it('fetches single blog post successfully', async () => {
      const mockPost = mockBlogPosts[0];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      });

      const { result } = renderHook(() => useBlogPost('test-post-1'), {
        wrapper: QueryProvider,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockPost);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/blog-posts/test-post-1'),
        expect.any(Object)
      );
    });

    it('handles errors for single post', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useBlogPost('non-existent'), {
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
      json: () => Promise.resolve(mockBlogPosts),
    });

    // First render
    const { result, rerender } = renderHook(() => useBlogPosts(), {
      wrapper: QueryProvider,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockBlogPosts);
    });

    // Second render should use cached data
    rerender();

    expect(global.fetch).toHaveBeenCalledTimes(1); // Should only call once due to caching
  });
});