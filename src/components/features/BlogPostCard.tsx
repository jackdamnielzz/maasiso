'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../../lib/types';

type BlogPostCardProps = {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps): React.ReactNode {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  // Calculate reading time based on content word count
  return (
    <Link href={`/kennis/blog/${post.slug}`}>
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div className="h-56 w-full bg-gray-100 overflow-hidden">
          {post.featuredImage && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="w-full h-full">
                <Image
                  src={
                    // Check if URL is already an external URL (Cloudinary, etc.)
                    post.featuredImage.url.startsWith('http')
                      ? post.featuredImage.url
                      : `/api/proxy/assets/uploads/${post.featuredImage.url.split('/uploads/').pop()}`
                  }
                  width={800}
                  height={450}
                  alt={post.featuredImage.alternativeText || post.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  priority={true}
                  quality={85}
                  loading="eager"
                />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Afbeelding niet beschikbaar</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            {formattedDate && (
              <time className="text-gray-500" dateTime={post.publishedAt}>
                {formattedDate}
              </time>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
