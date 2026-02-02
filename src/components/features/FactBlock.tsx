'use client';

import React from 'react';
import { FactBlock as FactBlockType } from '@/lib/types';

interface FactBlockProps {
  data: FactBlockType;
  className?: string;
}

export function FactBlock({ data, className = '' }: FactBlockProps) {
  if (!data || (!data.label && !data.value)) {
    return null;
  }

  return (
    <aside
      className={`fact-block group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}
      aria-label="Fact"
      lang="nl"
    >
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00875A]/10 blur-2xl"></div>
      <div className="absolute -left-10 -bottom-12 h-28 w-28 rounded-full bg-[#FF8B00]/10 blur-2xl"></div>
      <div className="relative flex items-start gap-4">
        <span className="mt-1 h-3 w-3 rounded-full bg-gradient-to-br from-[#00875A] to-[#FF8B00] shadow-sm"></span>
        <div>
          <div className="text-base md:text-lg font-semibold text-[#091E42] leading-snug break-words hyphens-auto">
            {data.label}
          </div>
          <div className="mt-2 text-sm md:text-base text-slate-700 leading-relaxed break-words hyphens-auto">
            {data.value}
          </div>
          {data.source ? (
            <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
              Bron: {data.source}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export default FactBlock;
