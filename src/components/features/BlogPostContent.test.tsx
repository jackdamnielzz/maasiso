import { render, screen } from '@testing-library/react';
import BlogPostContent from './BlogPostContent';
import { BlogPost } from '@/lib/types';

jest.mock('next/dynamic', () => {
  return () => {
    return function MockDynamicMarkdown({ children }: { children: React.ReactNode }) {
      return <div data-testid="markdown-content">{children}</div>;
    };
  };
});

jest.mock('../common/BackToBlog', () => ({
  __esModule: true,
  default: () => <div data-testid="back-to-blog" />
}));

jest.mock('../common/ScrollToTop', () => ({
  __esModule: true,
  default: () => <div data-testid="scroll-to-top" />
}));

const basePost: BlogPost = {
  id: '123',
  title: 'Test Blog Post',
  content: '# Test Blog Post\n\nIntro tekst\n\nMeer content',
  slug: 'test-blog-post',
  categories: [],
  tags: [],
  featuredImage: {
    id: 'img1',
    name: 'test-image.jpg',
    url: '/uploads/test-image.jpg',
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
  publishedAt: '2024-01-26T20:30:00.000Z',
  createdAt: '2024-01-26T20:30:00.000Z',
  updatedAt: '2024-01-26T20:30:00.000Z'
};

describe('BlogPostContent', () => {
  it('rendert basisinformatie en featured image', () => {
    render(<BlogPostContent post={basePost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('Terug naar Blog')).toBeInTheDocument();
    expect(screen.getByText('26 januari 2024')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Geen gerelateerde artikelen beschikbaar.')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('back-to-blog')).toBeInTheDocument();

    const featuredImage = screen.getByRole('img', { name: 'Test Blog Post' });
    expect(featuredImage).toHaveAttribute('src', '/api/proxy/assets/uploads/test-image.jpg');
  });

  it('toont bijgewerkt-datum alleen wanneer verschil minimaal 1 dag is', () => {
    const { rerender } = render(<BlogPostContent post={basePost} />);
    expect(screen.queryByText('Bijgewerkt:')).not.toBeInTheDocument();

    rerender(
      <BlogPostContent
        post={{
          ...basePost,
          updatedAt: '2024-01-28T20:30:00.000Z'
        }}
      />
    );

    expect(screen.getByText('Bijgewerkt:')).toBeInTheDocument();
    expect(screen.getByText('28 januari 2024')).toBeInTheDocument();
  });

  it('rendert TLDR blok wanneer tldrItems aanwezig zijn', () => {
    render(
      <BlogPostContent
        post={basePost}
        tldrItems={[
          { id: 1, point: 'Punt 1' },
          { id: 2, point: 'Punt 2' },
          { id: 3, point: 'Punt 3' }
        ]}
      />
    );

    expect(screen.getByText('In 30 Seconden')).toBeInTheDocument();
    expect(screen.getByText('Punt 1')).toBeInTheDocument();
    expect(screen.getByText('Punt 2')).toBeInTheDocument();
    expect(screen.getByText('Punt 3')).toBeInTheDocument();
  });

  it('toont gerelateerde artikelen uit post-data', () => {
    render(
      <BlogPostContent
        post={{
          ...basePost,
          relatedPosts: [
            {
              id: 'rel-1',
              title: 'Gerelateerd artikel',
              slug: 'gerelateerd-artikel',
              createdAt: '2024-01-10T10:00:00.000Z',
              updatedAt: '2024-01-10T10:00:00.000Z',
              publishedAt: '2024-01-10T10:00:00.000Z'
            }
          ]
        }}
      />
    );

    expect(screen.queryByText('Geen gerelateerde artikelen beschikbaar.')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gerelateerd artikel/ })).toHaveAttribute(
      'href',
      '/kennis/blog/gerelateerd-artikel'
    );
    expect(screen.getByText('10 januari 2024')).toBeInTheDocument();
  });

  it('ondersteunt author object en verwijdert bovenste markdown titel uit content', () => {
    render(
      <BlogPostContent
        post={{
          ...basePost,
          author: {
            id: 'author-1',
            name: 'Jane Doe',
            slug: 'jane-doe'
          }
        }}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    const markdown = screen.getByTestId('markdown-content');
    expect(markdown).toHaveTextContent('Intro tekst');
    expect(markdown).not.toHaveTextContent('# Test Blog Post');
  });

  it('rendert zonder optionele velden', () => {
    render(
      <BlogPostContent
        post={{
          ...basePost,
          author: undefined,
          featuredImage: undefined,
          publishedAt: undefined,
          content: ''
        }}
      />
    );

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Test Blog Post' })).not.toBeInTheDocument();
  });
});
