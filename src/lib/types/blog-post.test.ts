import { normalizeBlogPost } from '../normalizers';
import { BlogPost, StrapiRawBlogPost } from '../types';

describe('normalizeBlogPost', () => {
  it('should normalize a complete blog post', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      content: 'Test content',
      slug: 'test-blog-post',
      author: 'John Doe',
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

    const result = normalizeBlogPost(input);

    expect(result).toEqual({
      id: 'post123',
      title: 'Test Blog Post',
      content: 'Test content',
      slug: 'test-blog-post',
      author: 'John Doe',
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
      featuredImage: undefined,
      seoTitle: 'Test SEO Title',
      seoDescription: 'Test SEO Description',
      seoKeywords: 'test, blog, post',
      publishedAt: '2024-01-26T20:30:00.000Z',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    });
  });

  it('should convert numeric IDs to strings', () => {
    const input: StrapiRawBlogPost = {
      id: 123 as any, // Simulating numeric ID from API
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      categories: [
        {
          id: 456 as any, // Simulating numeric ID
          name: 'Technology',
          description: 'Tech posts',
          slug: 'technology',
          createdAt: '2024-01-26T20:30:00.000Z',
          updatedAt: '2024-01-26T20:30:00.000Z'
        }
      ],
      tags: [
        {
          id: 789 as any, // Simulating numeric ID
          name: 'TypeScript'
        }
      ],
      featuredImage: {
        id: 101 as any, // Simulating numeric ID
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
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    // Verify all IDs are strings
    expect(typeof result.id).toBe('string');
    expect(result.id).toBe('123');
    expect(typeof result.categories?.[0].id).toBe('string');
    expect(result.categories?.[0].id).toBe('456');
    expect(typeof result.tags?.[0].id).toBe('string');
    expect(result.tags?.[0].id).toBe('789');
    expect(typeof result.featuredImage?.id).toBe('string');
    expect(result.featuredImage?.id).toBe('101');
  });

  it('should maintain relationships after normalization', () => {
    const categoryId = 'cat123';
    const tagId = 'tag123';
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      categories: [
        {
          id: categoryId,
          name: 'Technology',
          description: 'Tech posts',
          slug: 'technology',
          createdAt: '2024-01-26T20:30:00.000Z',
          updatedAt: '2024-01-26T20:30:00.000Z'
        }
      ],
      tags: [
        {
          id: tagId,
          name: 'TypeScript'
        }
      ],
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    // Verify relationships are maintained
    expect(result.categories).toHaveLength(1);
    expect(result.categories?.[0].id).toBe(categoryId);
    expect(result.tags).toHaveLength(1);
    expect(result.tags?.[0].id).toBe(tagId);

    // Verify relationship data is complete
    expect(result.categories?.[0]).toEqual(input.categories?.[0]);
    expect(result.tags?.[0]).toEqual(input.tags?.[0]);
  });

  it('should handle minimal required fields', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    expect(result).toEqual({
      id: 'post123',
      title: 'Test Blog Post',
      content: '',
      slug: 'test-blog-post',
      categories: [],
      tags: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z',
      publishedAt: '',
      author: undefined,
      featuredImage: undefined
    });
  });

  it('should handle undefined optional fields', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      author: undefined,
      seoTitle: undefined,
      seoDescription: undefined,
      seoKeywords: undefined,
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    expect(result.author).toBeUndefined();
    expect(result.seoTitle).toBe('');
    expect(result.seoDescription).toBe('');
    expect(result.seoKeywords).toBe('');
  });

  it('should handle both Content and content fields', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      Content: 'Test Content with capital C',
      content: 'Test content with lowercase c',
      slug: 'test-blog-post',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    // Should prefer Content over content
    expect(result.content).toBe('Test Content with capital C');
  });

  it('should handle both Author and author fields', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      Author: 'John Doe',
      author: 'Jane Smith',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    // Should prefer Author over author
    expect(result.author).toBe('John Doe');
  });

  it('should handle empty arrays for categories and tags', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      categories: [],
      tags: [],
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it('should handle undefined arrays for categories and tags', () => {
    const input: StrapiRawBlogPost = {
      id: 'post123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      categories: undefined,
      tags: undefined,
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    };

    const result = normalizeBlogPost(input);

    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
  });
});
