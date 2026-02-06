import * as imageOptimization from '../imageOptimization';

const {
  calculateOptimalDimensions,
  generateSrcSet,
  generateSizes,
  supportsWebP,
  supportsAVIF,
  getOptimalFormat,
  generateBlurPlaceholder,
} = imageOptimization;

function mockImageElement(success: boolean): HTMLImageElement {
  const img: Partial<HTMLImageElement> = {
    onload: null,
    onerror: null,
  };

  Object.defineProperty(img, 'src', {
    set: () => {
      setTimeout(() => {
        if (success) {
          img.onload?.call(img as HTMLImageElement, new Event('load'));
        } else {
          img.onerror?.call(img as HTMLImageElement, new Event('error'));
        }
      }, 0);
    },
  });

  return img as HTMLImageElement;
}

describe('imageOptimization', () => {
  describe('calculateOptimalDimensions', () => {
    it('maintains aspect ratio while fitting container', () => {
      const original = { width: 1000, height: 500 };
      const container = { width: 800, height: 600 };

      const result = calculateOptimalDimensions(original, container);

      expect(result.width).toBe(800);
      expect(result.height).toBe(400);
    });

    it('accounts for device pixel ratio', () => {
      const original = { width: 1000, height: 500 };
      const container = { width: 800, height: 600 };

      const result = calculateOptimalDimensions(original, container, 2);

      expect(result.width).toBe(1600);
      expect(result.height).toBe(800);
    });
  });

  describe('generateSrcSet', () => {
    it('generates a valid srcSet string', () => {
      const src = 'https://example.com/image.jpg';
      const widths = [300, 600, 900];

      const result = generateSrcSet(src, widths);

      expect(result).toBe(
        'https://example.com/image.jpg?w=300&q=75&fm=webp 300w, ' +
          'https://example.com/image.jpg?w=600&q=75&fm=webp 600w, ' +
          'https://example.com/image.jpg?w=900&q=75&fm=webp 900w'
      );
    });

    it('respects custom quality and format', () => {
      const src = 'https://example.com/image.jpg';
      const widths = [300];

      const result = generateSrcSet(src, widths, { quality: 90, format: 'jpeg' });

      expect(result).toBe('https://example.com/image.jpg?w=300&q=90&fm=jpeg 300w');
    });
  });

  describe('generateSizes', () => {
    it('generates a correct sizes string', () => {
      const breakpoints = [
        { minWidth: 768, size: '50vw' },
        { minWidth: 1024, size: '33vw' },
      ];

      const result = generateSizes(breakpoints);
      expect(result).toBe('(min-width: 768px) 50vw, (min-width: 1024px) 33vw, 100vw');
    });
  });

  describe('format support detection', () => {
    const originalCreateElement = document.createElement.bind(document);

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('detects WebP support', async () => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) =>
          tagName === 'img' ? mockImageElement(true) : originalCreateElement(tagName as keyof HTMLElementTagNameMap)
        );

      await expect(supportsWebP()).resolves.toBe(true);
    });

    it('detects lack of WebP support', async () => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) =>
          tagName === 'img' ? mockImageElement(false) : originalCreateElement(tagName as keyof HTMLElementTagNameMap)
        );

      await expect(supportsWebP()).resolves.toBe(false);
    });

    it('detects AVIF support', async () => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) =>
          tagName === 'img' ? mockImageElement(true) : originalCreateElement(tagName as keyof HTMLElementTagNameMap)
        );

      await expect(supportsAVIF()).resolves.toBe(true);
    });

    it('detects lack of AVIF support', async () => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) =>
          tagName === 'img' ? mockImageElement(false) : originalCreateElement(tagName as keyof HTMLElementTagNameMap)
        );

      await expect(supportsAVIF()).resolves.toBe(false);
    });
  });

  describe('getOptimalFormat', () => {
    const originalCreateElement = document.createElement.bind(document);

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('prefers AVIF when supported', async () => {
      let call = 0;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'img') {
          call += 1;
          // Eerste check is AVIF -> success.
          return mockImageElement(true);
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      });

      await expect(getOptimalFormat()).resolves.toBe('avif');
      expect(call).toBe(1);
    });

    it('falls back to WebP when AVIF is not supported', async () => {
      let call = 0;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'img') {
          call += 1;
          // 1e call = AVIF (false), 2e call = WebP (true).
          return mockImageElement(call === 2);
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      });

      await expect(getOptimalFormat()).resolves.toBe('webp');
      expect(call).toBe(2);
    });

    it('falls back to JPEG when no modern format is supported', async () => {
      let call = 0;
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'img') {
          call += 1;
          return mockImageElement(false);
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      });

      await expect(getOptimalFormat()).resolves.toBe('jpeg');
      expect(call).toBe(2);
    });
  });

  describe('generateBlurPlaceholder', () => {
    const originalCreateElement = document.createElement.bind(document);

    afterEach(() => {
      jest.restoreAllMocks();
    });

    function createLoadableImage() {
      const img: Partial<HTMLImageElement> = {
        width: 200,
        height: 100,
        onload: null,
        onerror: null,
      };

      Object.defineProperty(img, 'src', {
        set: () => {
          setTimeout(() => img.onload?.call(img as HTMLImageElement, new Event('load')), 0);
        },
      });

      return img as HTMLImageElement;
    }

    it('generates a blur placeholder data URL', async () => {
      const canvas = originalCreateElement('canvas');
      const ctx = { drawImage: jest.fn() };
      jest.spyOn(canvas, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
      jest.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/jpeg;base64,test');

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'img') return createLoadableImage();
        if (tagName === 'canvas') return canvas;
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      });

      await expect(generateBlurPlaceholder('test-image.jpg')).resolves.toBe(
        'data:image/jpeg;base64,test'
      );
    });

    it('returns empty string when canvas context is unavailable', async () => {
      const canvas = originalCreateElement('canvas');
      jest.spyOn(canvas, 'getContext').mockReturnValue(null);

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'img') return createLoadableImage();
        if (tagName === 'canvas') return canvas;
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      });

      await expect(generateBlurPlaceholder('test-image.jpg')).resolves.toBe('');
    });
  });
});
