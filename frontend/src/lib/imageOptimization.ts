interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  maxWidth?: number;
  devicePixelRatio?: number;
}

/**
 * Calculate optimal image dimensions based on container size and device pixel ratio
 */
export const calculateOptimalDimensions = (
  originalDimensions: ImageDimensions,
  containerDimensions: ImageDimensions,
  devicePixelRatio: number = typeof window !== 'undefined' ? window.devicePixelRatio : 1
): ImageDimensions => {
  const aspectRatio = originalDimensions.width / originalDimensions.height;
  
  // Calculate dimensions that maintain aspect ratio and fit container
  let width = containerDimensions.width;
  let height = width / aspectRatio;

  if (height > containerDimensions.height) {
    height = containerDimensions.height;
    width = height * aspectRatio;
  }

  // Account for device pixel ratio
  width = Math.round(width * devicePixelRatio);
  height = Math.round(height * devicePixelRatio);

  return { width, height };
};

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (
  src: string,
  widths: number[],
  options: ImageOptimizationOptions = {}
): string => {
  const {
    quality = 75,
    format = 'webp'
  } = options;

  return widths
    .map(width => {
      const url = new URL(src);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', format);
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (
  breakpoints: { minWidth: number; size: string }[]
): string => {
  return breakpoints
    .map(({ minWidth, size }) => `(min-width: ${minWidth}px) ${size}`)
    .concat(['100vw'])
    .join(', ');
};

/**
 * Check if WebP format is supported
 */
export const supportsWebP = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const img = document.createElement('img');
  return new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
};

/**
 * Check if AVIF format is supported
 */
export const supportsAVIF = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const img = document.createElement('img');
  return new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = async (): Promise<'avif' | 'webp' | 'jpeg'> => {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
};

/**
 * Generate blur placeholder data URL
 */
export const generateBlurPlaceholder = async (
  src: string,
  width: number = 10
): Promise<string> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  const img = document.createElement('img');
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Create tiny placeholder
  canvas.width = width;
  canvas.height = Math.round((width * img.height) / img.width);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.1);
};
