import React from 'react';
import { cn } from '@/lib/utils';
import { HeroComponent as HeroComponentType } from '@/lib/types';

interface HeroComponentSkeletonProps {
  className?: string;
  hasSubtitle?: boolean;
  hasCta?: boolean;
}

export function HeroComponentSkeleton({ 
  className,
  hasSubtitle = true,
  hasCta = true 
}: HeroComponentSkeletonProps) {
  return (
    <div className={cn('relative min-h-[400px] w-full overflow-hidden md:min-h-[600px]', className)}>
      {/* Background Skeleton */}
      <div className="absolute inset-0 bg-gray-200" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content Skeleton */}
      <div className="relative z-10 flex h-full w-full animate-pulse items-center justify-center px-4 text-center">
        <div className="max-w-4xl space-y-4">
          {/* Title Skeleton */}
          <div className="mx-auto h-10 w-3/4 rounded-lg bg-gray-300 md:h-14" />
          
          {/* Subtitle Skeleton */}
          {hasSubtitle && (
            <div className="mx-auto h-6 w-2/3 rounded-lg bg-gray-300 md:h-8" />
          )}
          
          {/* CTA Button Skeleton */}
          {hasCta && (
            <div className="mx-auto mt-8 h-12 w-40 rounded-lg bg-gray-300" />
          )}
        </div>
      </div>
    </div>
  );
}
