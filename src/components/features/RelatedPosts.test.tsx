import { render, screen, waitFor } from '@testing-library/react';
import RelatedPosts from './RelatedPosts';

const mockFetch = jest.fn();
global.fetch = mockFetch;

type StrapiPost = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  imageUrl?: string;
};

function createStrapiResponse(posts: StrapiPost[]) {
  return {
    data: posts.map((post) => ({
      id: post.id,
      attributes: {
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        createdAt: post.publishedAt,
        updatedAt: post.publishedAt,
        featuredImage: post.imageUrl
          ? {
              data: {
                id: `${post.id}-img`,
                attributes: {
                  url: post.imageUrl,
                  alternativeText: post.title,
                },
              },
            }
          : null,
      },
    })),
  };
}

describe('RelatedPosts', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('toont loading tijdens ophalen', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<RelatedPosts currentSlug="huidige-post" categoryIds={['cat1']} />);

    expect(screen.getByText('Loading related posts...')).toBeInTheDocument();
  });

  it('haalt gerelateerde posts op en rendert ze', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        createStrapiResponse([
          {
            id: '1',
            title: 'Related Post 1',
            slug: 'related-post-1',
            publishedAt: '2024-01-26T20:30:00.000Z',
            imageUrl: '/uploads/image-1.jpg',
          },
          {
            id: '2',
            title: 'Related Post 2',
            slug: 'related-post-2',
            publishedAt: '2024-01-27T20:30:00.000Z',
          },
        ]),
    });

    render(<RelatedPosts currentSlug="huidige-post" categoryIds={['cat1']} />);

    await waitFor(() => {
      expect(screen.getByText('Related Posts')).toBeInTheDocument();
      expect(screen.getByText('Related Post 1')).toBeInTheDocument();
      expect(screen.getByText('Related Post 2')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = String(mockFetch.mock.calls[0][0]);
    expect(calledUrl).toContain('/api/proxy/blog-posts');
    expect(calledUrl).toContain('filters[slug][$ne]=huidige-post');
    expect(calledUrl).toContain('pagination[limit]=3');
  });

  it('voegt category filters toe aan request URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => createStrapiResponse([]),
    });

    render(<RelatedPosts currentSlug="huidige-post" categoryIds={['cat1', 'cat2']} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const calledUrl = String(mockFetch.mock.calls[0][0]);
    expect(calledUrl).toContain('filters[categories][id][$in]=cat1');
    expect(calledUrl).toContain('filters[categories][id][$in]=cat2');
  });

  it('rendert niets bij lege response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => createStrapiResponse([]),
    });

    const { container } = render(
      <RelatedPosts currentSlug="huidige-post" categoryIds={['cat1']} />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('Related Posts')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('slaat fetch over wanneer currentSlug ontbreekt', async () => {
    const { container } = render(<RelatedPosts categoryIds={['cat1']} />);

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('handelt fetch errors af zonder crash', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const { container } = render(
      <RelatedPosts currentSlug="huidige-post" categoryIds={['cat1']} />
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    expect(screen.queryByText('Related Posts')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();

    errorSpy.mockRestore();
  });
});
