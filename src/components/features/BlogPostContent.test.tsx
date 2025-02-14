import { render, screen, waitFor, act } from '@testing-library/react';
import BlogPostContent from './BlogPostContent';
import { BlogPost } from '@/lib/types';

// Mock performance observer
const mockDisconnect = jest.fn();
const mockObserve = jest.fn();
class MockPerformanceObserver {
  static supportedEntryTypes = ['element', 'largest-contentful-paint', 'layout-shift', 'longtask', 'paint', 'resource'];
  
  observe = mockObserve;
  disconnect = mockDisconnect;

  constructor(callback: PerformanceObserverCallback) {
    // Store callback if needed for tests
  }
}

global.PerformanceObserver = MockPerformanceObserver as any;

// Mock IntersectionObserver for LazyImage
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
global.IntersectionObserver = mockIntersectionObserver;

describe('BlogPostContent', () => {
    const mockPost: BlogPost = {
      id: '123',
      title: 'Test Blog Post',
      content: '# Test Blog Post\n\n<br>\n\n<p>Test content</p><img src="/test-image.jpg" alt="Test image">',
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
    featuredImage: {
      id: 'img1',
      name: 'test-image.jpg',
      url: '/test-image.jpg',
      width: 800,
      height: 600,
      hash: 'test',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: 1000,
      provider: 'local',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z',
      publishedAt: '2024-01-26T20:30:00.000Z'
    },
    author: 'John Doe',
    seoTitle: 'Test SEO Title',
    seoDescription: 'Test SEO Description',
    seoKeywords: 'test, blog, post',
    publishedAt: '2024-01-26T20:30:00.000Z',
    createdAt: '2024-01-26T20:30:00.000Z',
    updatedAt: '2024-01-26T20:30:00.000Z'
  };

  beforeEach(() => {
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    // Reset environment variables
    process.env.NEXT_PUBLIC_ASSET_PREFIX = '';
  });

  it('renders blog post with all fields', async () => {
    render(<BlogPostContent post={mockPost} />);

    // Check title
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();

    // Check author with icon
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    const authorIcon = document.querySelector('svg path[d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"]');
    expect(authorIcon).toBeInTheDocument();

    // Check date with icon
    expect(screen.getByText('26 januari 2024')).toBeInTheDocument();
    const dateIcon = document.querySelector('svg path[d*="M6 2a1 1 0 00-1 1v1H4a2"]');
    expect(dateIcon).toBeInTheDocument();

    // Check category with hover state
    const category = screen.getByText('Technology');
    expect(category).toBeInTheDocument();
    expect(category).toHaveClass('hover:bg-[#091E42]/10', 'transition-colors', 'duration-200');

    // Check content processing
    expect(screen.queryByText('# Test Blog Post')).not.toBeInTheDocument(); // Title should be removed
    expect(screen.getByText('Test content')).toBeInTheDocument(); // Content should remain

    // Wait for image processing
    await waitFor(() => {
      expect(screen.queryByText('Afbeeldingen worden geladen...')).not.toBeInTheDocument();
    });
  });

  describe('Image Processing', () => {
    it('processes content images correctly', async () => {
      const { container } = render(<BlogPostContent post={mockPost} />);

      // Initially shows loading state
      expect(screen.getByText('Afbeeldingen worden geladen...')).toBeInTheDocument();

      // Wait for processing to complete
      await waitFor(() => {
        expect(screen.queryByText('Afbeeldingen worden geladen...')).not.toBeInTheDocument();
      });

      // Check if image was processed
      const processedImage = container.querySelector('.relative.w-full.h-[400px].my-6 img');
      expect(processedImage).toBeInTheDocument();
      expect(processedImage).toHaveAttribute('src', '/test-image.jpg');
    });

    it('handles image processing errors gracefully', async () => {
      const postWithBadImage: BlogPost = {
        ...mockPost,
        content: '<p>Test content</p><img src="" alt="Bad image">'
      };

      render(<BlogPostContent post={postWithBadImage} />);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/Waarschuwing:/)).toBeInTheDocument();
      });
    });

    it('handles featured image errors gracefully', async () => {
      const postWithBadFeaturedImage: BlogPost = {
        ...mockPost,
        featuredImage: {
          ...mockPost.featuredImage!,
          url: '/nonexistent.jpg'
        }
      };

      render(<BlogPostContent post={postWithBadFeaturedImage} />);

      // Simulate image load error
      const img = screen.getByRole('img');
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      // Should show fallback
      await waitFor(() => {
        expect(screen.getByText('Kon de afbeelding niet laden')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('processes large content efficiently', async () => {
      const largeContent = Array(100)
        .fill('<p>Test paragraph</p><img src="/test-image.jpg" alt="Test image">')
        .join('');

      const postWithLargeContent: BlogPost = {
        ...mockPost,
        content: largeContent
      };

      const startTime = performance.now();
      render(<BlogPostContent post={postWithLargeContent} />);
      const renderTime = performance.now() - startTime;

      // Initial render should be quick
      expect(renderTime).toBeLessThan(100); // 100ms threshold

      // Wait for image processing
      await waitFor(() => {
        expect(screen.queryByText('Afbeeldingen worden geladen...')).not.toBeInTheDocument();
      });
    });

    it('optimizes featured image loading', () => {
      const { container } = render(<BlogPostContent post={mockPost} />);

      // Check featured image optimization attributes
      const featuredImg = container.querySelector('.relative.w-full.h-\\[300px\\].mb-12 img');
      expect(featuredImg).toHaveAttribute('loading', 'eager'); // priority prop sets loading=eager
      expect(featuredImg).toHaveAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw');
      expect(featuredImg).toHaveAttribute('quality', '90');
      expect(featuredImg).toHaveClass('shadow-md');
    });
  });

  describe('Error Handling', () => {
    it('handles missing content gracefully', () => {
      const postWithoutContent: BlogPost = {
        ...mockPost,
        content: ''
      };

      render(<BlogPostContent post={postWithoutContent} />);
      
      // Should still render title and metadata
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    it('handles missing optional fields', () => {
      const minimalPost: BlogPost = {
        ...mockPost,
        author: undefined,
        categories: [],
        tags: [],
        featuredImage: undefined,
        publishedAt: undefined
      };

      render(<BlogPostContent post={minimalPost} />);

      // Should render without errors
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    it('handles content with invalid HTML', async () => {
      const postWithInvalidHtml: BlogPost = {
        ...mockPost,
        content: '<p>Test content<p><div>'
      };

      render(<BlogPostContent post={postWithInvalidHtml} />);

      // Should render without crashing
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });
});
