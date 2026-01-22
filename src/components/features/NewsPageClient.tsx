'use client';

import React from 'react';
import useSWRInfinite from 'swr/infinite';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { NewsArticleCard } from './NewsArticleCard';
import { NewsArticle, Page } from '@/lib/types';

export const PAGE_SIZE = 10; // Export to share with server component

interface NewsPageClientProps {
  page: Page;
  initialArticles: NewsArticle[];
}
export const NewsPageClient: React.FC<NewsPageClientProps> = ({ page, initialArticles }) => {
  // Log initial props
  console.log('[NewsPageClient] Received props:', {
    hasPage: !!page,
    pageStructure: {
      id: page?.id,
      title: page?.title,
      hasValidDates: page ? {
        created: !!page.createdAt && !isNaN(new Date(page.createdAt).getTime()),
        updated: !!page.updatedAt && !isNaN(new Date(page.updatedAt).getTime())
      } : null
    },
    initialArticlesCount: initialArticles?.length,
    articlesStructure: initialArticles?.map(article => ({
      id: article.id,
      hasTitle: !!article.title,
      hasContent: !!article.content,
      dateValidation: {
        created: !!article.createdAt && !isNaN(new Date(article.createdAt).getTime()),
        updated: !!article.updatedAt && !isNaN(new Date(article.updatedAt).getTime()),
        published: article.publishedAt ? !isNaN(new Date(article.publishedAt).getTime()) : 'not set'
      }
    }))
  });

  const getKey = (pageIndex: number) => {
    // Skip first page if we have initial data
    if (pageIndex === 0 && initialArticles?.length > 0) {
      return null;
    }
    
    const key = `/api/news-articles?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`;
    console.log('[NewsPageClient] Generated SWR key:', { pageIndex, key });
    return key;
  };

  const { data, error, size, setSize, isLoading } = useSWRInfinite<{
    articles: NewsArticle[];
    total: number;
  }>(getKey);

  // Log SWR state changes
  React.useEffect(() => {
    console.log('[NewsPageClient] SWR state update:', {
      hasData: !!data,
      dataLength: data?.length,
      currentSize: size,
      isLoading,
      hasError: !!error
    });
  }, [data, error, size, isLoading]);


  // Debug logging for data flow
  console.log('[NewsPageClient] Data flow debug:', {
    hasData: !!data,
    dataLength: data?.length,
    initialArticlesPresent: !!initialArticles,
    initialArticlesLength: initialArticles?.length,
    dataStructure: data ? JSON.stringify(data) : 'No data'
  });

  // Process and validate merged articles
  const articles = React.useMemo(() => {
    // Start with initial articles
    let mergedArticles = [...initialArticles];
    
    // Add SWR data if available
    if (data) {
      const swrArticles = data.flatMap(page => page.articles);
      
      // Deduplicate articles based on ID
      const seenIds = new Set(mergedArticles.map(article => article.id));
      const uniqueNewArticles = swrArticles.filter(article => !seenIds.has(article.id));
      
      mergedArticles = [...mergedArticles, ...uniqueNewArticles];
    }
    
    // Validate and filter articles
    const validatedArticles = mergedArticles.filter(article => {
      const isValid = !!(
        article &&
        article.id &&
        article.title &&
        article.createdAt &&
        !isNaN(new Date(article.createdAt).getTime()) &&
        article.updatedAt &&
        !isNaN(new Date(article.updatedAt).getTime())
      );
      
      if (!isValid) {
        console.warn('[NewsPageClient] Invalid article:', {
          id: article?.id,
          hasTitle: !!article?.title,
          hasValidDates: {
            created: article?.createdAt && !isNaN(new Date(article.createdAt).getTime()),
            updated: article?.updatedAt && !isNaN(new Date(article.updatedAt).getTime())
          }
        });
      }
      
      return isValid;
    });
    
    console.log('[NewsPageClient] Articles processing:', {
      source: data ? 'SWR Data' : 'Initial Props',
      initialCount: initialArticles.length,
      swrCount: data?.reduce((acc, page) => acc + page.articles.length, 0) || 0,
      mergedCount: mergedArticles.length,
      validCount: validatedArticles.length,
      invalidCount: mergedArticles.length - validatedArticles.length
    });
    
    return validatedArticles;
  }, [data, initialArticles]);

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.articles.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.articles.length < PAGE_SIZE);

  // Log pagination state
  React.useEffect(() => {
    console.log('[NewsPageClient] Pagination state:', {
      isLoadingMore,
      isEmpty,
      isReachingEnd,
      currentSize: size,
      totalArticles: articles.length
    });
  }, [isLoadingMore, isEmpty, isReachingEnd, size, articles.length]);

  if (error) {
    console.error('[NewsPageClient] SWR Error:', error);
    return (
      <ErrorMessage
        message="Er is een fout opgetreden bij het laden van meer artikelen"
        retry={() => setSize(size)}
      />
    );
  }

  if (isLoading && !articles.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsArticleCard key={article.id} article={article} />
        ))}
      </div>
      
      {!isReachingEnd && (
        <div className="flex justify-center">
          <button
            onClick={() => setSize(size + 1)}
            disabled={isLoadingMore}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
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
