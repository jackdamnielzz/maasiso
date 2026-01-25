'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/components/providers/NavigationProvider';
import { searchV2 } from '@/lib/api';
import { SearchParamsV2, SearchScope, SearchResultsV2 } from '@/lib/types';
import { validateSearchQuery, validateUrlParam } from '@/lib/validation';
import { SearchResults } from './SearchResults';
import SearchAnalytics from './SearchAnalytics';

export default function SearchPageClientWrapper() {
  const { searchParams } = useNavigation();
  const [data, setData] = useState<SearchResultsV2 | null>(null);
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
          scope: params.get('scope'),
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
        if (validatedParams.type && !['blog', 'news', 'all'].includes(validatedParams.type)) {
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
        const apiParams: SearchParamsV2 = {
          query,
          scope: (validatedParams.scope as SearchScope) || 'all',
          contentType: (validatedParams.type as 'blog' | 'news' | 'all') || 'all',
          dateFrom: validatedParams.dateFrom,
          dateTo: validatedParams.dateTo,
          sort: validatedParams.sort ? {
            field: validatedParams.sort as 'date' | 'relevance' | 'title',
            direction: 'desc'
          } : undefined,
          page: validatedParams.page ? parseInt(validatedParams.page) : 1,
          pageSize: 10
        };

        // Fetch data using searchV2
        const results = await searchV2(apiParams);

        setData(results);
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
  const totalResults = data.meta.totalResults;
  const hasResults = data.blog.length > 0 || data.news.length > 0;

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
        Zoekresultaten voor "{query}"
      </h1>

      {!hasResults ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-[#091E42]/70">
            Geen resultaten gevonden voor "{query}". Probeer andere zoektermen of controleer de spelling.
          </p>
        </div>
      ) : (
        <SearchResults
          query={query}
          blog={data.blog}
          news={data.news}
        />
      )}
    </main>
  );
}
