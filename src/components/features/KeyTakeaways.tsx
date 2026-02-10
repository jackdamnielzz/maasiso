'use client';

import React from 'react';
import { KeyTakeawayItem } from '@/lib/types';

interface KeyTakeawaysProps {
  items?: KeyTakeawayItem[];
  className?: string;
  variant?: 'default' | 'home-premium';
}

export function KeyTakeaways({
  items,
  className = '',
  variant = 'default',
}: KeyTakeawaysProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const limitedItems = items.slice(0, 5);
  const isHomePremium = variant === 'home-premium';

  return (
    <aside
      className={
        isHomePremium
          ? `key-takeaways overflow-hidden rounded-2xl border border-[#d7e1ee] bg-white p-6 shadow-sm md:p-8 ${className}`
          : `key-takeaways bg-amber-50 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-lg shadow-sm ${className}`
      }
      data-speakable="true"
      aria-label="Key takeaways"
      role="complementary"
    >
      <div className={isHomePremium ? 'mb-5 flex items-center gap-3' : 'flex items-center gap-3 mb-5'}>
        <svg
          className={isHomePremium ? 'h-6 w-6 text-[#FF8B00]' : 'w-6 h-6 text-amber-600'}
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
        <h2 className={isHomePremium ? 'm-0 text-xl font-bold text-[#091E42]' : 'text-xl font-bold text-gray-900 m-0'}>
          Key Takeaways
        </h2>
      </div>

      <dl className={isHomePremium ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2'}>
        {limitedItems.map((item, index) => (
          <div
            key={item.id || index}
            className={
              isHomePremium
                ? 'rounded-xl border border-[#dce5f1] bg-[#f8fbff] px-4 py-3 transition-colors hover:border-[#0057B8]/40'
                : 'rounded-lg border border-amber-100 bg-white/70 px-4 py-3'
            }
          >
            <dt
              className={
                isHomePremium
                  ? 'text-xs uppercase tracking-wide text-[#5a6e8f]'
                  : 'text-xs uppercase tracking-wide text-gray-500'
              }
            >
              {item.title.endsWith(':') ? item.title : `${item.title}:`}
            </dt>
            <dd
              className={
                isHomePremium
                  ? 'mt-1 text-lg font-semibold text-[#163663]'
                  : 'mt-1 text-lg font-semibold text-gray-900'
              }
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export default KeyTakeaways;
