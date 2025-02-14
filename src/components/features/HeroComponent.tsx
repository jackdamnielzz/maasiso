import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroComponent as HeroComponentType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeroProps {
  data: HeroComponentType;
  className?: string;
}

export function HeroComponent({ data, className }: HeroProps) {
  return (
    <div className={cn('relative min-h-[400px] w-full overflow-hidden md:min-h-[600px]', className)}>
      {/* Background Image */}
      {data.backgroundImage && (
        <Image
          src={data.backgroundImage.data.attributes.url}
          alt={data.backgroundImage.data.attributes.alternativeText || ''}
          fill
          className="object-cover"
          priority
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 text-center text-white">
        <div className="max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">{data.title}</h1>
          
          {data.subtitle && (
            <p className="mb-8 text-lg md:text-xl">{data.subtitle}</p>
          )}
          
          {data.ctaButton && (
            <Link
              href={data.ctaButton.link}
              className={cn(
                'inline-block rounded-lg px-6 py-3 text-lg font-semibold transition-colors',
                data.ctaButton.style === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              )}
            >
              {data.ctaButton.text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
