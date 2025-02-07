'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';
import { validateUrlParam, createSafeUrl } from '@/lib/validation';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  defaultLabel?: string;
  onHover?: (categorySlug: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory,
  defaultLabel = 'Alle categorieën',
  onHover
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Get current category name for display with error handling
  const currentCategory = categories.find(cat => {
    try {
      return cat.slug === selectedCategory;
    } catch (e) {
      console.error('Error comparing category slugs:', e);
      return false;
    }
  })?.name || defaultLabel;

  const handleCategorySelect = useCallback((categorySlug?: string) => {
    startTransition(() => {
      try {
        // Create a new params object with validated values
        const currentParams = new URLSearchParams(searchParams?.toString() || '');
        const validatedParams: Record<string, string> = {};
        
        // Reset to page 1 when changing category
        validatedParams.page = '1';
        
        // Validate and add category if present
        if (categorySlug) {
          const validation = validateUrlParam(categorySlug);
          if (validation.isValid) {
            validatedParams.category = validation.sanitized;
          }
        }
        
        // Copy over other existing params after validation
        for (const [key, value] of currentParams.entries()) {
          if (key !== 'page' && key !== 'category') {
            const validation = validateUrlParam(value);
            if (validation.isValid) {
              validatedParams[key] = validation.sanitized;
            }
          }
        }
        
        // Create safe URL with validated parameters
        const safeUrl = createSafeUrl(window.location.pathname, validatedParams);
        router.push(safeUrl);
        setIsOpen(false);
      } catch (e) {
        console.error('Error updating category:', e);
      }
    });
  }, [router, searchParams]);

  // Handle hover for prefetching with validation
  const handleHover = useCallback((categorySlug: string) => {
    try {
      const validation = validateUrlParam(categorySlug);
      if (validation.isValid && onHover && categorySlug !== selectedCategory) {
        onHover(validation.sanitized);
      }
    } catch (e) {
      console.error('Error handling category hover:', e);
    }
  }, [onHover, selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        if (!target.closest('.category-filter')) {
          setIsOpen(false);
        }
      } catch (e) {
        console.error('Error handling click outside:', e);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`category-filter relative mb-8 ${isPending ? 'opacity-70' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:w-64 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        aria-expanded={isOpen}
        disabled={isPending}
      >
        <span className="text-[#091E42]">{currentCategory}</span>
        <svg
          className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full md:w-64 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            <li>
              <button
                onClick={() => handleCategorySelect(undefined)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  !selectedCategory ? 'bg-gray-50 text-[#091E42]' : 'text-gray-700'
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
                  onMouseEnter={() => handleHover(category.slug)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    selectedCategory === category.slug ? 'bg-gray-50 text-[#091E42]' : 'text-gray-700'
                  }`}
                  disabled={isPending}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
