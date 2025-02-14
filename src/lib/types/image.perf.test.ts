import { normalizeImage, normalizeImageFormat } from './image';

describe('Image Normalization Performance', () => {
  // Helper to generate large image data
  const generateLargeImageData = (size: number) => {
    const formats: Record<string, {
      url: string;
      width: number;
      height: number;
      ext?: string;
      hash?: string;
      mime?: string;
      name?: string;
      path?: string | null;
      size?: number;
      sizeInBytes?: number;
    }> = {};
    for (let i = 0; i < size; i++) {
      formats[`format${i}`] = {
        url: `https://example.com/image${i}.jpg`,
        width: 800,
        height: 600,
        ext: '.jpg',
        hash: `hash${i}`,
        mime: 'image/jpeg',
        name: `test-image${i}.jpg`,
        path: `/uploads/test-image${i}.jpg`,
        size: 1024,
        sizeInBytes: 1024000
      };
    }
    return {
      id: 'test-image',
      documentId: 'doc123',
      attributes: {
        name: 'test-image.jpg',
        alternativeText: 'Test image',
        caption: 'A test image',
        width: 800,
        height: 600,
        formats,
        url: 'https://example.com/original.jpg',
        previewUrl: 'https://example.com/preview.jpg',
        provider: 'local'
      }
    };
  };

  // Helper to measure execution time
  const measureExecutionTime = (fn: () => void): number => {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000; // Convert to milliseconds
  };

  describe('normalizeImage Performance', () => {
    it('should handle small images quickly (< 50ms)', () => {
      const input = generateLargeImageData(1);
      const executionTime = measureExecutionTime(() => {
        normalizeImage(input);
      });
      
      expect(executionTime).toBeLessThan(50);
    });

    it('should handle medium-sized image data efficiently (< 100ms)', () => {
      const input = generateLargeImageData(10);
      const executionTime = measureExecutionTime(() => {
        normalizeImage(input);
      });
      
      expect(executionTime).toBeLessThan(100);
    });

    it('should handle large image data sets (< 200ms)', () => {
      const input = generateLargeImageData(50);
      const executionTime = measureExecutionTime(() => {
        normalizeImage(input);
      });
      
      expect(executionTime).toBeLessThan(200);
    });

    it('should maintain performance with nested formats (< 150ms)', () => {
      const input = {
        id: 'test-image',
        documentId: 'doc123',
        attributes: {
          name: 'test-image.jpg',
          width: 800,
          height: 600,
          formats: {
            small: {
              url: 'https://example.com/small.jpg',
              width: 400,
              height: 300,
              ext: '.jpg',
              hash: 'small',
              mime: 'image/jpeg',
              name: 'small.jpg',
              path: '/uploads/small.jpg',
              size: 1024,
              sizeInBytes: 1024000
            },
            thumbnail: {
              url: 'https://example.com/thumbnail.jpg',
              width: 200,
              height: 150,
              ext: '.jpg',
              hash: 'thumbnail',
              mime: 'image/jpeg',
              name: 'thumbnail.jpg',
              path: '/uploads/thumbnail.jpg',
              size: 512,
              sizeInBytes: 512000
            }
          },
          url: 'https://example.com/original.jpg'
        }
      };

      const executionTime = measureExecutionTime(() => {
        normalizeImage(input);
      });
      
      expect(executionTime).toBeLessThan(150);
    });
  });

  describe('normalizeImageFormat Memory Usage', () => {
    it('should not cause memory issues with large format sets', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const largeInput = generateLargeImageData(100);
      
      normalizeImage(largeInput);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Memory increase should be reasonable (< 10MB)
      expect(memoryIncrease).toBeLessThan(10);
    });
  });

  describe('Batch Processing Performance', () => {
    it('should handle batch processing efficiently', () => {
      const batchSize = 50;
      const images = Array.from({ length: batchSize }, (_, i) => ({
        id: `img${i}`,
        url: `https://example.com/image${i}.jpg`,
        width: 800,
        height: 600
      }));

      const executionTime = measureExecutionTime(() => {
        images.forEach(img => normalizeImageFormat(img));
      });

      // Average time per image should be reasonable (< 2ms)
      const averageTimePerImage = executionTime / batchSize;
      expect(averageTimePerImage).toBeLessThan(2);
    });
  });

  describe('URL Processing Performance', () => {
    it('should handle complex URLs efficiently', () => {
      const input = {
        id: 'test-image',
        url: 'https://example.com/path/to/image/with/many/segments/and/a/very/long/filename/with/special/characters/test-image-123_456-789.high-resolution.original.jpg?version=2&size=large&quality=high&timestamp=123456789',
        width: 800,
        height: 600
      };

      const executionTime = measureExecutionTime(() => {
        normalizeImageFormat(input);
      });

      // URL processing should be fast (< 5ms)
      expect(executionTime).toBeLessThan(5);
    });

    it('should handle multiple URL formats efficiently in batch', () => {
      const urls = [
        'https://example.com/image.jpg',
        'https://example.com/image.jpg?v=123',
        'https://example.com/image.jpg#fragment',
        'https://example.com/image.jpg?v=123#fragment',
        'https://example.com/path/to/image/test.high-resolution.jpg',
        'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        '/absolute/path/to/image.jpg',
        'relative/path/to/image.jpg'
      ].map(url => ({
        id: 'test',
        url,
        width: 800,
        height: 600
      }));

      const executionTime = measureExecutionTime(() => {
        urls.forEach(img => normalizeImageFormat(img));
      });

      // Average time per URL should be fast (< 1ms)
      const averageTimePerUrl = executionTime / urls.length;
      expect(averageTimePerUrl).toBeLessThan(1);
    });
  });
});
