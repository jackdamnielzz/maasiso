'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateUrlParam, createSafeUrl } from '@/lib/validation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onHover?: (page: number) => void;
}

// Validate pagination props
function validatePaginationProps(props: PaginationProps): void {
  if (props.currentPage < 1) {
    throw new Error('Current page must be greater than 0');
  }
  if (props.totalPages < 1) {
    throw new Error('Total pages must be greater than 0');
  }
  if (props.currentPage > props.totalPages) {
    throw new Error('Current page cannot be greater than total pages');
  }
}

export default function Pagination({ currentPage, totalPages, onHover }: PaginationProps) {
  // Validate props
  validatePaginationProps({ currentPage, totalPages, onHover });
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback((page: number) => {
    // Validate page number
    if (page < 1 || page > totalPages) {
      console.warn('Invalid page number:', page);
      return;
    }

    // Create a new params object with validated values
    const currentParams = new URLSearchParams(searchParams?.toString() || '');
    const validatedParams: Record<string, string> = {};
    
    // Add validated page number
    validatedParams.page = page.toString();
    
    // Copy over other existing params after validation
    for (const [key, value] of currentParams.entries()) {
      if (key !== 'page') {
        const validation = validateUrlParam(value);
        if (validation.isValid) {
          validatedParams[key] = validation.sanitized;
        }
      }
    }
    
    // Create safe URL with validated parameters
    const safeUrl = createSafeUrl(window.location.pathname, validatedParams);
    router.push(safeUrl);
  }, [router, searchParams, totalPages]);

  // Handle hover for prefetching with validation
  const handleHover = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && onHover && page !== currentPage) {
      onHover(page);
    }
  }, [onHover, currentPage, totalPages]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate start and end of visible pages
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if at the start
    if (currentPage <= 3) {
      end = 4;
    }

    // Adjust if at the end
    if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex justify-center mt-8" aria-label="Pagination">
      <ul className="flex items-center space-x-2">
        {/* Previous button */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#091E42] hover:bg-[#091E42]/5'
            }`}
            aria-label="Previous page"
          >
            ←
          </button>
        </li>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {typeof page === 'number' ? (
              <button
                onClick={() => handlePageChange(page)}
                onMouseEnter={() => handleHover(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-[#FF8B00] text-white'
                    : 'text-[#091E42] hover:bg-[#091E42]/5'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span className="px-3 py-1 text-sm text-gray-500">...</span>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#091E42] hover:bg-[#091E42]/5'
            }`}
            aria-label="Next page"
          >
            →
          </button>
        </li>
      </ul>
    </nav>
  );
}
