'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { validateSearchQuery, createSafeUrl } from '@/lib/validation';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isExpanded, setIsExpanded] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for validation error
  const [error, setError] = useState<string | undefined>();

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      const validation = validateSearchQuery(debouncedQuery);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }
      setError(undefined);
      const safeUrl = createSafeUrl('/search', { q: validation.sanitized });
      router.push(safeUrl);
    }
  }, [debouncedQuery, router]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded(true);
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape') {
        setQuery('');
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className={`flex items-center transition-all duration-200 ${
          isExpanded ? 'w-64' : 'w-10'
        }`}
      >
        <div className="relative flex-grow">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Clear error when user starts typing
                if (error) setError(undefined);
              }}
              onFocus={() => setIsExpanded(true)}
              placeholder={isExpanded ? "Zoeken..." : ""}
              className={`w-full py-1.5 pl-8 pr-2 bg-[#132F66] text-white placeholder-gray-400 rounded-md border ${
                error ? 'border-red-500' : 'border-[#1D4494]'
              } focus:outline-none focus:ring-1 ${
                error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-[#FF8B00] focus:border-[#FF8B00]'
              } transition-all duration-200 ${
                isExpanded ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Zoeken"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'search-error' : undefined}
            />
            {error && isExpanded && (
              <div
                id="search-error"
                className="absolute top-full left-0 mt-1 text-sm text-red-500 bg-[#132F66] p-1 rounded border border-red-500"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
          <div 
            className={`absolute inset-y-0 left-0 pl-2 flex items-center ${
              isExpanded ? 'pointer-events-none' : 'cursor-pointer w-full'
            }`}
            onClick={() => {
              if (!isExpanded) {
                setIsExpanded(true);
                inputRef.current?.focus();
              }
            }}
          >
            <svg
              className={`h-4 w-4 ${isExpanded ? 'text-gray-400' : 'text-white'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {isExpanded && (
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-[#132F66] border border-[#1D4494] rounded">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
}
