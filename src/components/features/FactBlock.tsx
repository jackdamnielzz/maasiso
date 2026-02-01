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
      className={`fact-block rounded-xl bg-white/70 px-5 py-4 md:px-6 md:py-5 border border-slate-100 ${className}`}
      aria-label="Fact"
    >
      <div className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">
        {data.label}
      </div>
      <div className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900 leading-snug">
        {data.value}
      </div>
      {data.source ? (
        <div className="mt-3 text-[0.7rem] text-slate-400">
          Bron: {data.source}
        </div>
      ) : null}
    </aside>
  );
}

export default FactBlock;
