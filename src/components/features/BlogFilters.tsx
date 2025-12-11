'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Tag } from '@/lib/types';

interface BlogFiltersProps {
  categories: Category[];
  tags: Tag[];
  className?: string;
  onFiltersChange: (filters: { categories: string[], tags: string[] }) => void;
}

interface BlogCounts {
  tags: Record<string, number>;
}

export default function BlogFilters({ tags, className = '', onFiltersChange }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add CSS animation for the slide-in effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .filter-tag {
        animation: slideInUp 0.6s ease-out forwards;
      }
      
      .filter-tag:hover .shimmer {
        animation: shimmer 0.7s ease-out;
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Log component mount
  console.log('[BlogFilters] Component mounted with', { 
    tagsCount: tags.length 
  });
  
  // Get current filter values from URL
  const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [counts, setCounts] = useState<{ tags: Record<string, number> }>({
    tags: {}
  });

  // Fetch simple filter data (only tags that are actually used)
  const fetchFilterData = useCallback(async () => {
    try {
      console.log('[BlogFilters] Fetching simple filter data');
      
      const response = await fetch('/api/blog-filters-dynamic');
      
      if (response.ok) {
        const data = await response.json();
        console.log('[BlogFilters] Received filter data:', data);
        
        // Filter tags to only show those with counts > 0
        const availableTgs = tags.filter(tag => 
          data.tags[tag.id] && data.tags[tag.id] > 0
        );
        
        setAvailableTags(availableTgs);
        setCounts({ tags: data.tags });
        
        console.log('[BlogFilters] Applied simple filtering:', {
          tagsShown: availableTgs.length,
          totalTags: tags.length
        });
        
      } else {
        console.error('[BlogFilters] Failed to fetch filtering data:', response.status);
        // Fallback: show all tags
        setAvailableTags(tags);
        setCounts({ tags: {} });
      }
    } catch (error) {
      console.error('[BlogFilters] Error fetching filter data:', error);
      // Fallback: show all tags
      setAvailableTags(tags);
      setCounts({ tags: {} });
    }
  }, [tags]);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  // Handle tag selection
  const handleTagChange = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      // Deselect tag
      const newTags = selectedTags.filter(tag => tag !== tagId);
      setSelectedTags(newTags);
      onFiltersChange({ categories: [], tags: newTags });
    } else {
      // Select new tag
      setSelectedTags([tagId]);
      onFiltersChange({ categories: [], tags: [tagId] });
    }
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    onFiltersChange({ categories: [], tags: [] });
  };

  const hasActiveFilters = selectedTags.length > 0;

  return (
    <div className={`${className} sticky top-4 z-10`}>
      {/* Mobile filter toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg mb-4 text-base shadow-sm"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <span className="font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tags {hasActiveFilters && `(${selectedTags.length})`}
        </span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter content with sticky background */}
      <div id="filter-content" className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${isExpanded ? '' : 'hidden lg:block'}`}>
        {hasActiveFilters ? (
          <div className="flex flex-col gap-4">
            {/* Show selected tags with individual remove buttons */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">Actieve filters:</div>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Reset alle filters"
              >
                × Alles wissen
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                return tag ? (
                  <div key={tag.id} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>{tag.name}</span>
                    <button
                      onClick={() => handleTagChange(tag.id)}
                      className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                      aria-label={`Verwijder ${tag.name} filter`}
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ) : (
          // No filters active: show all available tags
          <div className="flex flex-col gap-4">
            <div className="text-sm font-semibold text-gray-700 mb-1">Filter op tags:</div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagChange(tag.id)}
                  className={`filter-tag px-3 py-1 rounded-full text-sm font-medium border transition-all duration-150 ${
                    selectedTags.includes(tag.id) 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {tag.name}
                  {counts.tags[tag.id] && ` (${counts.tags[tag.id]})`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 