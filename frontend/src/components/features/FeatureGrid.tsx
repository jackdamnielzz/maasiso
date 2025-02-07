import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeatureGridComponent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FeatureGridProps {
  data: FeatureGridComponent;
  className?: string;
}

export function FeatureGrid({ data, className }: FeatureGridProps) {
  const gridCols = data.features.length <= 3 
    ? 'md:grid-cols-3'
    : data.features.length === 4
    ? 'md:grid-cols-2 lg:grid-cols-4'
    : 'md:grid-cols-3';

  return (
    <div className={cn('w-full px-4 py-12', className)}>
      <div className={cn(
        'grid grid-cols-1 gap-8',
        gridCols
      )}>
        {data.features.map((feature) => {
          if (feature.link) {
            return (
              <Link key={feature.id} href={feature.link} className="block">
                <div className={cn(
                  'group flex h-full flex-col items-center rounded-lg p-6 text-center transition-colors',
                  'cursor-pointer hover:bg-gray-50'
                )}>
                  {feature.icon && (
                    <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={feature.icon.data.attributes.url}
                        alt={feature.icon.data.attributes.alternativeText || ''}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  )}

                  <h3 className="mb-2 text-xl font-semibold group-hover:text-blue-600">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600">
                    {feature.description}
                  </p>

                  <div className="mt-4 text-blue-600 group-hover:text-blue-800">
                    Learn more →
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <div key={feature.id}>
              <div className="group flex h-full flex-col items-center rounded-lg p-6 text-center">
                {feature.icon && (
                  <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={feature.icon.data.attributes.url}
                      alt={feature.icon.data.attributes.alternativeText || ''}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <h3 className="mb-2 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
