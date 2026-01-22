'use client';

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current filter values with error handling
  const getCurrentParam = (key: string) => {
    try {
      return searchParams?.get(key) || undefined;
    } catch (e) {
      console.error(`Error accessing search param ${key}:`, e);
      return undefined;
    }
  };

  const currentType = getCurrentParam("type");
  const currentSort = getCurrentParam("sort") || "relevance";
  const dateFrom = getCurrentParam("dateFrom");
  const dateTo = getCurrentParam("dateTo");

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(() => {
        try {
          const params = new URLSearchParams(searchParams?.toString() || '');
          
          // Update provided parameters
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined) {
              params.delete(key);
            } else {
              params.set(key, value);
            }
          });

          // Reset to page 1 when changing filters
          params.set("page", "1");

          router.push(`${window.location.pathname}?${params.toString()}`);
        } catch (e) {
          console.error('Error updating search params:', e);
        }
      });
    },
    [router, searchParams]
  );

  return (
    <div className={`space-y-4 bg-white rounded-lg shadow-lg p-4 mb-6 ${isPending ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#091E42]">Zoekfilters</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-[#091E42]/70 hover:text-[#091E42]"
          disabled={isPending}
        >
          {isExpanded ? "Minder filters" : "Meer filters"}
        </button>
      </div>

      <div className="grid gap-4">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-[#091E42] mb-1">
            Content type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateSearchParams({ type: undefined })}
              className={`px-3 py-1 text-sm rounded-md ${
                !currentType
                  ? "bg-[#091E42] text-white"
                  : "bg-gray-100 text-[#091E42] hover:bg-gray-200"
              }`}
              disabled={isPending}
            >
              Alles
            </button>
            <button
              onClick={() => updateSearchParams({ type: "blog" })}
              className={`px-3 py-1 text-sm rounded-md ${
                currentType === "blog"
                  ? "bg-[#091E42] text-white"
                  : "bg-gray-100 text-[#091E42] hover:bg-gray-200"
              }`}
              disabled={isPending}
            >
              Blog
            </button>
            <button
              onClick={() => updateSearchParams({ type: "news" })}
              className={`px-3 py-1 text-sm rounded-md ${
                currentType === "news"
                  ? "bg-[#091E42] text-white"
                  : "bg-gray-100 text-[#091E42] hover:bg-gray-200"
              }`}
              disabled={isPending}
            >
              Nieuws
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Date Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dateFrom"
                  className="block text-sm font-medium text-[#091E42] mb-1"
                >
                  Datum vanaf
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFrom || ""}
                  onChange={(e) =>
                    updateSearchParams({ dateFrom: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#091E42]"
                  disabled={isPending}
                />
              </div>
              <div>
                <label
                  htmlFor="dateTo"
                  className="block text-sm font-medium text-[#091E42] mb-1"
                >
                  Datum tot
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateTo || ""}
                  onChange={(e) =>
                    updateSearchParams({ dateTo: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#091E42]"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-medium text-[#091E42] mb-1"
              >
                Sorteren op
              </label>
              <select
                id="sort"
                value={currentSort}
                onChange={(e) => updateSearchParams({ sort: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#091E42]"
                disabled={isPending}
              >
                <option value="relevance">Relevantie</option>
                <option value="date">Datum (nieuwste eerst)</option>
                <option value="title">Titel (A-Z)</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
