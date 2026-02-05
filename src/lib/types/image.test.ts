import { normalizeImage, normalizeImageFormat } from './image';

describe('normalizeImageFormat', () => {
  it('should normalize a complete image format', () => {
    const input = {
      url: 'https://example.com/image.jpg',
      width: 800,
      height: 600,
      ext: '.jpg',
      hash: 'hash123',
      mime: 'image/jpeg',
      name: 'test-image.jpg',
      path: '/uploads/test-image.jpg',
      size: 1024,
      sizeInBytes: 1024000
    };

    const result = normalizeImageFormat(input);

    expect(result).toEqual({
      url: 'https://example.com/image.jpg',
      width: 800,
      height: 600,
      ext: '.jpg',
      hash: 'hash123',
      mime: 'image/jpeg',
      name: 'test-image.jpg',
      path: '/uploads/test-image.jpg',
      size: 1024,
      sizeInBytes: 1024000
    });
  });

  it('should handle minimal required fields and derive optional values', () => {
    const input = {
      url: 'https://example.com/image.jpg',
      width: 800,
      height: 600
    };

    const result = normalizeImageFormat(input);

    expect(result).toEqual({
      url: 'https://example.com/image.jpg',
      width: 800,
      height: 600,
      ext: '.jpg',
      hash: 'image',
      mime: 'image/jpg',
      name: 'image.jpg',
      path: undefined,
      size: 0,
      sizeInBytes: 0
    });
  });
});

describe('normalizeImage', () => {
  const mockDate = '2024-01-26T20:26:47.000Z';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ID type handling', () => {
    it('should convert numeric id to string', () => {
      const input = {
        id: 123,
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600
      };

      const result = normalizeImage(input as any);
      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });

    it('should convert numeric documentId to string', () => {
      const input = {
        id: 'img123',
        documentId: 456,
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600
      };

      const result = normalizeImage(input as any);
      expect(typeof result.documentId).toBe('string');
      expect(result.documentId).toBe('456');
    });

    it('should handle undefined documentId', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600
      };

      const result = normalizeImage(input);
      expect(result.documentId).toBeUndefined();
    });
  });

  it('should normalize a nested image structure', () => {
    const input = {
      id: 'img123',
      documentId: 'doc123',
      attributes: {
        name: 'test-image.jpg',
        alternativeText: 'Test image',
        caption: 'A test image',
        width: 800,
        height: 600,
        formats: {
          small: {
            url: 'https://example.com/small.jpg',
            width: 400,
            height: 300
          },
          thumbnail: {
            url: 'https://example.com/thumb.jpg',
            width: 200,
            height: 150
          }
        },
        url: 'https://example.com/original.jpg',
        previewUrl: 'https://example.com/preview.jpg',
        provider: 'local'
      }
    };

    const result = normalizeImage(input);

    expect(result).toEqual({
      id: 'img123',
      documentId: 'doc123',
      name: 'test-image.jpg',
      alternativeText: 'Test image',
      caption: 'A test image',
      width: 800,
      height: 600,
      formats: {
        small: {
          url: 'https://example.com/small.jpg',
          width: 400,
          height: 300,
          ext: '.jpg',
          hash: 'small',
          mime: 'image/jpg',
          name: 'small.jpg',
          path: undefined,
          size: 0,
          sizeInBytes: 0
        },
        thumbnail: {
          url: 'https://example.com/thumb.jpg',
          width: 200,
          height: 150,
          ext: '.jpg',
          hash: 'thumb',
          mime: 'image/jpg',
          name: 'thumb.jpg',
          path: undefined,
          size: 0,
          sizeInBytes: 0
        }
      },
      hash: 'original',
      ext: '.jpg',
      mime: 'image/jpg',
      size: 0,
      url: 'https://example.com/original.jpg',
      previewUrl: 'https://example.com/preview.jpg',
      provider: 'local',
      provider_metadata: undefined,
      createdAt: mockDate,
      updatedAt: mockDate,
      publishedAt: mockDate
    });
  });

  it('should normalize a flat image structure', () => {
    const input = {
      id: 'img123',
      name: 'test-image.jpg',
      width: 800,
      height: 600,
      url: 'https://example.com/original.jpg'
    };

    const result = normalizeImage(input);

    expect(result).toEqual({
      id: 'img123',
      documentId: undefined,
      name: 'test-image.jpg',
      alternativeText: undefined,
      caption: undefined,
      width: 800,
      height: 600,
      formats: {},
      hash: 'original',
      ext: '.jpg',
      mime: 'image/jpg',
      size: 0,
      url: 'https://example.com/original.jpg',
      previewUrl: undefined,
      provider: 'strapi',
      provider_metadata: undefined,
      createdAt: mockDate,
      updatedAt: mockDate,
      publishedAt: mockDate
    });
  });

  it('should handle undefined optional fields correctly', () => {
    const input = {
      id: 'img123',
      url: 'https://example.com/original.jpg',
      width: 800,
      height: 600,
      alternativeText: undefined,
      caption: undefined,
      previewUrl: undefined
    };

    const result = normalizeImage(input);

    expect(result.alternativeText).toBeUndefined();
    expect(result.caption).toBeUndefined();
    expect(result.previewUrl).toBeUndefined();
  });

  describe('edge cases', () => {
    it('should handle empty formats object', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600,
        formats: {}
      };

      const result = normalizeImage(input);
      expect(result.formats).toEqual({});
    });

    it('should handle missing formats property', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600
      };

      const result = normalizeImage(input);
      expect(result.formats).toEqual({});
    });

    it('should handle partial format data', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600,
        formats: {
          small: {
            url: 'https://example.com/small.jpg',
            width: 400,
            height: 300
          }
        }
      };

      const result = normalizeImage(input);
      expect(result.formats?.small).toBeDefined();
      expect(result.formats?.thumbnail).toBeUndefined();
    });

    it('should handle invalid format data', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/original.jpg',
        width: 800,
        height: 600,
        formats: {
          small: undefined,
          thumbnail: undefined
        }
      };

      const result = normalizeImage(input as any);
      expect(result.formats?.small).toBeUndefined();
      expect(result.formats?.thumbnail).toBeUndefined();
    });

    it('should handle URLs without file extensions', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/image',
        width: 800,
        height: 600
      };

      const result = normalizeImage(input);
      expect(result.ext).toBe('.');
      expect(result.mime).toBe('image/');
      expect(result.name).toBe('image');
    });

    it('should handle URLs with query parameters', () => {
      const input = {
        id: 'img123',
        url: 'https://example.com/image.jpg?version=1&size=large',
        width: 800,
        height: 600
      };

      const result = normalizeImage(input);
      expect(result.ext).toBe('.jpg');
      expect(result.mime).toBe('image/jpg');
      expect(result.name).toBe('image.jpg');
    });
  });
});
