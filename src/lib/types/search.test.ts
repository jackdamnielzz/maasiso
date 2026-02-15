import { transformStrapiPaginatedResponse, isStrapiPaginatedResponse } from '../normalizers';
import { SearchResults, PaginatedBlogPosts } from '../types';

describe('Search and Pagination', () => {
  describe('isStrapiPaginatedResponse', () => {
    it('should validate a correct paginated response', () => {
      const input = {
        data: [],
        meta: {
          pagination: {
            total: 10,
            page: 1,
            pageSize: 5,
            pageCount: 2
          }
        }
      };

      expect(isStrapiPaginatedResponse(input)).toBe(true);
    });

    it('should reject invalid pagination structure', () => {
      const inputs = [
        {}, // Empty object
        { data: [] }, // Missing meta
        { meta: { pagination: {} } }, // Missing data
        { // Missing pagination fields
          data: [],
          meta: {
            pagination: {
              total: 10,
              page: 1
            }
          }
        },
        null,
        undefined,
        [] // Array instead of object
      ];

      inputs.forEach(input => {
        expect(isStrapiPaginatedResponse(input)).toBe(false);
      });
    });
  });

  describe('transformStrapiPaginatedResponse', () => {
    it('should transform a valid paginated response', () => {
      const input = {
        data: [
          { id: '1', title: 'Test 1' },
          { id: '2', title: 'Test 2' }
        ],
        meta: {
          pagination: {
            total: 2,
            page: 1,
            pageSize: 10,
            pageCount: 1
          }
        }
      };

      const result = transformStrapiPaginatedResponse(input);

      expect(result).toEqual({
        data: [
          { id: '1', title: 'Test 1' },
          { id: '2', title: 'Test 2' }
        ],
        meta: {
          pagination: {
            total: 2,
            page: 1,
            pageSize: 10,
            pageCount: 1
          }
        }
      });
    });

    it('should handle empty data array', () => {
      const input = {
        data: [],
        meta: {
          pagination: {
            total: 0,
            page: 1,
            pageSize: 10,
            pageCount: 0
          }
        }
      };

      const result = transformStrapiPaginatedResponse(input);

      expect(result.data).toEqual([]);
      expect(result.meta.pagination.total).toBe(0);
    });

    it('should throw error for invalid structure', () => {
      const input = {
        data: [],
        meta: {} // Missing pagination
      };

      expect(() => transformStrapiPaginatedResponse(input)).toThrow('Invalid Strapi pagination structure');
    });
  });

  describe('Search Results Type Validation', () => {
    it('should validate a complete search results structure', () => {
      const searchResults: SearchResults = {
        items: [
          {
            id: 'blog1',
            title: 'Blog Post 1',
            content: 'Content 1',
            slug: 'blog-post-1',
            categories: [],
            tags: [],
            seoTitle: '',
            seoDescription: '',
            seoKeywords: '',
            createdAt: '2024-01-26T20:30:00.000Z',
            updatedAt: '2024-01-26T20:30:00.000Z'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pageCount: 1
      };

      expect(searchResults.items).toHaveLength(1);
      expect(searchResults.total).toBe(1);
    });

    it('should validate paginated blog posts structure', () => {
      const paginatedPosts: PaginatedBlogPosts = {
        posts: [
          {
            id: 'blog1',
            title: 'Blog Post 1',
            content: 'Content 1',
            slug: 'blog-post-1',
            categories: [],
            tags: [],
            seoTitle: '',
            seoDescription: '',
            seoKeywords: '',
            createdAt: '2024-01-26T20:30:00.000Z',
            updatedAt: '2024-01-26T20:30:00.000Z'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pageCount: 1
      };

      expect(paginatedPosts.posts[0].title).toBe('Blog Post 1');
      expect(paginatedPosts.total).toBe(1);
    });

  });
});
