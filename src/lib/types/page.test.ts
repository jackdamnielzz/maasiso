import { normalizePage, normalizeHeroComponent, normalizeTextBlockComponent, normalizeImageGalleryComponent, normalizeFeatureGridComponent } from '../normalizers';
import { Page, StrapiRawPage, HeroComponent, TextBlockComponent, ImageGalleryComponent, FeatureGridComponent } from '../types';

describe('Page Component Normalizers', () => {
  describe('normalizeHeroComponent', () => {
    it('should normalize a complete hero component', () => {
      const input = {
        id: 'hero1',
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero',
        subtitle: 'Subtitle text',
        ctaButton: {
          text: 'Learn More',
          link: '/about',
          style: 'primary' as const
        }
      };

      const result = normalizeHeroComponent(input);

      expect(result).toEqual({
        id: 'hero1',
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero',
        subtitle: 'Subtitle text',
        backgroundImage: undefined,
        ctaButton: {
          text: 'Learn More',
          link: '/about',
          style: 'primary'
        }
      });
    });

    it('should handle minimal hero component', () => {
      const input = {
        id: 'hero1',
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero'
      };

      const result = normalizeHeroComponent(input);

      expect(result).toEqual({
        id: 'hero1',
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero',
        subtitle: undefined,
        backgroundImage: undefined,
        ctaButton: undefined
      });
    });
  });

  describe('normalizeTextBlockComponent', () => {
    it('should normalize a text block component', () => {
      const input = {
        id: 'text1',
        __component: 'page-blocks.text-block' as const,
        content: 'Sample content with\\nline breaks',
        alignment: 'center' as const
      };

      const result = normalizeTextBlockComponent(input);

      expect(result).toEqual({
        id: 'text1',
        __component: 'page-blocks.text-block' as const,
        content: 'Sample content with\nline breaks',
        alignment: 'center'
      });
    });

    it('should handle escaped characters in content', () => {
      const input = {
        id: 'text1',
        __component: 'page-blocks.text-block' as const,
        content: 'Line 1\\nLine 2\\nLine \\"quoted\\" text',
        alignment: 'left' as const
      };

      const result = normalizeTextBlockComponent(input);

      expect(result.content).toBe('Line 1\nLine 2\nLine "quoted" text');
    });
  });

  describe('normalizeImageGalleryComponent', () => {
    it('should normalize an image gallery component', () => {
      const input = {
        id: 'gallery1',
        __component: 'page-blocks.gallery' as const,
        images: {
          data: [
            {
              id: 'img1',
              attributes: {
                url: 'https://example.com/image1.jpg',
                width: 800,
                height: 600
              }
            }
          ]
        },
        layout: 'grid' as const
      };

      const result = normalizeImageGalleryComponent(input);

      expect(result).toEqual({
        id: 'gallery1',
        __component: 'page-blocks.gallery' as const,
        images: [
          {
            id: 'img1',
            url: 'https://example.com/image1.jpg',
            width: 800,
            height: 600,
            formats: {},
            hash: 'image1',
            ext: '.jpg',
            mime: 'image/jpg',
            size: 0,
            name: 'image1.jpg',
            provider: 'strapi',
            provider_metadata: undefined,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            publishedAt: expect.any(String)
          }
        ],
        layout: 'grid'
      });
    });

    it('should handle empty image gallery', () => {
      const input = {
        id: 'gallery1',
        __component: 'page-blocks.gallery' as const,
        images: { data: [] },
        layout: 'grid' as const
      };

      const result = normalizeImageGalleryComponent(input);

      expect(result.images).toEqual([]);
    });
  });

  describe('normalizeFeatureGridComponent', () => {
    it('should normalize a feature grid component', () => {
      const input = {
        id: 'features1',
        __component: 'page-blocks.feature-grid' as const,
        features: [
          {
            id: 'feature1',
            title: 'Feature 1',
            description: 'Description 1',
            link: '/feature-1'
          }
        ]
      };

      const result = normalizeFeatureGridComponent(input);

      expect(result).toEqual({
        id: 'features1',
        __component: 'page-blocks.feature-grid' as const,
        features: [
          {
            id: 'feature1',
            title: 'Feature 1',
            description: 'Description 1',
            link: '/feature-1',
            icon: undefined
          }
        ]
      });
    });

    it('should handle empty features array', () => {
      const input = {
        id: 'features1',
        __component: 'page-blocks.feature-grid' as const,
        features: []
      };

      const result = normalizeFeatureGridComponent(input);

      expect(result.features).toEqual([]);
    });
  });

  describe('normalizePage', () => {
    it('should normalize a complete page with mixed components', () => {
      const input: StrapiRawPage = {
        id: 'page1',
        attributes: {
          title: 'Test Page',
          slug: 'test-page',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          layout: [
            {
              id: 'hero1',
              __component: 'page-blocks.hero' as const,
              title: 'Welcome',
              subtitle: 'Subtitle'
            },
            {
              id: 'text1',
              __component: 'page-blocks.text-block' as const,
              content: 'Content block',
              alignment: 'left'
            }
          ],
          createdAt: '2024-01-26T20:30:00.000Z',
          updatedAt: '2024-01-26T20:30:00.000Z',
          publishedAt: '2024-01-26T20:30:00.000Z'
        }
      };

      const result = normalizePage(input);

      expect(result).toEqual({
        id: 'page1',
        title: 'Test Page',
        slug: 'test-page',
        seoMetadata: {
          metaTitle: '',
          metaDescription: '',
          keywords: ''
        },
        layout: [
          {
            id: 'hero1',
            __component: 'page-blocks.hero' as const,
            title: 'Welcome',
            subtitle: 'Subtitle',
            backgroundImage: undefined,
            ctaButton: undefined
          },
          {
            id: 'text1',
            __component: 'page-blocks.text-block' as const,
            content: 'Content block',
            alignment: 'left'
          }
        ],
        publishedAt: '2024-01-26T20:30:00.000Z',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      });
    });

    it('should handle page without layout components', () => {
      const input: StrapiRawPage = {
        id: 'page1',
        attributes: {
          title: 'Test Page',
          slug: 'test-page',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          createdAt: '2024-01-26T20:30:00.000Z',
          updatedAt: '2024-01-26T20:30:00.000Z',
          publishedAt: '2024-01-26T20:30:00.000Z'
        }
      };

      const result = normalizePage(input);

      expect(result.layout).toEqual([]);
    });

    it('should handle undefined optional fields', () => {
      const input: StrapiRawPage = {
        id: 'page1',
        attributes: {
          title: 'Test Page',
          slug: 'test-page',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          layout: undefined,
          createdAt: '2024-01-26T20:30:00.000Z',
          updatedAt: '2024-01-26T20:30:00.000Z',
          publishedAt: '2024-01-26T20:30:00.000Z'
        }
      };

      const result = normalizePage(input);

      expect(result.seoMetadata).toEqual({
        metaTitle: '',
        metaDescription: '',
        keywords: ''
      });
      expect(result.layout).toEqual([]);
    });
  });
});
