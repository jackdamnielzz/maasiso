'use client';

import { Suspense, useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BlogPageClientWrapper from '@/components/features/BlogPageClientWrapper';
import BlogSearchBar from '@/components/features/BlogSearchBar';
import BlogFilters from '@/components/features/BlogFilters';
import { getBlogPosts, getPage, getTags } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { Tag } from '@/lib/types';

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const router = useRouter();
  const [pageData, setPageData] = useState<any>(null);
  const [initialPosts, setInitialPosts] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const params = await searchParams;
        
        const PAGE_SIZE = 9;
        const currentPage = typeof params.page === 'string' 
          ? parseInt(params.page, 10) 
          : 1;
        
        // Get search and filter parameters
        const searchQuery = typeof params.q === 'string' ? params.q : undefined;
        const categoryId = typeof params.category === 'string' ? params.category : undefined;
        const tagIds = typeof params.tags === 'string' 
          ? params.tags.split(',').filter(Boolean) 
          : undefined;

        // Fetch data in parallel - only get tags since we removed categories
        const [pageDataResult, { posts }, tagsResult] = await Promise.all([
          getPage('blog'),
          getBlogPosts(currentPage, PAGE_SIZE, searchQuery, categoryId, tagIds),
          getTags()
        ]);

        setPageData(pageDataResult);
        setInitialPosts(posts);
        setTags(tagsResult);
      } catch (error) {
        console.error('Error loading blog page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleFiltersChange = (filters: { categories: string[], tags: string[] }) => {
    // Update URL with new filters - only handle tags now
    const params = new URLSearchParams(window.location.search);
    
    // Remove category handling since we don't use it anymore
    params.delete('category');
    
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags[0]); // Only one tag allowed
    } else {
      params.delete('tags');
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/blog?${params.toString()}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page header - Mobile optimized */}
          <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Blog
            </h1>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl">
              Ontdek onze laatste inzichten over ISO certificering en kwaliteitsmanagement
            </p>
          </div>

          {/* Search bar - Full width on mobile, centered */}
          <div className="mb-6 md:mb-8 flex justify-center">
            <BlogSearchBar className="w-full max-w-2xl" />
          </div>

          {/* Main content area with sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters sidebar - Now only shows tags and is sticky */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <BlogFilters 
                categories={[]} 
                tags={tags}
                className=""
                onFiltersChange={handleFiltersChange}
              />
            </aside>

            {/* Blog posts grid - Responsive columns */}
            <main className="flex-1 min-w-0">
              <Suspense fallback={<LoadingSpinner />}>
                <BlogPageClientWrapper
                  page={pageData}
                  initialPosts={initialPosts}
                />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}