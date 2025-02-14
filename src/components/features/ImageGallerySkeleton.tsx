import React from 'react';
import { cn } from '@/lib/utils';
import { ImageGalleryComponent } from '@/lib/types';

interface ImageGallerySkeletonProps {
  className?: string;
  layout?: ImageGalleryComponent['layout'];
  imageCount?: number;
}

export function ImageGallerySkeleton({ 
  className,
  layout = 'grid',
  imageCount = 6 
}: ImageGallerySkeletonProps) {
  const renderGrid = () => (
    <div className={cn(
      'grid gap-4',
      imageCount <= 2 ? 'grid-cols-1 md:grid-cols-2' :
      imageCount <= 4 ? 'grid-cols-2 md:grid-cols-2' :
      'grid-cols-2 md:grid-cols-3'
    )}>
      {[...Array(imageCount)].map((_, index) => (
        <div
          key={index}
          className="relative aspect-square overflow-hidden rounded-lg bg-gray-200"
        />
      ))}
    </div>
  );

  const renderCarousel = () => (
    <div className="relative w-full">
      <div className="h-[300px] w-full rounded-lg bg-gray-200 md:h-[400px]" />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {[...Array(imageCount)].map((_, index) => (
          <div
            key={index}
            className="h-2 w-2 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </div>
  );

  const renderMasonry = () => (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
      {[...Array(imageCount)].map((_, index) => (
        <div
          key={index}
          className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-200"
        />
      ))}
    </div>
  );

  return (
    <div className={cn('w-full animate-pulse', className)}>
      {layout === 'grid' && renderGrid()}
      {layout === 'carousel' && renderCarousel()}
      {layout === 'masonry' && renderMasonry()}
    </div>
  );
}
