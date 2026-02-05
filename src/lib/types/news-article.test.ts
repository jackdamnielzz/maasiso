import { normalizeNewsArticle } from '../normalizers';
import { NewsArticle, StrapiRawNewsArticle } from '../types';

describe('normalizeNewsArticle', () => {
  it('should normalize a complete news article', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        summary: 'Test summary',
        slug: 'test-news-article',
        author: 'John Doe',
        categories: {
          data: [
            {
              id: 'cat1',
              attributes: {
                name: 'News',
                description: 'News posts',
                slug: 'news',
                createdAt: '2024-01-26T20:30:00.000Z',
                updatedAt: '2024-01-26T20:30:00.000Z'
              }
            }
          ]
        },
        tags: {
          data: [
            {
              id: 'tag1',
              attributes: {
                name: 'Breaking'
              }
            }
          ]
        },
        seoTitle: 'Test SEO Title',
        seoDescription: 'Test SEO Description',
        seoKeywords: 'test, news, article',
        publishedAt: '2024-01-26T20:30:00.000Z',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result).toEqual({
      id: 'article123',
      title: 'Test News Article',
      content: 'Test content',
      summary: 'Test summary',
      slug: 'test-news-article',
      author: 'John Doe',
      categories: [
        {
          id: 'cat1',
          name: 'News',
          description: 'News posts',
          slug: 'news',
          createdAt: '2024-01-26T20:30:00.000Z',
          updatedAt: '2024-01-26T20:30:00.000Z'
        }
      ],
      tags: [
        {
          id: 'tag1',
          name: 'Breaking'
        }
      ],
      featuredImage: undefined,
      seoTitle: 'Test SEO Title',
      seoDescription: 'Test SEO Description',
      seoKeywords: 'test, news, article',
      publishedAt: '2024-01-26T20:30:00.000Z',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    });
  });

  it('should handle minimal required fields', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result).toEqual({
      id: 'article123',
      title: 'Test News Article',
      content: 'Test content',
      slug: 'test-news-article',
      categories: [],
      tags: [],
      summary: undefined,
      author: undefined,
      featuredImage: undefined,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      publishedAt: '',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    });
  });

  it('should handle undefined optional fields', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        author: undefined,
        summary: undefined,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result.author).toBeUndefined();
    expect(result.summary).toBeUndefined();
    expect(result.seoTitle).toBe('');
    expect(result.seoDescription).toBe('');
    expect(result.seoKeywords).toBe('');
  });

  it('should handle numeric IDs', () => {
    const input: StrapiRawNewsArticle = {
      id: 123 as any,
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        categories: {
          data: [
            {
              id: 456 as any,
              attributes: {
                name: 'News',
                description: 'News posts',
                slug: 'news',
                createdAt: '2024-01-26T20:30:00.000Z',
                updatedAt: '2024-01-26T20:30:00.000Z'
              }
            }
          ]
        },
        tags: {
          data: [
            {
              id: 789 as any,
              attributes: {
                name: 'Breaking'
              }
            }
          ]
        },
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result.id).toBe('123');
    expect(result.categories).toBeDefined();
    expect(result.categories?.[0]?.id).toBe('456');
    expect(result.tags).toBeDefined();
    expect(result.tags?.[0]?.id).toBe('789');
  });

  it('should handle flat structure', () => {
    const input = {
      id: 'article123',
      title: 'Test News Article',
      content: 'Test content',
      slug: 'test-news-article',
      categories: {
        data: [
          {
            id: 'cat1',
            attributes: {
              name: 'News',
              description: 'News posts',
              slug: 'news',
              createdAt: '2024-01-26T20:30:00.000Z',
              updatedAt: '2024-01-26T20:30:00.000Z'
            }
          }
        ]
      },
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeNewsArticle(input as any);

    expect(result.id).toBe('article123');
    expect(result.title).toBe('Test News Article');
    expect(result.content).toBe('Test content');
    expect(result.categories).toBeDefined();
    expect(result.categories).toHaveLength(1);
    expect(result.categories?.[0]?.name).toBe('News');
  });

  it('should handle empty categories and tags data', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        categories: { data: [] },
        tags: { data: [] },
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it('should handle undefined categories and tags', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        categories: undefined,
        tags: undefined,
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it('should handle Content and content field casing', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        Content: 'Test Content with capital C',
        content: 'Test content with lowercase c',
        slug: 'test-news-article',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    // Should prefer Content over content
    expect(result.content).toBe('Test Content with capital C');
  });

  it('should handle Author and author field casing', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        Author: 'John Doe',
        author: 'Jane Smith',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    // Should prefer Author over author
    expect(result.author).toBe('John Doe');
  });

  it('should handle publishedAt defaulting to empty string', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result.publishedAt).toBe('');
  });

  it('should handle missing attributes', () => {
    const input: StrapiRawNewsArticle = {
      id: 'article123',
      attributes: {
        title: 'Test News Article',
        content: 'Test content',
        slug: 'test-news-article',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeNewsArticle(input);

    expect(result).toEqual({
      id: 'article123',
      title: 'Test News Article',
      content: 'Test content',
      slug: 'test-news-article',
      categories: [],
      tags: [],
      summary: undefined,
      author: undefined,
      featuredImage: undefined,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      publishedAt: '',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    });
  });
});
