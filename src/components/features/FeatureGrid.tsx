import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeatureGridComponent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icon, getFeatureIconUrl } from '@/components/ui/Icons';

interface FeatureGridProps {
  data: FeatureGridComponent;
  className?: string;
}

export function FeatureGrid({ data, className }: FeatureGridProps) {
  // Special handling for 5 cards to create a 3-2 layout
  const isFiveCardLayout = data.features.length === 5;

  useEffect(() => {
    console.log('FeatureGrid rendering with:', data.features.length, 'features');
  }, [data.features.length]);

  return (
    <div className={cn('w-full px-6 py-16', className)}>
      <div className={cn(
        "grid grid-cols-1 gap-8 max-w-7xl mx-auto",
        isFiveCardLayout 
          ? "md:grid-cols-3" 
          : "md:grid-cols-3"
      )}>
        {data.features.map((feature, index) => {
          const isLastTwo = isFiveCardLayout && index >= data.features.length - 2;
          
          const cardContent = (
            <div className={cn(
              'flex flex-col items-center text-center p-8 h-full rounded-xl border border-gray-200',
              'transition-all duration-300 hover:shadow-lg group',
              isLastTwo && 'md:mx-auto w-full'
            )}>
              {(feature.icon || getFeatureIconUrl(feature.title)) && (
                <div className="w-24 h-24 mb-6">
                  {feature.icon ? (
                    <Image
                      src={feature.icon.url}
                      alt={feature.icon.alternativeText || ''}
                      width={96}
                      height={96}
                      className="mx-auto transition-all duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <Icon
                      url={getFeatureIconUrl(feature.title)!}
                      alt={`Icon for ${feature.title}`}
                      className="text-[#00875A] transition-all duration-300 group-hover:scale-110"
                    />
                  )}
                </div>
              )}

              <h3 className="text-xl font-semibold mb-4 group-hover:text-blue-600">
                {feature.title}
              </h3>

              <p className="text-gray-600">
                {feature.description}
              </p>

              {feature.link && (
                <div className="mt-6 text-blue-600 group-hover:text-blue-800 font-medium">
                  Learn more →
                </div>
              )}
            </div>
          );

          const wrapperClassName = cn(
            isLastTwo && isFiveCardLayout && 'md:col-span-1.5'
          );

          return feature.link ? (
            <Link
              key={feature.id}
              href={feature.link}
              className={wrapperClassName}
            >
              {cardContent}
            </Link>
          ) : (
            <div
              key={feature.id}
              className={wrapperClassName}
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
