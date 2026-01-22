'use client';

import { Suspense } from 'react';
import { BlogPost } from '@/lib/types';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import BlogPostCard from './BlogPostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface BlogListProps {
  posts: BlogPost[];
}

function BlogList({ posts }: BlogListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Geen blog posts gevonden.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function BlogListFallback() {
  return (
    <div className="flex justify-center items-center py-12">
      <LoadingSpinner />
    </div>
  );
}

function BlogListError({ error }: { error: Error }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-red-600 text-xl mb-2">Er is iets misgegaan</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );
}

export default function BlogListClientWrapper({ posts }: BlogListProps) {
  return (
    <ErrorBoundary fallback={BlogListError}>
      <Suspense fallback={<BlogListFallback />}>
        <BlogList posts={posts} />
      </Suspense>
    </ErrorBoundary>
  );
}