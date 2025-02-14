import { render, screen } from '@testing-library/react';
import BlogPostLoading from './loading';

describe('BlogPostLoading', () => {
  it('renders loading skeleton with correct structure', () => {
    const { container } = render(<BlogPostLoading />);

    // Verify loading component is present
    expect(screen.getByTestId('blog-post-loading')).toBeInTheDocument();

    // Header skeleton
    const header = container.querySelector('.mb-8.animate-pulse');
    expect(header).toBeInTheDocument();
    expect(header?.querySelector('.h-8.w-3\\/4')).toBeInTheDocument(); // Title
    expect(header?.querySelectorAll('.h-4').length).toBe(2); // Author and date

    // Featured image skeleton
    expect(container.querySelector('.h-\\[400px\\].mb-8')).toBeInTheDocument();

    // Content skeleton
    const content = container.querySelector('.max-w-4xl.mx-auto.space-y-4');
    expect(content).toBeInTheDocument();
    expect(content?.querySelectorAll('.h-4').length).toBe(8); // Paragraph lines

    // Related posts skeleton
    const relatedPosts = container.querySelector('.mt-16');
    expect(relatedPosts).toBeInTheDocument();
    expect(relatedPosts?.querySelectorAll('.bg-white.rounded-lg').length).toBe(3); // 3 post cards
  });

  it('applies animation classes correctly', () => {
    const { container } = render(<BlogPostLoading />);

    // Count elements with animate-pulse class
    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);

    // Verify specific sections have animation
    expect(container.querySelector('.mb-8.animate-pulse')).toBeInTheDocument(); // Header
    expect(container.querySelector('.h-\\[400px\\].mb-8.animate-pulse')).toBeInTheDocument(); // Featured image
    expect(container.querySelector('.space-y-4.animate-pulse')).toBeInTheDocument(); // Content
  });

  it('maintains responsive layout structure', () => {
    const { container } = render(<BlogPostLoading />);

    // Related posts grid
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'gap-8'
    );
  });

  it('renders with accessible structure', () => {
    render(<BlogPostLoading />);

    // Loading state should be announced to screen readers
    const loadingElement = screen.getByTestId('blog-post-loading');
    expect(loadingElement).toBeInTheDocument();

    // Verify proper semantic structure
    expect(loadingElement.tagName).toBe('DIV');
    expect(loadingElement).toHaveClass('bg-white', 'py-24');
  });

  it('renders consistent dimensions for skeleton elements', () => {
    const { container } = render(<BlogPostLoading />);

    // Title skeleton
    const titleSkeleton = container.querySelector('.h-8.w-3\\/4');
    expect(titleSkeleton).toHaveClass('bg-gray-200', 'rounded', 'mb-4');

    // Metadata skeletons
    const metadataSkeletons = container.querySelectorAll('.h-4');
    metadataSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('bg-gray-200', 'rounded');
    });

    // Featured image skeleton
    const imageSkeleton = container.querySelector('.h-\\[400px\\]');
    expect(imageSkeleton).toHaveClass('bg-gray-200', 'rounded-lg');

    // Content paragraph skeletons
    const paragraphSkeletons = container.querySelectorAll('.space-y-4 .h-4');
    paragraphSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('bg-gray-200', 'rounded');
    });
  });

  it('renders related posts skeleton with correct card structure', () => {
    const { container } = render(<BlogPostLoading />);

    const cards = container.querySelectorAll('.bg-white.rounded-lg');
    cards.forEach(card => {
      // Image placeholder
      expect(card.querySelector('.h-48.bg-gray-200')).toBeInTheDocument();

      // Content placeholders
      const content = card.querySelector('.p-6');
      expect(content?.querySelector('.h-4.w-3\\/4')).toBeInTheDocument(); // Title
      expect(content?.querySelectorAll('.h-4').length).toBe(3); // Title + 2 lines of text
    });
  });
});
