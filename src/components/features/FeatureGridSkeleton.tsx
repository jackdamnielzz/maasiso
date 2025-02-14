import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureGridSkeletonProps {
  className?: string;
  featureCount?: number;
  hasLinks?: boolean;
}

export function FeatureGridSkeleton({ 
  className,
  featureCount = 3,
  hasLinks = true 
}: FeatureGridSkeletonProps) {
  const gridCols = featureCount <= 3 
    ? 'md:grid-cols-3'
    : featureCount === 4
    ? 'md:grid-cols-2 lg:grid-cols-4'
    : 'md:grid-cols-3';

  return (
    <div className={cn('w-full animate-pulse px-4 py-12', className)}>
      <div className={cn(
        'grid grid-cols-1 gap-8',
        gridCols
      )}>
        {[...Array(featureCount)].map((_, index) => (
          <div key={index}>
            <div className="group flex h-full flex-col items-center rounded-lg p-6 text-center">
              {/* Icon Skeleton */}
              <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-gray-200" />

              {/* Title Skeleton */}
              <div className="mb-2 h-6 w-3/4 rounded-lg bg-gray-200" />

              {/* Description Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded-lg bg-gray-200" />
                <div className="h-4 w-5/6 rounded-lg bg-gray-200" />
              </div>

              {/* Link Skeleton */}
              {hasLinks && (
                <div className="mt-4 h-4 w-24 rounded-lg bg-gray-200" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
