'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics/core';
import { buildSearchEvent, buildNavigationEvent } from '@/lib/analytics/events';
import type { ContentType, SortOption } from '@/lib/analytics/types';

interface SearchFilters {
  category?: string;
  contentType?: ContentType;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOption;
  [key: string]: unknown;
}

interface SearchAnalyticsProps {
  query: string;
  totalResults: number;
  filters?: SearchFilters;
  previousFilters?: SearchFilters;
}

function getFilterChanges(current: SearchFilters = {}, previous: SearchFilters = {}): Partial<SearchFilters> {
  return Object.entries(current).reduce((changes, [key, value]) => {
    if (value !== previous[key as keyof SearchFilters]) {
      changes[key as keyof SearchFilters] = value;
    }
    return changes;
  }, {} as Partial<SearchFilters>);
}

export default function SearchAnalytics({ 
  query, 
  totalResults,
  filters = {},
  previousFilters
}: SearchAnalyticsProps) {
  const isInitialSearch = useRef(true);

  useEffect(() => {
    // Track initial search
    if (isInitialSearch.current) {
      analytics.track(buildSearchEvent(
        'execute_search',
        query,
        totalResults,
        filters.category,
        filters.sort,
        1
      ));
      isInitialSearch.current = false;
      return;
    }

    // Track filter changes
    if (previousFilters) {
      const changes = getFilterChanges(filters, previousFilters);
      if (Object.keys(changes).length > 0) {
        // Track category selection separately for better analytics
        if (changes.category && filters.contentType) {
          analytics.track(buildNavigationEvent(
            'category_select',
            `/${filters.contentType}s/category/${changes.category}`
          ));
        }

        // Track search with updated filters
        analytics.track(buildSearchEvent(
          'filter_results',
          query,
          totalResults,
          filters.category,
          filters.sort
        ));
      }
    }
  }, [query, totalResults, filters, previousFilters]);

  // Track new searches when query changes
  useEffect(() => {
    if (!isInitialSearch.current) {
      analytics.track(buildSearchEvent(
        'execute_search',
        query,
        totalResults,
        filters.category,
        filters.sort
      ));
    }
  }, [query, totalResults, filters.category, filters.sort]);

  // Track sort changes
  useEffect(() => {
    if (!isInitialSearch.current && filters.sort) {
      analytics.track(buildSearchEvent(
        'sort_results',
        query,
        totalResults,
        filters.category,
        filters.sort
      ));
    }
  }, [filters.sort, query, totalResults, filters.category]);

  return null; // This component doesn't render anything
}
