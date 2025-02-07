import {
  calculateOptimalDimensions,
  generateSrcSet,
  generateSizes,
  supportsWebP,
  supportsAVIF,
  getOptimalFormat,
  generateBlurPlaceholder
} from '../imageOptimization';

describe('imageOptimization', () => {
  describe('calculateOptimalDimensions', () => {
    it('should maintain aspect ratio while fitting container', () => {
      const original = { width: 1000, height: 500 };
      const container = { width: 800, height: 600 };
      
      const result = calculateOptimalDimensions(original, container);
      
      expect(result.width).toBe(800);
      expect(result.height).toBe(400);
    });

    it('should account for device pixel ratio', () => {
      const original = { width: 1000, height: 500 };
      const container = { width: 800, height: 600 };
      const dpr = 2;
      
      const result = calculateOptimalDimensions(original, container, dpr);
      
      expect(result.width).toBe(1600);
      expect(result.height).toBe(800);
    });
  });

  describe('generateSrcSet', () => {
    it('should generate correct srcSet string', () => {
      const src = 'https://example.com/image.jpg';
      const widths = [300, 600, 900];
      
      const result = generateSrcSet(src, widths);
      
      expect(result).toBe(
        'https://example.com/image.jpg?w=300&q=75&fm=webp 300w, ' +
        'https://example.com/image.jpg?w=600&q=75&fm=webp 600w, ' +
        'https://example.com/image.jpg?w=900&q=75&fm=webp 900w'
      );
    });

    it('should respect quality and format options', () => {
      const src = 'https://example.com/image.jpg';
      const widths = [300];
      const options = { quality: 90, format: 'jpeg' as const };
      
      const result = generateSrcSet(src, widths, options);
      
      expect(result).toBe(
        'https://example.com/image.jpg?w=300&q=90&fm=jpeg 300w'
      );
    });
  });

  describe('generateSizes', () => {
    it('should generate correct sizes string', () => {
      const breakpoints = [
        { minWidth: 768, size: '50vw' },
        { minWidth: 1024, size: '33vw' }
      ];
      
      const result = generateSizes(breakpoints);
      
      expect(result).toBe(
        '(min-width: 768px) 50vw, (min-width: 1024px) 33vw, 100vw'
      );
    });
  });

  describe('format support detection', () => {
    beforeEach(() => {
      // Mock window and document
      if (typeof window === 'undefined') {
        (global as any).window = {};
      }
      if (typeof document === 'undefined') {
        (global as any).document = {
          createElement: (tagName: string) => {
            const element = {
              tagName: tagName.toUpperCase(),
              onload: null,
              onerror: null,
              src: '',
              width: 0,
              height: 0,
              getContext: () => null,
              toDataURL: () => '',
            };
            return element as unknown as HTMLElement;
          }
        };
      }
    });

    afterEach(() => {
      // Clean up mocks
      jest.restoreAllMocks();
      if ((global as any).window) delete (global as any).window;
      if ((global as any).document) delete (global as any).document;
    });

    describe('supportsWebP', () => {
      it('should detect WebP support', async () => {
        // Mock successful image load
        const mockImg = document.createElement('img') as HTMLImageElement;
        jest.spyOn(document, 'createElement').mockReturnValue(mockImg);
        setTimeout(() => mockImg.onload?.(new Event('load')), 0);

        const result = await supportsWebP();
        expect(result).toBe(true);
      });

      it('should detect lack of WebP support', async () => {
        // Mock failed image load
        const mockImg = document.createElement('img') as HTMLImageElement;
        jest.spyOn(document, 'createElement').mockReturnValue(mockImg);
        setTimeout(() => mockImg.onerror?.(new Event('error')), 0);

        const result = await supportsWebP();
        expect(result).toBe(false);
      });
    });

    describe('supportsAVIF', () => {
      it('should detect AVIF support', async () => {
        // Mock successful image load
        (global as any).Image = class {
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          src: string = '';
          constructor() {
            setTimeout(() => this.onload?.(), 0);
          }
        };

        const result = await supportsAVIF();
        expect(result).toBe(true);
      });

      it('should detect lack of AVIF support', async () => {
        // Mock failed image load
        (global as any).Image = class {
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          src: string = '';
          constructor() {
            setTimeout(() => this.onerror?.(), 0);
          }
        };

        const result = await supportsAVIF();
        expect(result).toBe(false);
      });
    });
  });

  describe('getOptimalFormat', () => {
    it('should prefer AVIF when supported', async () => {
      // Mock AVIF and WebP support
      jest.spyOn(global as any, 'supportsAVIF').mockResolvedValue(true);
      jest.spyOn(global as any, 'supportsWebP').mockResolvedValue(true);

      const result = await getOptimalFormat();
      expect(result).toBe('avif');
    });

    it('should fall back to WebP when AVIF not supported', async () => {
      // Mock only WebP support
      jest.spyOn(global as any, 'supportsAVIF').mockResolvedValue(false);
      jest.spyOn(global as any, 'supportsWebP').mockResolvedValue(true);

      const result = await getOptimalFormat();
      expect(result).toBe('webp');
    });

    it('should fall back to JPEG when neither AVIF nor WebP supported', async () => {
      // Mock no modern format support
      jest.spyOn(global as any, 'supportsAVIF').mockResolvedValue(false);
      jest.spyOn(global as any, 'supportsWebP').mockResolvedValue(false);

      const result = await getOptimalFormat();
      expect(result).toBe('jpeg');
    });
  });

  describe('generateBlurPlaceholder', () => {
    beforeEach(() => {
      // Mock window and document
      if (typeof window === 'undefined') {
        (global as any).window = {};
      }

      // Mock document and elements
      const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
      const mockContext = {
        drawImage: jest.fn()
      };
      mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);
      mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,test');
      
      const mockImg = document.createElement('img') as HTMLImageElement;
      Object.defineProperties(mockImg, {
        height: { value: 100 },
        width: { value: 200 }
      });

      jest.spyOn(document, 'createElement').mockImplementation((type: string) => {
        if (type === 'canvas') return mockCanvas;
        if (type === 'img') return mockImg;
        return document.createElement(type);
      });
    });

    afterEach(() => {
      // Clean up mocks
      jest.restoreAllMocks();
      if ((global as any).window) delete (global as any).window;
      if ((global as any).document) delete (global as any).document;
    });

    it('should generate blur placeholder', async () => {
      const src = 'test-image.jpg';
      const result = await generateBlurPlaceholder(src);
      expect(result).toBe('data:image/jpeg;base64,test');
    });

    it('should handle errors gracefully', async () => {
      const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
      mockCanvas.getContext = jest.fn().mockReturnValue(null);
      jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas);

      const src = 'test-image.jpg';
      const result = await generateBlurPlaceholder(src);
      expect(result).toBe('');
    });
  });
});
