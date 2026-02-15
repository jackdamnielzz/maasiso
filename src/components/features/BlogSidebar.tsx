'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useCallback } from 'react';
import { Category } from '@/lib/types';

interface BlogSidebarProps {
  categories: Category[];
  selectedCategory?: string;
  searchQuery?: string;
}

export default function BlogSidebar({ 
  categories, 
  selectedCategory,
  searchQuery = ''
}: BlogSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when changing filters
      params.set('page', '1');

      const queryString = params.toString();
      router.push(queryString ? `/kennis/blog?${queryString}` : '/kennis/blog');
    });
  }, [router, searchParams]);

  const handleCategorySelect = (categorySlug?: string) => {
    updateParams({ category: categorySlug });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: localSearch || undefined });
  };

  const clearFilters = () => {
    setLocalSearch('');
    router.push('/kennis/blog');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className={`space-y-6 ${isPending ? 'opacity-70' : ''}`}>
      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-[#091E42] mb-3">Zoeken</h3>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Zoek artikelen..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent"
              disabled={isPending}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF8B00]"
              disabled={isPending}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-[#091E42] mb-3">Categorieën</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleCategorySelect(undefined)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                !selectedCategory 
                  ? 'bg-[#FF8B00] text-white' 
                  : 'text-[#091E42] hover:bg-gray-100'
              }`}
              disabled={isPending}
            >
              Alle categorieën
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategorySelect(category.slug)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedCategory === category.slug 
                    ? 'bg-[#FF8B00] text-white' 
                    : 'text-[#091E42] hover:bg-gray-100'
                }`}
                disabled={isPending}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm text-[#091E42] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          disabled={isPending}
        >
          Filters wissen
        </button>
      )}
    </div>
  );
}
