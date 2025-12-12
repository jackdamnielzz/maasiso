'use client';

import { BlogPost } from '@/lib/types';
import Link from 'next/link';
import LazyImage from '../common/LazyImage';
import ErrorBoundary from '../common/ErrorBoundary';
import { validateSlug } from '@/lib/utils/slugUtils';
import { getImageUrl } from '@/lib/utils/imageUtils';
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
  className?: string;
  'data-testid'?: string;
}

export default function BlogCard({ post, className = '', ...props }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);

  const imageSrc = useMemo(() => {
    if (!post.featuredImage) return null;
    return getImageUrl(post.featuredImage, 'small');
  }, [post.featuredImage]);

  // Memoize processed data
  const processedData = useMemo(() => {
    const validSlug = validateSlug(post.slug);
    const excerpt = getExcerpt(post.content);
    
    // Format publication date
    let formattedPubDate = '';
    if (post.publicationDate) {
      try {
        formattedPubDate = dateFormatter.format(new Date(post.publicationDate));
      } catch (error) {
        console.error('Error formatting publication date:', error);
      }
    }

    // Format updated date (only show if different from publication date)
    let formattedUpdatedDate = '';
    if (post.updatedAt) {
      try {
        const updatedDate = new Date(post.updatedAt);
        const publicationDate = post.publicationDate ? new Date(post.publicationDate) : null;
        
        // Only show updated date if it's significantly different from publication date (more than 1 day)
        if (!publicationDate || Math.abs(updatedDate.getTime() - publicationDate.getTime()) > 24 * 60 * 60 * 1000) {
          formattedUpdatedDate = dateFormatter.format(updatedDate);
        }
      } catch (error) {
        console.error('Error formatting updated date:', error);
      }
    }

    return {
      validSlug,
      excerpt,
      formattedPubDate,
      formattedUpdatedDate
    };
  }, [post.slug, post.content, post.publicationDate, post.updatedAt]);

  // Track blog card clicks
  const handleCardClick = () => {
    // Track blog card click for analytics
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof window !== 'undefined' && typeof w.gtag === 'function') {
      w.gtag('event', 'blog_card_click', {
        blog_title: post.title,
        blog_slug: post.slug,
        click_position: 'listing_page',
        blog_categories: post.categories?.map(cat => cat.name).join(', ') || '',
        event_category: 'engagement'
      });
    }
  };

  if (!processedData.validSlug) {
    console.error('Invalid slug for blog post:', post.slug);
    return null;
  }

  return (
    <ErrorBoundary fallback={<div>Error loading blog post</div>}>
      <article 
        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}
        {...props}
      >
        <Link 
          href={`/blog/${processedData.validSlug}`}
          onClick={handleCardClick}
          className="block"
        >
          {/* Featured Image */}
          {imageSrc && !imageError && (
            <div className="w-full h-48 relative overflow-hidden">
              <LazyImage
                src={imageSrc}
                alt={post.featuredImage?.alternativeText || post.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.slice(0, 2).map((category) => (
                  <span
                    key={category.id}
                    className="inline-block bg-[#00875A]/10 text-[#00875A] text-xs px-2 py-1 rounded"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-[#091E42] mb-3 line-clamp-2 hover:text-[#00875A] transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            {processedData.excerpt && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {processedData.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Dates */}
            <div className="text-xs text-gray-500 space-y-1">
              {processedData.formattedPubDate && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Gepubliceerd: {processedData.formattedPubDate}</span>
                </div>
              )}
              
              {processedData.formattedUpdatedDate && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Bijgewerkt: {processedData.formattedUpdatedDate}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </article>
    </ErrorBoundary>
  );
}
