'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BlogPost } from '../../lib/types';

type BlogPostCardProps = {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps): React.ReactNode {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleTagClick = (e: React.MouseEvent, tagName: string) => {
    e.preventDefault(); // Prevent the card link from being triggered
    e.stopPropagation();
    router.push(`/blog?tags=${encodeURIComponent(tagName)}`);
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
    <article className="group bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="h-48 sm:h-56 w-full bg-gray-100 overflow-hidden relative">
          {post.featuredImage && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="w-full h-full">
                <Image
                  src={`/api/proxy/assets/uploads/${post.featuredImage.url.split('/uploads/').pop()}`}
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
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm text-gray-500">Afbeelding niet beschikbaar</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Tags section - Mobile optimized */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag.id}
                  onClick={(e) => handleTagClick(e, tag.name)}
                  className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300 transition-colors touch-manipulation"
                  aria-label={`Filter op tag ${tag.name}`}
                >
                  {tag.name}
                </button>
              ))}
              {post.tags.length > 3 && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-0.5 text-xs text-gray-500">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-auto">
            {formattedDate && (
              <time className="text-gray-500" dateTime={post.publishedAt}>
                {formattedDate}
              </time>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
