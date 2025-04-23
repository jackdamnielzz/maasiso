'use client';

import React from 'react';
import useSWRInfinite from 'swr/infinite';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import BlogPostCard from './BlogPostCard';
import { BlogPost, Page } from '@/lib/types';

export const PAGE_SIZE = 10;

interface BlogPageClientProps {
  page: Page;
  initialPosts: BlogPost[];
}

export const BlogPageClient: React.FC<BlogPageClientProps> = ({ page, initialPosts }) => {
  const getKey = (pageIndex: number) => {
    // Skip first page if we have initial data
    if (pageIndex === 0 && initialPosts?.length > 0) {
      return null;
    }
    
    return `/api/blog-posts?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`;
  };

  const { data, error, size, setSize, isLoading } = useSWRInfinite<{
    posts: BlogPost[];
    total: number;
  }>(getKey);

  // Process and validate merged posts
  const posts = React.useMemo(() => {
    // Start with initial posts
    let mergedPosts = [...initialPosts];
    
    // Add SWR data if available
    if (data) {
      const swrPosts = data.flatMap(page => page.posts);
      
      // Deduplicate posts based on ID
      const seenIds = new Set(mergedPosts.map(post => post.id));
      const uniqueNewPosts = swrPosts.filter(post => !seenIds.has(post.id));
      
      mergedPosts = [...mergedPosts, ...uniqueNewPosts];
    }
    
    // Validate and filter posts
    const validatedPosts = mergedPosts.filter(post => {
      const isValid = !!(
        post &&
        post.id &&
        post.title &&
        post.createdAt &&
        !isNaN(new Date(post.createdAt).getTime()) &&
        post.updatedAt &&
        !isNaN(new Date(post.updatedAt).getTime())
      );
      
      return isValid;
    });
    
    return validatedPosts;
  }, [data, initialPosts]);

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.posts.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.posts.length < PAGE_SIZE);

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
            onClick={() => setSize(size + 1)}
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