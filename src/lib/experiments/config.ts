import { ExperimentConfig } from './types';

/**
 * Search Results Layout Experiment
 * Tests a new grid layout for search results against the current list layout
 */
export const SEARCH_LAYOUT_EXPERIMENT: ExperimentConfig = {
  id: 'search-layout-2025-01',
  name: 'Search Results Layout Test',
  description: 'Testing grid layout vs list layout for search results',
  variants: [
    { id: 'control', name: 'List Layout', weight: 50 },
    { id: 'grid', name: 'Grid Layout', weight: 50 }
  ],
  audience: {
    percentage: 100, // Roll out to all users
    filters: [
      { type: 'device', value: 'desktop' } // Only desktop users for now
    ]
  },
  startDate: '2025-01-22T00:00:00Z'
};

/**
 * Search Filters Position Experiment
 * Tests moving filters to top vs keeping them on the side
 */
export const SEARCH_FILTERS_EXPERIMENT: ExperimentConfig = {
  id: 'search-filters-2025-01',
  name: 'Search Filters Position Test',
  description: 'Testing top filters vs side filters layout',
  variants: [
    { id: 'control', name: 'Side Filters', weight: 50 },
    { id: 'top', name: 'Top Filters', weight: 50 }
  ],
  audience: {
    percentage: 50, // Start with 50% of users
    filters: [] // No specific targeting
  },
  startDate: '2025-01-22T00:00:00Z'
};

/**
 * All active experiments
 */
export const ACTIVE_EXPERIMENTS = {
  searchLayout: SEARCH_LAYOUT_EXPERIMENT,
  searchFilters: SEARCH_FILTERS_EXPERIMENT
} as const;
