import React, { useState, useMemo } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils/cn';
import { transformImageUrl, isValidImageUrl } from '@/lib/utils/imageUrl';

// Strapi media format
interface StrapiMedia {
  data?: {
    id: number;
    attributes: {
      url: string;
      width: number;
      height: number;
      alternativeText?: string;
      caption?: string;
    };
  };
}

export interface OptimizedImageProps extends Omit<ImageProps, 'alt' | 'src'> {
  alt: string; // Make alt required
  src: string | StrapiMedia; // Support both direct URLs and Strapi media format
  wrapperClassName?: string;
  fallback?: string;
  caption?: string;
  decorative?: boolean;
  loadingText?: string;
  errorText?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  alt,
  src,
  className,
  wrapperClassName,
  fallback = '/placeholder-blog.jpg',
  caption: propCaption,
  decorative = false,
  loadingText = 'Image is loading',
  errorText = 'Failed to load image',
  onError,
  onLoadingComplete,
  width: propWidth,
  height: propHeight,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Process the src prop to handle both string URLs and Strapi media format
  const { imageUrl, width, height, caption } = useMemo(() => {
    if (typeof src === 'string') {
      return {
        imageUrl: transformImageUrl(src),
        width: propWidth,
        height: propHeight,
        caption: propCaption
      };
    }

    const mediaData = src.data?.attributes;
    return {
      imageUrl: transformImageUrl(mediaData?.url),
      width: propWidth || mediaData?.width,
      height: propHeight || mediaData?.height,
      caption: propCaption || mediaData?.caption
    };
  }, [src, propWidth, propHeight, propCaption]);

  // Validate the image URL
  const isValid = useMemo(() => isValidImageUrl(imageUrl), [imageUrl]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    const targetImage = e.target as HTMLImageElement;
    
    // If current source is already the fallback, don't try to change it again
    if (targetImage.src === fallback) {
      return;
    }

    // If we haven't tried the fallback yet and it's different from the current src
    if (fallback && targetImage.src !== fallback) {
      setCurrentSrc(fallback);
      targetImage.src = fallback;
    }

    // Call original onError if provided
    onError?.(e);
  };

  const handleLoadingComplete = (img: HTMLImageElement) => {
    setIsLoading(false);
    setHasError(false);
    onLoadingComplete?.(img);
  };

  const Wrapper = caption ? 'figure' : 'div';

  // If the URL is invalid and we have a fallback, use it
  const finalSrc = !isValid ? fallback : currentSrc || imageUrl;

  return (
    <Wrapper className={cn('relative overflow-hidden', wrapperClassName)}>
      {/* Loading indicator */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/10"
          role="status"
          aria-label={loadingText}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="sr-only">{loadingText}</span>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-destructive/10 text-destructive"
          role="alert"
        >
          <span className="sr-only">{errorText}</span>
        </div>
      )}

      <Image
        {...props}
        src={finalSrc}
        width={width}
        height={height}
        alt={decorative ? '' : alt}
        aria-hidden={decorative}
        onError={handleError}
        onLoadingComplete={handleLoadingComplete}
        sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
        quality={85}
        loading={props.priority ? 'eager' : 'lazy'}
        unoptimized={finalSrc.startsWith('data:') || finalSrc.startsWith('blob:')}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          hasError && 'opacity-50',
          className
        )}
      />

      {/* Image caption */}
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}

      {/* Status announcements for screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {isLoading ? loadingText : hasError ? errorText : `Image loaded: ${alt}`}
      </div>
    </Wrapper>
  );
};

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;