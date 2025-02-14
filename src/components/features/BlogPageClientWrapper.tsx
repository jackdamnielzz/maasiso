'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/components/providers/NavigationProvider';
import { getBlogPosts } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import BlogPageClient from './BlogPageClient';

interface BlogData {
  blogPosts: BlogPost[];
  pagination: {
    page: number;
    pageCount: number;
  };
}

export default function BlogPageClientWrapper() {
  const { searchParams } = useNavigation();
  const [data, setData] = useState<BlogData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const pageParam = searchParams?.get('page');
        const currentPage = pageParam && !isNaN(parseInt(pageParam))
          ? parseInt(pageParam)
          : 1;

        const response = await getBlogPosts(currentPage, 6);

        if (!response || !response.blogPosts.data) {
          throw new Error('Failed to fetch blog posts');
        }

        setData({
          blogPosts: response.blogPosts.data,
          pagination: {
            page: response.blogPosts.meta.pagination.page,
            pageCount: response.blogPosts.meta.pagination.pageCount
          }
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching blog posts');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <BlogPageClient
      blogPosts={data.blogPosts}
      pagination={data.pagination}
    />
  );
}