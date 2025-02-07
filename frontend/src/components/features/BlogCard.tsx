'use client';

import { BlogPost } from '@/lib/types';
import Link from 'next/link';
import LazyImage from '../common/LazyImage';
import ErrorBoundary from '../common/ErrorBoundary';
import { useMemo, useState } from 'react';

// Memoize date formatter instance
const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Move excerpt function outside component to prevent recreation
function getExcerpt(content: string): string {
  try {
    // Remove Markdown syntax and get first non-empty paragraph
    return content
      .replace(/[#*`]/g, '') // Remove Markdown syntax
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)[0] || '';
  } catch (error) {
    console.error('Error generating excerpt:', error);
    return '';
  }
}

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // Memoize image source calculation
  const imageSource = useMemo(() => {
    if (!post.featuredImage) return null;
    const imageUrl = post.featuredImage.formats?.small?.url || post.featuredImage.url;
    return imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
  }, [post.featuredImage]);

  // Memoize excerpt - use summary if available, otherwise generate from content
  const excerpt = useMemo(() => post.summary || getExcerpt(post.content), [post.summary, post.content]);

  // Memoize date section
  const dateSection = useMemo(() => (
    <div className="mb-4">
      {post.publishedAt && (
        <span className="text-sm text-[#091E42]/70">
          {dateFormatter.format(new Date(post.publishedAt))}
        </span>
      )}
    </div>
  ), [post.publishedAt]);

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
        {dateSection}
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold text-[#091E42] mb-3 hover:text-[#FF8B00] transition-colors">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-[#091E42]/80 mb-4 line-clamp-3 whitespace-pre-wrap">
          {excerpt}
        </p>
        
        <div className="mt-auto">
          <Link 
            href={`/blog/${post.slug}`}
            className="text-[#FF8B00] hover:text-[#E67E00] font-medium transition-colors"
          >
            Lees meer
          </Link>
        </div>
      </div>
    </div>
  );
}
