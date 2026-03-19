"use client";

import { useState } from "react";

interface FaqItem {
  vraag: string;
  antwoord: string;
}

interface FaqMinimalProps {
  faqItems: readonly FaqItem[];
}

export function FaqMinimal({ faqItems }: FaqMinimalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Veelgestelde vragen
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Heeft u een vraag?
        </h2>

        <div className="mt-14 divide-y divide-gray-200">
          {faqItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-8 text-base font-medium text-gray-900">
                  {item.vraag}
                </span>
                <span
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIndex === index ? "rotate-45" : ""
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index
                    ? "max-h-[500px] pb-5 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm leading-relaxed text-gray-500">
                  {item.antwoord}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
