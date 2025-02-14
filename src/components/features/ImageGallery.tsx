import React, { useState } from 'react';
import Image from 'next/image';
import { ImageGalleryComponent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  data: ImageGalleryComponent;
  className?: string;
}

export function ImageGallery({ data, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Grid layout styles based on the number of images
  const gridCols = data.images.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
    data.images.length <= 4 ? 'grid-cols-2 md:grid-cols-2' :
    'grid-cols-2 md:grid-cols-3';

  const renderGrid = () => (
    <div className={cn('grid gap-4', gridCols)}>
      {data.images.map((image, index) => (
        <div 
          key={`${image.data.id}-${index}`}
          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
          onClick={() => setSelectedImage(index)}
        >
          <Image
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText || ''}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      ))}
    </div>
  );

  const renderCarousel = () => (
    <div className="relative w-full">
      <div className="flex snap-x snap-mandatory overflow-x-auto">
        {data.images.map((image, index) => (
          <div 
            key={`${image.data.id}-${index}`}
            className="relative h-[300px] w-full flex-none snap-center md:h-[400px]"
          >
            <Image
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText || ''}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {data.images.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 w-2 rounded-full bg-white/50 transition-colors',
              selectedImage === index && 'bg-white'
            )}
            onClick={() => setSelectedImage(index)}
          />
        ))}
      </div>
    </div>
  );

  const renderMasonry = () => (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {data.images.map((image, index) => (
          <div 
            key={`${image.data.id}-${index}`}
            className="relative mb-4 cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedImage(index)}
          >
          <Image
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText || ''}
            width={400}
            height={400}
            className="w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      ))}
    </div>
  );

  // Modal for fullscreen view
  const renderModal = () => {
    if (selectedImage === null) return null;

    const image = data.images[selectedImage];
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={() => setSelectedImage(null)}
      >
        <div className="relative h-[90vh] w-[90vw]">
          <Image
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText || ''}
            fill
            className="object-contain"
          />
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {data.layout === 'grid' && renderGrid()}
      {data.layout === 'carousel' && renderCarousel()}
      {data.layout === 'masonry' && renderMasonry()}
      {renderModal()}
    </div>
  );
}
