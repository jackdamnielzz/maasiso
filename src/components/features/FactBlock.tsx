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
      className={`fact-block rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm ${className}`}
      aria-label="Fact"
    >
      <div className="text-xs uppercase tracking-widest text-slate-500">
        {data.label}
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900">
        {data.value}
      </div>
      {data.source ? (
        <div className="mt-2 text-xs text-slate-500">
          Bron: {data.source}
        </div>
      ) : null}
    </aside>
  );
}

export default FactBlock;
