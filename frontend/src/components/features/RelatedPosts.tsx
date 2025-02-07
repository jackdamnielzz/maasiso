'use client';

import { BlogPost } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import BlogCard from './BlogCard';
import ErrorBoundary from '../common/ErrorBoundary';
import { getRelatedPosts } from '@/lib/api';

interface RelatedPostsProps {
  currentSlug: string;
  categoryIds: string[];
}

export default function RelatedPosts({ currentSlug, categoryIds }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Memoize loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="animate-pulse max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[#091E42] mb-8">
        Gerelateerde artikelen
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 h-64 rounded-lg" />
        ))}
      </div>
    </div>
  ), []);

  const fetchRelatedPosts = useCallback(async () => {
    try {
      const response = await getRelatedPosts(currentSlug, categoryIds);
      setRelatedPosts(response.blogPosts);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch related posts');
      setRelatedPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSlug, categoryIds]);

  useEffect(() => {
    if (categoryIds.length > 0) {
      fetchRelatedPosts();
    } else {
      setIsLoading(false);
    }
  }, [categoryIds, fetchRelatedPosts]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchRelatedPosts();
  }, [fetchRelatedPosts]);

  // Memoize error state
  const errorState = useMemo(() => (
    <div className="bg-yellow-50 rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[#091E42] mb-6">
        Gerelateerde artikelen
      </h2>
      <div className="text-yellow-800">
        <p className="text-sm mb-4">
          Er is een fout opgetreden bij het laden van gerelateerde artikelen.
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-[#FF8B00] text-white rounded-lg hover:bg-[#E67E00] transition-colors text-sm"
        >
          Probeer opnieuw
        </button>
      </div>
    </div>
  ), [handleRetry]);

  // Memoize empty state
  const emptyState = useMemo(() => (
    <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[#091E42] mb-4">
        Gerelateerde artikelen
      </h2>
      <p className="text-sm text-gray-600">
        Geen gerelateerde artikelen gevonden.
      </p>
    </div>
  ), []);

  if (error) {
    return errorState;
  }

  if (isLoading) {
    return loadingSkeleton;
  }

  if (relatedPosts.length === 0 && !isLoading) {
    return emptyState;
  }

  // Memoize grid of blog cards
  const blogCards = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {relatedPosts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  ), [relatedPosts]);

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-[#091E42] mb-8">
          Gerelateerde artikelen
        </h2>
        {blogCards}
      </div>
    </ErrorBoundary>
  );
}
