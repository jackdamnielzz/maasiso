import React from 'react';
import { cn } from '@/lib/utils';
import { TextBlockComponent } from '@/lib/types';

interface TextBlockSkeletonProps {
  className?: string;
  alignment?: TextBlockComponent['alignment'];
  paragraphs?: number;
}

export function TextBlockSkeleton({ 
  className,
  alignment = 'left',
  paragraphs = 3
}: TextBlockSkeletonProps) {
  return (
    <div 
      className={cn(
        'prose prose-lg mx-auto max-w-4xl animate-pulse px-4 py-8',
        alignment === 'left' && 'text-left',
        alignment === 'center' && 'text-center',
        alignment === 'right' && 'text-right',
        className
      )}
    >
      {/* Heading Skeleton */}
      <div className={cn(
        'mb-6 h-8 rounded-lg bg-gray-200',
        alignment === 'center' && 'mx-auto w-3/4',
        alignment === 'left' && 'w-2/3',
        alignment === 'right' && 'ml-auto w-2/3'
      )} />

      {/* Paragraphs Skeleton */}
      <div className="space-y-4">
        {[...Array(paragraphs)].map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-4 rounded-lg bg-gray-200',
              // Vary widths for visual interest
              index % 3 === 0 && 'w-full',
              index % 3 === 1 && 'w-5/6',
              index % 3 === 2 && 'w-4/5',
              // Alignment styles
              alignment === 'center' && 'mx-auto',
              alignment === 'right' && 'ml-auto'
            )}
          />
        ))}
      </div>

      {/* List Skeleton */}
      <div className="mt-6 space-y-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={`list-${index}`}
            className={cn(
              'flex items-center gap-2',
              alignment === 'center' && 'justify-center',
              alignment === 'right' && 'justify-end'
            )}
          >
            <div className="h-2 w-2 flex-none rounded-full bg-gray-300" />
            <div 
              className={cn(
                'h-4 rounded-lg bg-gray-200',
                alignment === 'left' && 'w-2/3',
                alignment === 'center' && 'w-1/2',
                alignment === 'right' && 'w-2/3'
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
