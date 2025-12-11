import { render, screen } from '@testing-library/react';
import BlogPostPerformance from './BlogPostPerformance';
import { initPerformanceMonitoring, measurePageLoad } from '@/lib/monitoring/performance';

// Mock performance monitoring functions
jest.mock('@/lib/monitoring/performance', () => ({
  initPerformanceMonitoring: jest.fn(),
  measurePageLoad: jest.fn()
}));

describe('BlogPostPerformance', () => {
  const mockPost = {
    id: 'post123',
    title: 'Test Blog Post',
    content: 'Test content',
    slug: 'test-blog-post',
    categories: [
      {
        id: 'cat1',
        name: 'Technology',
        description: 'Tech posts',
        slug: 'technology',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    ],
    tags: [
      {
        id: 'tag1',
        name: 'TypeScript'
      }
    ],
    seoTitle: 'Test SEO Title',
    seoDescription: 'Test SEO Description',
    seoKeywords: 'test, blog, post',
    publishedAt: '2024-01-26T20:30:00.000Z',
    createdAt: '2024-01-26T20:30:00.000Z',
    updatedAt: '2024-01-26T20:30:00.000Z'
  };

  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it('initializes performance monitoring on mount', () => {
    render(<BlogPostPerformance post={mockPost} />);

    expect(initPerformanceMonitoring).toHaveBeenCalledTimes(1);
    expect(measurePageLoad).toHaveBeenCalledWith(`blog-${mockPost.slug}`);
  });

  it('renders blog post content', () => {
    render(<BlogPostPerformance post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('renders content analytics with correct props', () => {
    render(<BlogPostPerformance post={mockPost} />);

    const analytics = screen.getByTestId('content-analytics');
    expect(analytics).toHaveAttribute('data-content-type', 'blog');
    expect(analytics).toHaveAttribute('data-content-id', 'post123');
  });

  it('handles posts without categories', () => {
    const postWithoutCategories = {
      ...mockPost,
      categories: []
    };

    render(<BlogPostPerformance post={postWithoutCategories} />);

    // Should still render without errors
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('calculates reading time correctly', () => {
    const postWithLongContent = {
      ...mockPost,
      content: Array(1000).fill('word').join(' ') // 1000 words
    };

    render(<BlogPostPerformance post={postWithLongContent} />);

    // 1000 words / 200 words per minute = 5 minutes
    const analytics = screen.getByTestId('content-analytics');
    expect(analytics).toHaveAttribute('data-reading-time', '5');
  });

  it('reinitializes monitoring when slug changes', () => {
    const { rerender } = render(<BlogPostPerformance post={mockPost} />);

    // Initial render calls
    expect(initPerformanceMonitoring).toHaveBeenCalledTimes(1);
    expect(measurePageLoad).toHaveBeenCalledTimes(1);

    // Update with new post
    const newPost = {
      ...mockPost,
      slug: 'new-test-post'
    };

    rerender(<BlogPostPerformance post={newPost} />);

    // Should be called again
    expect(initPerformanceMonitoring).toHaveBeenCalledTimes(2);
    expect(measurePageLoad).toHaveBeenCalledTimes(2);
    expect(measurePageLoad).toHaveBeenLastCalledWith('blog-new-test-post');
  });

  it('renders error boundaries for analytics and related posts', () => {
    render(<BlogPostPerformance post={mockPost} />);

    // Both error boundaries should be present
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries).toHaveLength(2);
  });
});
