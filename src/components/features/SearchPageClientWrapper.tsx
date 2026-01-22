'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/components/providers/NavigationProvider';
import { search } from '@/lib/api';
import { SearchParams, BlogPost, NewsArticle } from '@/lib/types';
import { validateSearchQuery, validateUrlParam } from '@/lib/validation';
import { SearchResults } from './SearchResults';
import SearchAnalytics from './SearchAnalytics';

interface SearchData {
  blogPosts: BlogPost[];
  newsArticles: NewsArticle[];
  pagination: {
    blogTotal: number;
    newsTotal: number;
  };
}

export default function SearchPageClientWrapper() {
  const { searchParams } = useNavigation();
  const [data, setData] = useState<SearchData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams?.toString() || '');
        const validatedParams: Record<string, string> = {};

        // Validate search query
        const queryValidation = validateSearchQuery(params.get('q') || '');
        if (!queryValidation.isValid) {
          throw new Error(queryValidation.error || 'Invalid search query');
        }
        const query = queryValidation.sanitized;

        // Validate and collect all parameters
        const paramValidations = {
          type: params.get('type'),
          dateFrom: params.get('dateFrom'),
          dateTo: params.get('dateTo'),
          sort: params.get('sort'),
          page: params.get('page')
        };

        // Validate each parameter
        for (const [key, value] of Object.entries(paramValidations)) {
          if (value) {
            const validation = validateUrlParam(value);
            if (!validation.isValid) {
              throw new Error(`Invalid ${key} parameter`);
            }
            validatedParams[key] = validation.sanitized;
          }
        }

        // Additional type validations
        if (validatedParams.type && !['blog', 'news'].includes(validatedParams.type)) {
          throw new Error('Invalid content type parameter');
        }

        if (validatedParams.sort && !['date', 'relevance', 'title'].includes(validatedParams.sort)) {
          throw new Error('Invalid sort parameter');
        }

        // Validate dates
        if (validatedParams.dateFrom && isNaN(Date.parse(validatedParams.dateFrom))) {
          throw new Error('Invalid dateFrom parameter');
        }

        if (validatedParams.dateTo && isNaN(Date.parse(validatedParams.dateTo))) {
          throw new Error('Invalid dateTo parameter');
        }

        // Construct API params
        const apiParams: SearchParams = {
          query,
          filters: {
            contentType: validatedParams.type ? [validatedParams.type as 'blog' | 'news'] : undefined,
            dateFrom: validatedParams.dateFrom,
            dateTo: validatedParams.dateTo,
          },
          sort: validatedParams.sort ? {
            field: validatedParams.sort as 'date' | 'relevance' | 'title',
            direction: 'desc'
          } : undefined,
          page: validatedParams.page ? parseInt(validatedParams.page) : 1,
          pageSize: 10
        };

        // Fetch data
        const results = await search(apiParams);

        setData({
          blogPosts: results.blogPosts.data,
          newsArticles: results.newsArticles.data,
          pagination: {
            blogTotal: results.blogPosts.meta.pagination.total,
            newsTotal: results.newsArticles.meta.pagination.total
          }
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while searching');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 mt-[72px]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 mt-[72px]">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const query = searchParams?.get('q') || '';
  const totalResults = data.pagination.blogTotal + data.pagination.newsTotal;
  const hasResults = data.blogPosts.length > 0 || data.newsArticles.length > 0;

  return (
    <main className="container mx-auto px-4 py-8 mt-[72px]">
      <SearchAnalytics 
        query={query}
        totalResults={totalResults}
        filters={{
          contentType: (searchParams?.get('type') as 'blog' | 'news' | undefined) || undefined,
          dateFrom: searchParams?.get('dateFrom') || undefined,
          dateTo: searchParams?.get('dateTo') || undefined,
          sort: (searchParams?.get('sort') as 'date' | 'relevance' | 'title' | undefined) || undefined
        }}
      />
      <h1 className="text-3xl font-bold text-[#091E42] mb-4">
        Zoekresultaten voor &quot;{query}&quot;
      </h1>

      {!hasResults ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-[#091E42]/70">
            Geen resultaten gevonden voor &quot;{query}&quot;. Probeer andere zoektermen of controleer de spelling.
          </p>
        </div>
      ) : (
        <SearchResults
          query={query}
          blogPosts={data.blogPosts}
          newsArticles={data.newsArticles}
          blogTotal={data.pagination.blogTotal}
          newsTotal={data.pagination.newsTotal}
        />
      )}
    </main>
  );
}