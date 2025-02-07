import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import RelatedPosts from './RelatedPosts';
import { BlogPost } from '@/lib/types';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock BlogCard component
jest.mock('./BlogCard', () => {
  return function MockBlogCard({ post }: { post: BlogPost }) {
    return <div data-testid={`blog-card-${post.id}`}>{post.title}</div>;
  };
});

describe('RelatedPosts', () => {
  const mockRelatedPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Related Post 1',
      content: 'Content 1',
      slug: 'related-post-1',
      categories: [{ id: 'cat1', name: 'Category 1', slug: 'category-1', createdAt: '', updatedAt: '' }],
      tags: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z',
      publishedAt: '2024-01-26T20:30:00.000Z'
    },
    {
      id: '2',
      title: 'Related Post 2',
      content: 'Content 2',
      slug: 'related-post-2',
      categories: [{ id: 'cat1', name: 'Category 1', slug: 'category-1', createdAt: '', updatedAt: '' }],
      tags: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z',
      publishedAt: '2024-01-26T20:30:00.000Z'
    }
  ];

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches and renders related posts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blogPosts: mockRelatedPosts })
    });

    render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);

    // Should show loading state initially
    expect(screen.getByText('Gerelateerde artikelen')).toBeInTheDocument();
    expect(screen.getAllByTestId(/blog-card/).length).toBe(0);

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('blog-card-2')).toBeInTheDocument();
    });

    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/blog-posts'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Object)
      })
    );

    // Verify URL parameters
    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.searchParams.get('pagination[pageSize]')).toBe('3');
    expect(url.searchParams.get('filters[slug][$ne]')).toBe('current-post');
    expect(url.searchParams.get('filters[categories][id][$in]')).toBe('cat1');
  });

  it('shows loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);

    // Should show loading skeleton
    expect(screen.getByText('Gerelateerde artikelen')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(document.querySelectorAll('.bg-gray-200.h-64').length).toBe(3);
  });

  it('handles empty response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blogPosts: [] })
    });

    render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);

    await waitFor(() => {
      expect(screen.getByText('Geen gerelateerde artikelen gevonden.')).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);

    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden bij het laden van gerelateerde artikelen.')).toBeInTheDocument();
    });

    // Should show retry button
    const retryButton = screen.getByText('Probeer opnieuw');
    expect(retryButton).toBeInTheDocument();
  });

  it('handles retry after error', async () => {
    // First request fails
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);

    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden bij het laden van gerelateerde artikelen.')).toBeInTheDocument();
    });

    // Setup success response for retry
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blogPosts: mockRelatedPosts })
    });

    // Click retry button
    fireEvent.click(screen.getByText('Probeer opnieuw'));

    // Should show loading state again
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

    // Wait for success
    await waitFor(() => {
      expect(screen.getByTestId('blog-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('blog-card-2')).toBeInTheDocument();
    });
  });

  it('handles non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);

    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden bij het laden van gerelateerde artikelen.')).toBeInTheDocument();
    });
  });

  it('skips fetch if no category IDs', async () => {
    render(<RelatedPosts currentSlug="current-post" categoryIds={[]} />);

    // Should show empty state immediately without loading
    expect(screen.getByText('Geen gerelateerde artikelen gevonden.')).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  describe('Performance', () => {
    it('renders large number of posts efficiently', async () => {
      const manyPosts = Array(20).fill(null).map((_, i) => ({
        ...mockRelatedPosts[0],
        id: `post${i}`,
        title: `Related Post ${i}`
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
      json: async () => ({ blogPosts: manyPosts })
      });

      const startTime = performance.now();
      render(<RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />);
      const renderTime = performance.now() - startTime;

      // Initial render should be quick
      expect(renderTime).toBeLessThan(100); // 100ms threshold

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getAllByTestId(/blog-card/).length).toBe(20);
      });
    });

    it('handles rapid category changes', async () => {
      const { rerender } = render(
        <RelatedPosts currentSlug="current-post" categoryIds={['cat1']} />
      );

      // Change categories rapidly
      act(() => {
        rerender(<RelatedPosts currentSlug="current-post" categoryIds={['cat2']} />);
        rerender(<RelatedPosts currentSlug="current-post" categoryIds={['cat3']} />);
      });

      // Should only make one fetch request for the final value
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const url = new URL(mockFetch.mock.calls[0][0]);
        expect(url.searchParams.get('filters[categories][id][$in]')).toBe('cat3');
      });
    });
  });
});
