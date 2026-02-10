'use client';

import React, { useState } from 'react';
import { FaqItem } from '@/lib/types';

interface FaqSectionProps {
  items?: FaqItem[];
  className?: string;
  variant?: 'default' | 'home-premium';
}

/**
 * Parse markdown bold (**text**) into React elements
 * @param text - Text that may contain **bold** markers
 * @returns React nodes with bold text rendered as <strong>
 */
function parseMarkdownBold(text: string): React.ReactNode {
  if (!text) {
    return text;
  }

  const normalized = text.replace(/__(.*?)__/g, '**$1**');
  if (!normalized.includes('**')) {
    return normalized;
  }
  
  const parts = normalized.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
  );
}

/**
 * Convert markdown bold (**text**) to HTML bold (<strong>text</strong>)
 * Used for dangerouslySetInnerHTML contexts
 * @param text - Text that may contain **bold** markers
 * @returns Text with <strong> HTML tags instead of ** markers
 */
function markdownBoldToHtml(text: string): string {
  if (!text) {
    return text;
  }

  const normalized = text.replace(/__(.*?)__/g, '**$1**');
  if (!normalized.includes('**')) {
    return normalized;
  }
  
  return normalized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * FaqSection component displays frequently asked questions
 * Optimized for:
 * - People Also Ask (PAA) boxes in Google
 * - FAQPage schema.org structured data
 * - Voice assistant queries
 * - AI-powered search engines
 */
export function FaqSection({
  items,
  className = '',
  variant = 'default',
}: FaqSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const isHomePremium = variant === 'home-premium';

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
      className={isHomePremium ? `faq-section ${className}` : `faq-section my-12 ${className}`}
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className={
          isHomePremium
            ? 'mb-6 text-2xl font-bold text-[#091E42] md:text-3xl'
            : 'text-3xl font-bold text-gray-900 mb-6'
        }
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
              className={
                isHomePremium
                  ? 'overflow-hidden rounded-xl border border-[#dce5f1] bg-white transition-all duration-200 hover:border-[#0057B8]/40 hover:shadow-sm'
                  : 'border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md'
              }
            >
              {/* Question Button */}
              <button
                id={itemId}
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className={
                  isHomePremium
                    ? 'flex w-full items-center justify-between px-6 py-4 text-left font-medium text-[#163663] transition-colors duration-150 hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#0057B8] focus:ring-inset'
                    : 'w-full px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                }
              >
                <span className="pr-8">
                  {parseMarkdownBold(item.question)}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                    isHomePremium ? 'text-[#5a6e8f]' : 'text-gray-500'
                  } ${
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
              >
                <div
                  className={
                    isHomePremium
                      ? 'border-t border-[#dce5f1] bg-[#f8fbff] px-6 py-4'
                      : 'px-6 py-4 bg-gray-50 border-t border-gray-200'
                  }
                >
                  <div
                    className={
                      isHomePremium
                        ? 'prose prose-sm max-w-none leading-relaxed text-[#3e5374]'
                        : 'text-gray-700 leading-relaxed prose prose-sm max-w-none'
                    }
                    dangerouslySetInnerHTML={{ __html: markdownBoldToHtml(item.answer) }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FaqSection;
