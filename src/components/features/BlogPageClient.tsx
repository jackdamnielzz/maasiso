'use client';

import React from 'react';
import useSWRInfinite from 'swr/infinite';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import BlogPostCard from './BlogPostCard';
import { BlogPost, Page } from '@/lib/types';

export const FIRST_PAGE_SIZE = 6;
export const NEXT_PAGE_SIZE = 3;

interface BlogPageClientProps {
  page: Page;
  initialPosts: BlogPost[];
}

export const BlogPageClient: React.FC<BlogPageClientProps> = ({ page, initialPosts }) => {
  const getKey = (pageIndex: number) => {
    const start = pageIndex === 0 ? 0 : FIRST_PAGE_SIZE + (pageIndex - 1) * NEXT_PAGE_SIZE;
    const limit = pageIndex === 0 ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE;
    const url = `/api/proxy/blog-posts?pagination[start]=${start}&pagination[limit]=${limit}&populate=*&sort=publishedAt:desc`;
    console.log('[BlogPageClient] getKey', { pageIndex, start, limit, url });
    return url;
  };

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const json = await res.json();
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

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      
      {!isReachingEnd && (
        <div className="flex justify-center">
          <button
            onClick={() => { console.log('[Meer laden] knop geklikt', { size }); setSize(size + 1); }}
            disabled={isLoadingMore}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoadingMore ? 'Laden...' : 'Meer laden'}
          </button>
        </div>
      )}
      
      {isLoadingMore && (
        <div className="flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
};