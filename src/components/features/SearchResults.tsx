'use client';

import { useExperimentVariant } from '@/hooks/useExperimentVariant';
import { SEARCH_LAYOUT_EXPERIMENT, SEARCH_FILTERS_EXPERIMENT } from '@/lib/experiments/config';
import type { ScoredSearchResult } from '@/lib/types';
import SearchResultItem from './SearchResultItem';
import { SearchResultsGrid } from './SearchResultsGrid';
import SearchFiltersWrapper from './SearchFiltersWrapper';
import { TopSearchFilters } from './TopSearchFilters';

interface SearchResultsProps {
  query: string;
  blog: ScoredSearchResult[];
}

export function SearchResults({
  query,
  blog
}: SearchResultsProps) {
  // Get experiment variants
  const layoutVariant = useExperimentVariant(SEARCH_LAYOUT_EXPERIMENT, { trackExposure: true });
  const filtersVariant = useExperimentVariant(SEARCH_FILTERS_EXPERIMENT, { trackExposure: true });

  const hasBlogResults = blog.length > 0;

  // Render filters based on experiment variant
  const renderFilters = () => {
    if (filtersVariant === 'top') {
      return <TopSearchFilters />;
    }
    return <SearchFiltersWrapper />;
  };

  // Render results based on experiment variant
  const renderResults = (items: ScoredSearchResult[]) => {
    if (layoutVariant === 'grid') {
      return (
        <SearchResultsGrid
          results={items.map(result => ({
            id: result.item.id,
            title: result.item.title || '',
            content: result.item.content || '', // Ensure content is never undefined
            slug: result.item.slug,
            publishedAt: result.item.publishedAt,
            query,
            relevanceScore: result.relevanceScore
          }))}
        />
      );
    }
    return (
      <div className="space-y-6">
        {items.map(result => (
          <SearchResultItem
            key={result.item.id}
            id={result.item.id}
            title={result.item.title || ''}
            content={result.item.content || ''}
            slug={result.item.slug}
            publishedAt={result.item.publishedAt}
            query={query}
            relevanceScore={result.relevanceScore}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderFilters()}

      {hasBlogResults && (
        <section>
          <h2 className="text-xl font-semibold text-[#091E42] mb-4">
            Blog ({blog.length})
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderResults(blog)}
          </div>
        </section>
      )}
    </div>
  );
}
