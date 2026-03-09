'use client';

import { BlogPost } from '@/lib/types';
import Link from 'next/link';
import LazyImage from '../common/LazyImage';
import ErrorBoundary from '../common/ErrorBoundary';
import { validateSlug } from '@/lib/utils/slugUtils';
import { useMemo } from 'react';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // Memoize image source calculation
  const imageSource = useMemo(() => {
    if (!post.featuredImage) return null;
    const imageUrl = post.featuredImage.formats?.small?.url || post.featuredImage.url;
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `/api/proxy/assets${imageUrl}`;
    return imageUrl;
  }, [post.featuredImage]);

  // Memoize validated slug
  const validatedSlug = useMemo(() => validateSlug(post.slug), [post.slug]);

  // Memoize image section
  const imageSection = useMemo(() => {
    if (!imageSource) {
      return (
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-gray-500">
          Geen afbeelding beschikbaar
        </div>
      );
    }

    return (
      <div className="relative h-48 w-full">
        <LazyImage
          src={imageSource}
          alt={post.featuredImage?.alternativeText || post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          quality={75}
          priority
        />
      </div>
    );
  }, [imageSource, post.featuredImage?.alternativeText, post.title]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      {imageSection}
      
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/kennis/blog/${validatedSlug}`}>
          <h3 className="text-xl font-semibold text-[#091E42] hover:text-[#FF8B00] transition-colors">
            {post.title || 'Geen titel'}
          </h3>
        </Link>

        <div className="mt-auto pt-4 text-sm text-[#091E42]/60 space-y-1">
          <p>
            Aangemaakt: {new Date(post.publicationDate || post.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {(() => {
            const updateDate = post.lastUpdatedDate || post.updatedAt;
            const createDate = post.publicationDate || post.createdAt;
            if (!updateDate) return null;
            const updateDay = new Date(updateDate).toDateString();
            const createDay = new Date(createDate).toDateString();
            if (updateDay === createDay) return null;
            return (
              <p>
                Laatst bijgewerkt: {new Date(updateDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
