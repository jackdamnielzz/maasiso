'use client';

import { useExperimentVariant } from '@/hooks/useExperimentVariant';
import { SEARCH_LAYOUT_EXPERIMENT, SEARCH_FILTERS_EXPERIMENT } from '@/lib/experiments/config';
import { BlogPost, NewsArticle } from '@/lib/types';
import SearchResultItem from './SearchResultItem';
import { SearchResultsGrid } from './SearchResultsGrid';
import SearchFiltersWrapper from './SearchFiltersWrapper';
import { TopSearchFilters } from './TopSearchFilters';

interface SearchResultsProps {
  query: string;
  blogPosts: BlogPost[];
  newsArticles: NewsArticle[];
  blogTotal: number;
  newsTotal: number;
}

export function SearchResults({
  query,
  blogPosts,
  newsArticles,
  blogTotal,
  newsTotal
}: SearchResultsProps) {
  // Get experiment variants
  const layoutVariant = useExperimentVariant(SEARCH_LAYOUT_EXPERIMENT, { trackExposure: true });
  const filtersVariant = useExperimentVariant(SEARCH_FILTERS_EXPERIMENT, { trackExposure: true });

  const hasBlogResults = blogPosts.length > 0;
  const hasNewsResults = newsArticles.length > 0;

  // Render filters based on experiment variant
  const renderFilters = () => {
    if (filtersVariant === 'top') {
      return <TopSearchFilters />;
    }
    return <SearchFiltersWrapper />;
  };

  // Render results based on experiment variant
  const renderResults = (items: Array<BlogPost | NewsArticle>, type: 'blog' | 'news') => {
    if (layoutVariant === 'grid') {
      return (
        <SearchResultsGrid
          results={items.map(item => ({
            ...item,
            type,
            content: item.content || '', // Ensure content is never undefined
            query
          }))}
        />
      );
    }
    return (
      <div className="space-y-6">
        {items.map(item => (
          <SearchResultItem
            key={item.id}
            id={item.id}
            title={item.title || ''}
            content={item.content || ''}
            slug={item.slug}
            publishedAt={item.publishedAt}
            type={type}
            query={query}
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
            Blog ({blogTotal})
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderResults(blogPosts, 'blog')}
          </div>
        </section>
      )}

      {hasNewsResults && (
        <section>
          <h2 className="text-xl font-semibold text-[#091E42] mb-4">
            Nieuws ({newsTotal})
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderResults(newsArticles, 'news')}
          </div>
        </section>
      )}
    </div>
  );
}
