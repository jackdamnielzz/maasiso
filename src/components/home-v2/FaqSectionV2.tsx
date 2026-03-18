'use client';

import { useState } from 'react';

interface FaqItem {
  readonly vraag: string;
  readonly antwoord: string;
}

interface FaqSectionV2Props {
  faqItems: readonly FaqItem[];
}

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        isOpen
          ? 'border-[#0057B8]/30 bg-white shadow-md'
          : 'border-[#e2e8f0] bg-white hover:border-[#0057B8]/20 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className={`text-lg font-semibold transition-colors ${isOpen ? 'text-[#0057B8]' : 'text-[#091E42]'}`}>
          {item.vraag}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? 'bg-[#0057B8] text-white rotate-180'
              : 'bg-[#f0f4f8] text-[#091E42]'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">
            <div className="h-px bg-gradient-to-r from-[#0057B8]/20 via-[#0057B8]/10 to-transparent mb-5" />
            <p className="leading-relaxed text-gray-600">{item.antwoord}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSectionV2({ faqItems }: FaqSectionV2Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <article id="faq">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-purple-700">
          FAQ
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-[#091E42] md:text-4xl">
          Veelgestelde vragen
        </h2>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {faqItems.map((item, index) => (
          <FaqAccordion
            key={item.vraag}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </article>
  );
}
