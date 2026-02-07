'use client';

import React from 'react';
import { FactBlock as FactBlockType } from '@/lib/types';

interface FactBlockProps {
  data: FactBlockType;
  className?: string;
}

type SourceItem = {
  href?: string;
  label: string;
  isLink: boolean;
};

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function toReadableDomainLabel(hostname: string): string {
  const normalized = hostname.replace(/^www\./i, '').toLowerCase();
  const aliases: Record<string, string> = {
    'iso.org': 'ISO',
    'nen.nl': 'NEN',
    'nationaalarchief.nl': 'Nationaal Archief',
  };

  if (aliases[normalized]) {
    return aliases[normalized];
  }

  const firstSegment = normalized.split('.')[0] || normalized;
  if (!firstSegment) {
    return normalized;
  }

  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
}

function toSourceItem(rawSource: string): SourceItem | null {
  const trimmed = rawSource.trim();
  if (!trimmed) return null;

  if (!isLikelyUrl(trimmed)) {
    return {
      label: trimmed,
      isLink: false,
    };
  }

  try {
    const parsed = new URL(trimmed);
    return {
      href: parsed.toString(),
      label: toReadableDomainLabel(parsed.hostname),
      isLink: true,
    };
  } catch {
    return {
      label: trimmed,
      isLink: false,
    };
  }
}

function normalizeSources(source: FactBlockType['source']): SourceItem[] {
  if (!source) return [];

  const rawValues = Array.isArray(source)
    ? source
    : String(source)
      .split(/[\n,;]/g)
      .map((item) => item.trim())
      .filter(Boolean);

  return rawValues.map(toSourceItem).filter((item): item is SourceItem => item !== null);
}

export function FactBlock({ data, className = '' }: FactBlockProps) {
  if (!data || (!data.label && !data.value)) {
    return null;
  }

  const sources = normalizeSources(data.source);

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
          {sources.length > 0 ? (
            <div className="mt-3 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
              <span>Bron: </span>
              {sources.map((source, index) => (
                <React.Fragment key={`${source.label}-${index}`}>
                  {index > 0 ? <span>, </span> : null}
                  {source.isLink && source.href ? (
                    <a
                      href={source.href}
                      className="text-[#00875A] underline underline-offset-2 hover:text-[#006B47]"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export default FactBlock;
