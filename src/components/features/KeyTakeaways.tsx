'use client';

import React from 'react';
import { KeyTakeawayItem } from '@/lib/types';

interface KeyTakeawaysProps {
  items?: KeyTakeawayItem[];
  className?: string;
}

export function KeyTakeaways({ items, className = '' }: KeyTakeawaysProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const limitedItems = items.slice(0, 5);

  return (
    <aside
      className={`key-takeaways bg-amber-50 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-lg shadow-sm ${className}`}
      data-speakable="true"
      aria-label="Key takeaways"
      role="complementary"
    >
      <div className="flex items-center gap-3 mb-5">
        <svg
          className="w-6 h-6 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 m-0">Key Takeaways</h2>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {limitedItems.map((item, index) => (
          <div
            key={item.id || index}
            className="rounded-lg border border-amber-100 bg-white/70 px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              {item.title.endsWith(':') ? item.title : `${item.title}:`}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export default KeyTakeaways;
