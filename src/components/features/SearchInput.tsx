'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';

const SearchInput: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return searchParams?.get('search') || '';
    } catch (e) {
      console.error('Error accessing search params:', e);
      return '';
    }
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      startTransition(() => {
        try {
          const params = new URLSearchParams(searchParams?.toString() || '');
          if (value) {
            params.set('search', value);
          } else {
            params.delete('search');
           }
           params.delete('page'); // Reset to first page on new search
           router.replace(`/kennis/blog?${params.toString()}`);
         } catch (e) {
           console.error('Error updating search params:', e);
         }
      });
    }, 300),
    [searchParams, router]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Zoek in blog..."
        value={searchTerm}
        onChange={handleSearchChange}
        className={`w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isPending ? 'opacity-70' : ''
        }`}
        disabled={isPending}
        aria-label="Search blog"
      />
    </div>
  );
};

export default SearchInput;
