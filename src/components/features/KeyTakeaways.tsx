'use client';

import React from 'react';
import { KeyTakeawayItem } from '@/lib/types';

interface KeyTakeawaysProps {
  items?: KeyTakeawayItem[];
  className?: string;
  variant?: 'default' | 'iso9001';
}

export function KeyTakeaways({ items, className = '', variant = 'default' }: KeyTakeawaysProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const limitedItems = items.slice(0, 5);
  const isIso9001 = variant === 'iso9001';
  const wrapperClass = isIso9001
    ? 'key-takeaways overflow-hidden rounded-2xl border border-[#dceaf8] bg-[linear-gradient(152deg,#ffffff_0%,#f8fbff_58%,#f3faf7_100%)] p-6 shadow-[0_16px_38px_rgba(9,30,66,0.08)] md:p-8'
    : 'key-takeaways bg-amber-50 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-lg shadow-sm';
  const labelClass = isIso9001
    ? 'text-[11px] uppercase tracking-[0.12em] text-slate-500'
    : 'text-xs uppercase tracking-wide text-gray-500';
  const valueClass = isIso9001
    ? 'mt-1 text-xl font-semibold leading-tight text-[#091E42]'
    : 'mt-1 text-lg font-semibold text-gray-900';
  const itemClass = isIso9001
    ? 'rounded-xl border border-[#d7e5f4] bg-white/90 px-4 py-4 shadow-[0_8px_20px_rgba(9,30,66,0.06)]'
    : 'rounded-lg border border-amber-100 bg-white/70 px-4 py-3';

  return (
    <aside
      className={`${wrapperClass} ${className}`}
      data-speakable="true"
      aria-label="Key takeaways"
      role="complementary"
    >
      <div className="mb-5 flex items-center gap-3">
        <svg
          className={`h-6 w-6 ${isIso9001 ? 'text-[#00875A]' : 'text-amber-600'}`}
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
            className={itemClass}
          >
            <dt className={labelClass}>
              {item.title.endsWith(':') ? item.title : `${item.title}:`}
            </dt>
            <dd className={valueClass}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export default KeyTakeaways;
