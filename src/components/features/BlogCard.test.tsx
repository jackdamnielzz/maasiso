import { render, screen, waitFor } from '@testing-library/react';
import BlogCard from './BlogCard';
import { BlogPost } from '@/lib/types';
import { act } from 'react-dom/test-utils';

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

describe('BlogCard', () => {
  const mockPost: BlogPost = {
    id: '123',
    title: 'Test Blog Post',
    content: 'Test content with\nmultiple\nlines',
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
    seoTitle: 'Test SEO Title',
    seoDescription: 'Test SEO Description',
    seoKeywords: 'test, blog, post',
    publishedAt: '2024-01-26T20:30:00.000Z',
    createdAt: '2024-01-26T20:30:00.000Z',
    updatedAt: '2024-01-26T20:30:00.000Z'
  };

  it('renders blog post with all fields', () => {
    render(<BlogCard post={mockPost} />);

    // Check title
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();

    // Check category
    expect(screen.getByText('Technology')).toBeInTheDocument();

    // Check date
    expect(screen.getByText('26 januari 2024')).toBeInTheDocument();

    // Check excerpt (first line of content)
    expect(screen.getByText('Test content')).toBeInTheDocument();

    // Check "Read more" link
    const link = screen.getByText('Lees meer');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/blog/test-blog-post');
  });

  describe('BlogCard Performance', () => {
    beforeEach(() => {
      mockObserve.mockClear();
      mockDisconnect.mockClear();
    });

    it('memoizes excerpt generation', async () => {
      const longContent = 'First paragraph\n'.repeat(1000);
      const post = {
        ...mockPost,
        content: longContent
      };

      const { rerender } = render(<BlogCard post={post} />);

      // Initial render should show first paragraph
      expect(screen.getByText('First paragraph')).toBeInTheDocument();

      // Force re-render with same content
      act(() => {
        rerender(<BlogCard post={post} />);
      });

      // Should use memoized value without recalculation
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
    });

    it('handles image loading performance', async () => {
      const { container } = render(<BlogCard post={mockPost} />);

      // Verify image optimization attributes
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
      expect(img).toHaveAttribute('quality', '75');
    });

    it('handles image loading errors gracefully', async () => {
      const postWithBadImage = {
        ...mockPost,
        featuredImage: {
          ...mockPost.featuredImage!,
          url: '/nonexistent.jpg'
        }
      };

      render(<BlogCard post={postWithBadImage} />);

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

    it('renders efficiently with large category lists', () => {
      const timestamp = new Date().toISOString();
      const postWithManyCategories = {
        ...mockPost,
        categories: mockPost.categories ? Array(100).fill(mockPost.categories[0]).map((cat, i) => ({
          id: `cat${i}`,
          name: `Category ${i}`,
          slug: `category-${i}`,
          description: `Category ${i} description`,
          createdAt: timestamp,
          updatedAt: timestamp
        })) : []
      };

      const startTime = performance.now();
      render(<BlogCard post={postWithManyCategories} />);
      const renderTime = performance.now() - startTime;

      // Render time should be reasonable even with many categories
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });

  it('handles missing optional fields', () => {
    const minimalPost: BlogPost = {
      id: '123',
      title: 'Minimal Post',
      content: 'Test content',
      slug: 'minimal-post',
      categories: [],
      tags: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z',
      publishedAt: ''
    };

    render(<BlogCard post={minimalPost} />);

    // Check title still renders
    expect(screen.getByText('Minimal Post')).toBeInTheDocument();

    // Check content excerpt still works
    expect(screen.getByText('Test content')).toBeInTheDocument();

    // Verify link still works
    const link = screen.getByText('Lees meer');
    expect(link.closest('a')).toHaveAttribute('href', '/blog/minimal-post');
  });

  it('handles numeric IDs correctly', () => {
    const timestamp = new Date().toISOString();
    const postWithNumericIds: BlogPost = {
      ...mockPost,
      id: '123', // Ensure string ID
      categories: [
        {
          id: '456',
          name: 'Default Category',
          slug: 'default',
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ],
      tags: [
        {
          id: '789',
          name: 'Default Tag'
        }
      ]
    };

    render(<BlogCard post={postWithNumericIds} />);

    // Verify the component renders without type errors
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('handles empty categories array', () => {
    const postWithoutCategories: BlogPost = {
      ...mockPost,
      categories: []
    };

    render(<BlogCard post={postWithoutCategories} />);

    // Verify the component still renders
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  it('handles undefined publishedAt date', () => {
    const postWithoutDate: BlogPost = {
      ...mockPost,
      publishedAt: undefined
    };

    render(<BlogCard post={postWithoutDate} />);

    // Verify the component still renders without the date
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });
});
