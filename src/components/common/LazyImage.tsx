'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes = '100vw',
  quality = 75,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Memoize observer options
  const observerOptions = useMemo(() => ({
    rootMargin: '50px',
    threshold: 0.1
  }), []);

  // Memoize wrapper ID
  const wrapperId = useMemo(() => `image-wrapper-${src.split('/').pop()?.split('.')[0] || src}`, [src]);

  // Memoize intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    });
  }, []);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const element = document.getElementById(wrapperId);

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, wrapperId, handleIntersection, observerOptions]);

  // Memoize image loading handler
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Memoize error handler
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image: ${src}`);
    setHasError(true);
    onError?.(event);
  }, [src, onError]);

  // Memoize class names
  const imageClass = useMemo(() => `
    transition-opacity duration-300
    ${isLoading ? 'opacity-0' : 'opacity-100'}
    ${className}
  `.trim(), [isLoading, className]);

  const wrapperClass = useMemo(() => `
    relative
    ${fill ? 'h-full w-full' : ''}
  `.trim(), [fill]);

  const placeholderClass = useMemo(() => `
    absolute inset-0 
    bg-gray-200 animate-pulse 
    rounded-md
    ${fill ? 'h-full w-full' : ''}
  `.trim(), [fill]);

  // Memoize image props
  const imageProps = useMemo(() => ({
    src,
    alt,
    width,
    height,
    fill,
    priority,
    className: imageClass,
    sizes,
    quality,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
  }), [src, alt, width, height, fill, priority, imageClass, sizes, quality]);

  return (
    <div
      id={wrapperId}
      data-testid={wrapperId}
      className={wrapperClass}
    >
      {hasError ? (
        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
          Kon de afbeelding niet laden
        </div>
      ) : (
        <>
          {(isInView || priority) && (
            <Image
              {...imageProps}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
          {isLoading && (
            <div className={placeholderClass} />
          )}
        </>
      )}
    </div>
  );
}
