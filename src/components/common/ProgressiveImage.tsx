import React, { useEffect, useState } from 'react';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';
import NextImage from 'next/image';
import {
  calculateOptimalDimensions,
  generateSrcSet,
  generateSizes,
  getOptimalFormat,
  generateBlurPlaceholder
} from '@/lib/imageOptimization';

type NextImageProps = React.ComponentProps<typeof NextImage>;

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  breakpoints?: { minWidth: number; size: string }[];
}

const defaultBreakpoints = [
  { minWidth: 1536, size: '33vw' },  // 2xl
  { minWidth: 1280, size: '40vw' },  // xl
  { minWidth: 1024, size: '50vw' },  // lg
  { minWidth: 768, size: '75vw' },   // md
  { minWidth: 640, size: '100vw' }   // sm
];

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  breakpoints = defaultBreakpoints
}) => {
  const [format, setFormat] = useState<'avif' | 'webp' | 'jpeg'>('jpeg');
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState<string>('');
  
  // Determine optimal image format
  useEffect(() => {
    getOptimalFormat().then(setFormat);
  }, []);

  // Generate blur placeholder if not provided
  useEffect(() => {
    if (placeholder === 'blur' && !blurDataURL) {
      generateBlurPlaceholder(src).then(setGeneratedBlurDataURL);
    }
  }, [src, placeholder, blurDataURL]);

  // Calculate responsive widths for srcSet
  const widths = [width, width * 1.5, width * 2].map(Math.round);
  // Generate srcSet and sizes
  const srcSet = generateSrcSet(src, widths, { format, quality });
  const sizesAttr = sizes || generateSizes(breakpoints);

  // Load image with progressive enhancement
  const loadImage = async () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const img = document.createElement('img');
      img.src = src;
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const { ref, loading, error } = useProgressiveLoading(loadImage, {
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div 
      ref={ref}
      data-testid="image-container"
      className={`relative ${className}`}
      style={{ 
        width: width || '100%',
        height: height || 'auto',
      }}
    >
      {loading ? (
        <div 
          data-testid="loading-placeholder"
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ aspectRatio: width / height }}
        />
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      ) : (
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizesAttr}
          className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          placeholder={placeholder}
          blurDataURL={blurDataURL || generatedBlurDataURL || undefined}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
