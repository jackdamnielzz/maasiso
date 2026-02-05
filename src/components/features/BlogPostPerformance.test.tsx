import { render, screen } from '@testing-library/react';
import BlogPostPerformance from './BlogPostPerformance';
import { initPerformanceMonitoring, measurePageLoad } from '@/lib/monitoring/performance';

jest.mock('@/lib/monitoring/performance', () => ({
  initPerformanceMonitoring: jest.fn(),
  measurePageLoad: jest.fn()
}));

jest.mock('./BlogPostContent', () => ({
  __esModule: true,
  default: ({ post }: any) => (
    <div data-testid="blog-post-content" data-post-id={String(post.id)}>
      {post.title}
    </div>
  )
}));

jest.mock('./RelatedPosts', () => ({
  __esModule: true,
  default: ({ currentSlug }: any) => (
    <div data-testid="related-posts" data-current-slug={currentSlug} />
  )
}));

jest.mock('./ContentAnalytics', () => ({
  __esModule: true,
  default: ({ contentType, contentId, title, metadata }: any) => (
    <div
      data-testid="content-analytics"
      data-content-type={contentType}
      data-content-id={contentId}
      data-title={title}
      data-reading-time={String(metadata?.readingTime)}
      data-categories={JSON.stringify(metadata?.categories ?? [])}
      data-tags={JSON.stringify(metadata?.tags ?? [])}
      data-author={metadata?.author ?? ''}
    />
  )
}));

describe('BlogPostPerformance', () => {
  const mockPost = {
    id: 'post123',
    title: 'Test Blog Post',
    content: 'Test content voor leestijd',
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
    author: 'John Doe',
    seoTitle: 'Test SEO Title',
    seoDescription: 'Test SEO Description',
    seoKeywords: 'test, blog, post',
    publishedAt: '2024-01-26T20:30:00.000Z',
    createdAt: '2024-01-26T20:30:00.000Z',
    updatedAt: '2024-01-26T20:30:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialiseert performance monitoring op mount', () => {
    render(<BlogPostPerformance post={mockPost as any} />);

    expect(initPerformanceMonitoring).toHaveBeenCalledTimes(1);
    expect(measurePageLoad).toHaveBeenCalledWith('blog-test-blog-post');
  });

  it('rendert content en related posts met correcte props', () => {
    render(<BlogPostPerformance post={mockPost as any} />);

    expect(screen.getByTestId('blog-post-content')).toHaveAttribute('data-post-id', 'post123');
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByTestId('related-posts')).toHaveAttribute('data-current-slug', 'test-blog-post');
  });

  it('geeft correcte metadata door aan analytics', () => {
    render(<BlogPostPerformance post={mockPost as any} />);

    const analytics = screen.getByTestId('content-analytics');
    expect(analytics).toHaveAttribute('data-content-type', 'blog');
    expect(analytics).toHaveAttribute('data-content-id', 'post123');
    expect(analytics).toHaveAttribute('data-title', 'Test Blog Post');
    expect(analytics).toHaveAttribute('data-author', 'John Doe');
    expect(analytics).toHaveAttribute('data-categories', JSON.stringify(['Technology']));
    expect(analytics).toHaveAttribute('data-tags', JSON.stringify(['TypeScript']));
    expect(analytics).toHaveAttribute('data-reading-time', '1');
  });

  it('berekent leestijd op basis van woordaantal', () => {
    const longPost = {
      ...mockPost,
      content: Array(1000).fill('woord').join(' ')
    };

    render(<BlogPostPerformance post={longPost as any} />);

    expect(screen.getByTestId('content-analytics')).toHaveAttribute('data-reading-time', '5');
  });

  it('herstart monitoring wanneer slug wijzigt', () => {
    const { rerender } = render(<BlogPostPerformance post={mockPost as any} />);

    rerender(
      <BlogPostPerformance
        post={{
          ...mockPost,
          slug: 'nieuwe-slug'
        } as any}
      />
    );

    expect(initPerformanceMonitoring).toHaveBeenCalledTimes(2);
    expect(measurePageLoad).toHaveBeenCalledTimes(2);
    expect(measurePageLoad).toHaveBeenLastCalledWith('blog-nieuwe-slug');
  });

  it('houdt metadata stabiel bij lege categorieen en tags', () => {
    render(
      <BlogPostPerformance
        post={{
          ...mockPost,
          categories: [],
          tags: [],
          author: undefined
        } as any}
      />
    );

    const analytics = screen.getByTestId('content-analytics');
    expect(analytics).toHaveAttribute('data-categories', JSON.stringify([]));
    expect(analytics).toHaveAttribute('data-tags', JSON.stringify([]));
    expect(analytics).toHaveAttribute('data-author', '');
  });
});
