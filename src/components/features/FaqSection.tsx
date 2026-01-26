'use client';

import React, { useState } from 'react';
import { FaqItem } from '@/lib/types';

interface FaqSectionProps {
  items?: FaqItem[];
  className?: string;
}

/**
 * FaqSection component displays frequently asked questions
 * Optimized for:
 * - People Also Ask (PAA) boxes in Google
 * - FAQPage schema.org structured data
 * - Voice assistant queries
 * - AI-powered search engines
 */
export function FaqSection({ items, className = '' }: FaqSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // Don't render if no items provided
  if (!items || items.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section
      className={`faq-section my-12 ${className}`}
      aria-labelledby="faq-heading"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <h2
        id="faq-heading"
        className="text-3xl font-bold text-gray-900 mb-6"
      >
        Veelgestelde Vragen
      </h2>

      <div className="space-y-4">
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          const itemId = `faq-item-${index}`;
          const answerId = `faq-answer-${index}`;

          return (
            <div
              key={item.id || index}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              {/* Question Button */}
              <button
                id={itemId}
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="w-full px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <span itemProp="name" className="pr-8">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer Panel */}
              <div
                id={answerId}
                role="region"
                aria-labelledby={itemId}
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen ? 'max-h-96' : 'max-h-0'
                }`}
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div
                    itemProp="text"
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden metadata for FAQ schema (also rendered via SchemaMarkup component) */}
      <meta itemProp="mainContentOfPage" content="true" />
    </section>
  );
}

export default FaqSection;
