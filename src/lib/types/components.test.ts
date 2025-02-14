import { normalizeHeroComponent, normalizeTextBlockComponent, normalizeImageGalleryComponent, normalizeFeatureGridComponent } from '../normalizers';
import { HeroComponent, TextBlockComponent, ImageGalleryComponent, FeatureGridComponent } from '../types';

describe('Component Normalizers', () => {
  const mockDate = '2024-01-26T20:30:00.000Z';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('normalizeHeroComponent', () => {
    it('should normalize a complete hero component', () => {
      const input = {
        id: 'hero1',
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero',
        subtitle: 'Subtitle text',
        backgroundImage: {
          data: {
            id: 'img1',
            attributes: {
              url: 'https://example.com/hero.jpg',
              width: 1920,
              height: 1080
            }
          }
        },
        ctaButton: {
          text: 'Learn More',
          link: '/about',
          style: 'primary' as const
        }
      };

      const result = normalizeHeroComponent(input);

      expect(result).toEqual({
        id: 'hero1',
        __component: 'page-blocks.hero',
        title: 'Welcome Hero',
        subtitle: 'Subtitle text',
        backgroundImage: {
          id: 'img1',
          url: 'https://example.com/hero.jpg',
          width: 1920,
          height: 1080,
          formats: {},
          hash: 'hero',
          ext: '.jpg',
          mime: 'image/jpg',
          size: 0,
          name: 'hero.jpg',
          provider: 'strapi',
          provider_metadata: undefined,
          createdAt: mockDate,
          updatedAt: mockDate,
          publishedAt: mockDate
        },
        ctaButton: {
          text: 'Learn More',
          link: '/about',
          style: 'primary'
        }
      });
    });

    it('should handle numeric id', () => {
      const input = {
        id: 123 as any,
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero'
      };

      const result = normalizeHeroComponent(input);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });

    it('should handle minimal required fields', () => {
      const input = {
        id: 'hero1',
        __component: 'page-blocks.hero' as const,
        title: 'Welcome Hero'
      };

      const result = normalizeHeroComponent(input);

      expect(result).toEqual({
        id: 'hero1',
        __component: 'page-blocks.hero',
        title: 'Welcome Hero',
        subtitle: undefined,
        backgroundImage: undefined,
        ctaButton: undefined
      });
    });
  });

  describe('normalizeTextBlockComponent', () => {
    it('should normalize a complete text block component', () => {
      const input = {
        id: 'text1',
        __component: 'page-blocks.text-block' as const,
        content: 'Sample content with\\nline breaks',
        alignment: 'center' as const
      };

      const result = normalizeTextBlockComponent(input);

      expect(result).toEqual({
        id: 'text1',
        __component: 'page-blocks.text-block',
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

    it('should handle numeric id', () => {
      const input = {
        id: 123 as any,
        __component: 'page-blocks.text-block' as const,
        content: 'Content',
        alignment: 'left' as const
      };

      const result = normalizeTextBlockComponent(input);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });
  });

  describe('normalizeImageGalleryComponent', () => {
    it('should normalize a complete image gallery component', () => {
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
        __component: 'page-blocks.gallery',
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
            createdAt: mockDate,
            updatedAt: mockDate,
            publishedAt: mockDate
          }
        ],
        layout: 'grid'
      });
    });

    it('should handle empty images array', () => {
      const input = {
        id: 'gallery1',
        __component: 'page-blocks.gallery' as const,
        images: { data: [] },
        layout: 'grid' as const
      };

      const result = normalizeImageGalleryComponent(input);

      expect(result.images).toEqual([]);
    });

    it('should handle numeric id', () => {
      const input = {
        id: 123 as any,
        __component: 'page-blocks.gallery' as const,
        images: { data: [] },
        layout: 'grid' as const
      };

      const result = normalizeImageGalleryComponent(input);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });
  });

  describe('normalizeFeatureGridComponent', () => {
    it('should normalize a complete feature grid component', () => {
      const input = {
        id: 'features1',
        __component: 'page-blocks.feature-grid' as const,
        features: [
          {
            id: 'feature1',
            title: 'Feature 1',
            description: 'Description 1',
            icon: {
              data: {
                id: 'icon1',
                attributes: {
                  url: 'https://example.com/icon1.png',
                  width: 24,
                  height: 24
                }
              }
            },
            link: '/feature-1'
          }
        ]
      };

      const result = normalizeFeatureGridComponent(input);

      expect(result).toEqual({
        id: 'features1',
        __component: 'page-blocks.feature-grid',
        features: [
          {
            id: 'feature1',
            title: 'Feature 1',
            description: 'Description 1',
            icon: {
              id: 'icon1',
              url: 'https://example.com/icon1.png',
              width: 24,
              height: 24,
              formats: {},
              hash: 'icon1',
              ext: '.png',
              mime: 'image/png',
              size: 0,
              name: 'icon1.png',
              provider: 'strapi',
              provider_metadata: undefined,
              createdAt: mockDate,
              updatedAt: mockDate,
              publishedAt: mockDate
            },
            link: '/feature-1'
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

    it('should handle numeric id', () => {
      const input = {
        id: 123 as any,
        __component: 'page-blocks.feature-grid' as const,
        features: []
      };

      const result = normalizeFeatureGridComponent(input);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });

    it('should handle features without icons', () => {
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

      expect(result.features[0].icon).toBeUndefined();
    });
  });
});
