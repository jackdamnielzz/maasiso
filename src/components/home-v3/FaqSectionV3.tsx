"use client";

import { useState } from "react";

interface FaqItem {
  vraag: string;
  antwoord: string;
}

interface FaqSectionV3Props {
  faqItems: readonly FaqItem[];
}

export function FaqSectionV3({ faqItems }: FaqSectionV3Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <article id="faq">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0057B8]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">
          Veelgestelde vragen
        </span>
        <h2 className="mt-5 text-4xl font-extrabold text-[#091E42] md:text-5xl">
          Heeft u een vraag?
        </h2>
        <p className="mt-5 mx-auto max-w-2xl text-xl text-gray-600 leading-relaxed">
          Hieronder vindt u antwoorden op de meest gestelde vragen over ISO-certificering en onze dienstverlening.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white transition-all duration-300 hover:shadow-lg"
          >
            {/* Question button */}
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <span className="text-lg font-bold text-[#091E42] pr-8">{item.vraag}</span>
              <span className={`absolute right-6 top-1/2 -translate-y-1/2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0057B8]/10 text-[#0057B8] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent mb-4" />
                <p className="text-base leading-relaxed text-gray-600">{item.antwoord}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
