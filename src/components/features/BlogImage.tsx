'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BlogImage({ src, alt, className }: BlogImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = error ? '/placeholder-blog.jpg' : src;

  return (
    <div className="relative w-full h-[400px] mb-8">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className={`object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className || ''}`}
        priority
        quality={75}
        onError={() => {
          console.error(`Failed to load image: ${src}`);
          setError(true);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
      />
    </div>
  );
}