'use client';

import React from 'react';
import { BlogPost, Page } from '@/lib/types';
import useSWRInfinite from 'swr/infinite';
import LoadingSpinner from '../common/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import BlogPostCard from './BlogPostCard';
import { useSearchParams } from 'next/navigation';

interface BlogPageClientProps {
  page: Page;
  initialPosts: BlogPost[];
}

const FIRST_PAGE_SIZE = 9;
const NEXT_PAGE_SIZE = 6;

export const BlogPageClient: React.FC<BlogPageClientProps> = ({ page, initialPosts }) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';
  const tagIds = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  
  const getKey = (pageIndex: number) => {
    const start = pageIndex === 0 ? 0 : FIRST_PAGE_SIZE + (pageIndex - 1) * NEXT_PAGE_SIZE;
    const limit = pageIndex === 0 ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE;
    
    // Build filters
    const filterParts: string[] = [];
    
    if (searchQuery) {
      filterParts.push(`filters[title][$containsi]=${encodeURIComponent(searchQuery)}`);
    }
    
    if (categoryId) {
      filterParts.push(`filters[categories][id][$eq]=${encodeURIComponent(categoryId)}`);
    }
    
    if (tagIds.length > 0) {
      // Use $or filter for tags to match any of the selected tags
      tagIds.forEach((tagId, index) => {
        filterParts.push(`filters[$or][${index}][tags][id][$eq]=${encodeURIComponent(tagId)}`);
      });
    }
    
    const filters = filterParts.length > 0 ? `&${filterParts.join('&')}` : '';
    
    const url = `/api/proxy/blog-posts?pagination[start]=${start}&pagination[limit]=${limit}&populate=*&sort=publishedAt:desc${filters}`;
    console.log('[BlogPageClient] getKey', { pageIndex, start, limit, searchQuery, url });
    return url;
  };

  const fetcher = async (url: string) => {
    try {
      const res = await fetch(url);
      
      if (!res.ok) {
        console.error('[BlogPageClient] Fetch error:', {
          status: res.status,
          statusText: res.statusText,
          url
        });
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      
      // Validate response structure
      if (!json || typeof json !== 'object') {
        console.error('[BlogPageClient] Invalid response structure:', json);
        throw new Error('Invalid response structure');
      }
      
      // Map altijd naar vlakke posts
      const posts = (json.data || []).map((post: { id: number; attributes?: { featuredImage?: any; Content?: string; [key: string]: any } }) => { // Refine type for attributes
        if (post && post.attributes) {
          // fallback voor oude structuur
          const base = { ...post.attributes, id: post.id };
          // Directly use the featuredImage from the base object, assuming proxy flattens it.
          // If it's already the correct structure (or null/undefined), this works.
          // If it's still nested { data: { attributes: ... } }, the component using it needs adjustment.
          const finalFeaturedImage = base.featuredImage;

          // Return the base object with the (potentially still nested) featuredImage
          // Return the base object including Content and the potentially still nested featuredImage
          return { ...base, featuredImage: finalFeaturedImage || undefined, Content: base.Content }; // Ensure undefined if falsy
        }
        // als al vlak, gewoon teruggeven
        return post;
      });
      
      return {
        posts,
        total: json.meta?.pagination?.total || posts.length
      };
    } catch (error) {
      console.error('[BlogPageClient] Fetcher error:', error);
      throw error;
    }
  };

  const { data, error, size, setSize, isLoading } = useSWRInfinite<{
    posts: BlogPost[];
    total: number;
  }>(getKey, fetcher, {
    fallbackData: [
      { posts: initialPosts, total: initialPosts.length }
    ],
    revalidateOnFocus: false,
    revalidateFirstPage: false
  });

  React.useEffect(() => {
    console.log('[BlogPageClient] SWR data', { data, error, size, isLoading });
    if (error) {
      console.error('[BlogPageClient] SWR error', error);
    }
    if (data) {
      data.forEach((page, idx) => {
        console.log(`[BlogPageClient] Page ${idx} response:`, page);
      });
    }
  }, [data, error, size, isLoading]);

  // Process and validate merged posts
  const posts = React.useMemo(() => {
    // If SWR data is available, use it (flattened and deduped)
    if (data) {
      const allPosts = data
        .filter(Boolean)
        .flatMap(page => page?.posts ?? []);
      // Deduplicate by id
      const uniquePostsMap = new Map();
      allPosts.forEach(post => {
        if (post && post.id) uniquePostsMap.set(post.id, post);
      });
      const uniquePosts = Array.from(uniquePostsMap.values());
      console.log('[BlogPageClient] Totaal aantal unieke posts:', uniquePosts.length);
      return uniquePosts;
    }
    // Fallback: use initialPosts (deduped)
    const uniqueInitialPostsMap = new Map();
    initialPosts.forEach(post => {
      if (post && post.id) uniqueInitialPostsMap.set(post.id, post);
    });
    const uniqueInitialPosts = Array.from(uniqueInitialPostsMap.values());
    console.log('[BlogPageClient] Alleen initialPosts:', uniqueInitialPosts.length);
console.log('[useMemo Debug] Final processedPosts (fallback):', uniqueInitialPosts);
    return uniqueInitialPosts;
  }, [data, initialPosts]);

  // Bepaal het totaal aantal opgehaalde posts
  const totalLoaded = posts.length;
  // Bepaal het totaal aantal beschikbare posts (uit de eerste pagina response of fallback)
  const totalAvailable = (data && data[0] && typeof data[0].total === 'number') ? data[0].total : totalLoaded;

  const isReachingEnd = totalLoaded >= totalAvailable;

  const isLoadingMore = isLoading || (size > 1 && data && typeof data[size - 1] === "undefined");
  const isEmpty = !data?.[0]?.posts || data[0].posts.length === 0;

  if (error) {
    return (
      <ErrorMessage
        message="Er is een fout opgetreden bij het laden van meer blog posts"
        retry={() => setSize(size)}
      />
    );
  }

  if (isLoading && !posts.length) {
    return <LoadingSpinner />;
  }

  // Show message when search/filters return no results
  if ((searchQuery || categoryId || tagIds.length > 0) && posts.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base sm:text-lg text-gray-600 mb-4">
            Geen artikelen gevonden voor de huidige filters.
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500 mb-2">
              Zoekterm: "<strong>{searchQuery}</strong>"
            </p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Probeer andere filters of bekijk alle artikelen.
          </p>
          <button
            onClick={() => window.location.href = '/blog'}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#00875A] bg-white border border-[#00875A] rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00875A] transition-colors"
          >
            Bekijk alle artikelen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      
      {!isReachingEnd && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={() => { console.log('[Meer laden] knop geklikt', { size }); setSize(size + 1); }}
            disabled={isLoadingMore}
            className="px-6 py-3 sm:px-4 sm:py-2 text-base sm:text-sm font-medium text-white bg-blue-600 rounded-lg sm:rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 touch-manipulation transition-colors"
          >
            {isLoadingMore ? 'Laden...' : 'Meer laden'}
          </button>
        </div>
      )}
      
      {isLoadingMore && (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};