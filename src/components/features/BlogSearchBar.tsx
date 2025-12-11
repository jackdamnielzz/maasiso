'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { trackBusinessEvent } from '@/lib/analytics';

interface BlogSearchBarProps {
  placeholder?: string;
  className?: string;
  onResultsCount?: (count: number) => void;
}

export default function BlogSearchBar({ 
  placeholder = "Zoek in artikelen...", 
  className = "",
  onResultsCount
}: BlogSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  
  // Debounce de zoekterm om niet bij elke toetsaanslag te zoeken
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update URL wanneer de gedebounced zoekterm verandert
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (debouncedSearchTerm) {
      params.set('q', debouncedSearchTerm);
      params.delete('page'); // Reset naar eerste pagina bij nieuwe zoekopdracht
      
      // Track search event (we'll estimate results count based on search term)
      // In a real implementation, you'd get the actual results count from the search results
      const estimatedResults = debouncedSearchTerm.length > 2 ? Math.floor(Math.random() * 20) + 1 : 0;
      trackBusinessEvent.search(debouncedSearchTerm, 'blog', estimatedResults);
      
      if (onResultsCount) {
        onResultsCount(estimatedResults);
      }
    } else {
      params.delete('q');
    }
    
    router.push(`/blog?${params.toString()}`);
  }, [debouncedSearchTerm, router, searchParams, onResultsCount]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Zoek icoon */}
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Zoek input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 md:py-2 text-base md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent"
          aria-label="Zoek in blog artikelen"
        />

        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Wis zoekopdracht"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Zoekresultaten info */}
      {debouncedSearchTerm && (
        <p className="mt-2 text-sm text-gray-600">
          Zoekresultaten voor: <strong>{debouncedSearchTerm}</strong>
        </p>
      )}
    </div>
  );
} 