'use client';

import React from 'react';
import { FactBlock as FactBlockType } from '@/lib/types';

interface FactBlockProps {
  data: FactBlockType;
  className?: string;
  index?: number;
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

function formatFactIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function FactBlock({ data, className = '', index }: FactBlockProps) {
  if (!data || (!data.label && !data.value)) {
    return null;
  }

  const sources = normalizeSources(data.source);
  const factIndex = typeof index === 'number' ? formatFactIndex(index) : null;

  return (
    <aside
      className={`fact-block group relative h-full overflow-hidden rounded-3xl border border-[#d7e3ef] bg-[linear-gradient(155deg,#ffffff_0%,#f7fbff_58%,#f3faf7_100%)] p-7 md:p-8 shadow-[0_10px_30px_rgba(9,30,66,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(9,30,66,0.12)] ${className}`}
      aria-label="Fact"
      lang="nl"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00875A] via-[#1AA77A] to-[#FF8B00]"></div>
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00875A]/10 blur-2xl"></div>
      <div className="absolute -left-10 -bottom-12 h-28 w-28 rounded-full bg-[#FF8B00]/10 blur-2xl"></div>

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#091E42]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#091E42]/75">
            <span className="h-2 w-2 rounded-full bg-[#00875A]"></span>
            Kernfeit
          </span>
          {factIndex ? (
            <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold tracking-[0.18em] text-slate-500">
              {factIndex}
            </span>
          ) : null}
        </div>

        <h3 className="mt-5 text-lg md:text-xl font-bold leading-tight text-[#091E42] break-words hyphens-auto">
          {data.label}
        </h3>

        <p className="mt-5 text-base md:text-[1.12rem] font-medium text-slate-700 leading-relaxed break-words hyphens-auto">
          {data.value}
        </p>

        {sources.length > 0 ? (
          <div className="mt-6 border-t border-slate-200/80 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Bron
            </p>
            <p className="mt-1 text-sm text-slate-600 leading-snug break-words">
              {sources.map((source, sourceIndex) => (
                <React.Fragment key={`${source.label}-${sourceIndex}`}>
                  {sourceIndex > 0 ? <span className="text-slate-400"> • </span> : null}
                  {source.isLink && source.href ? (
                    <a
                      href={source.href}
                      className="text-[#0066cc] underline underline-offset-2 hover:text-[#004F99]"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export default FactBlock;
