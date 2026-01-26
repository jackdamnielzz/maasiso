'use client';

import React from 'react';
import { TldrItem } from '@/lib/types';

interface TldrBlockProps {
  items?: TldrItem[];
  className?: string;
}

/**
 * Parse markdown bold (**text**) into React elements
 * @param text - Text that may contain **bold** markers
 * @returns React nodes with bold text rendered as <strong>
 */
function parseMarkdownBold(text: string): React.ReactNode {
  if (!text || !text.includes('**')) {
    return text;
  }
  
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
  );
}

/**
 * TldrBlock component displays a "TL;DR" (Too Long; Didn't Read) summary
 * Optimized for AI citation and featured snippets in search engines
 * Includes semantic markup for better crawling by AI-powered search
 */
export function TldrBlock({ items, className = '' }: TldrBlockProps) {
  // Don't render if no items provided
  if (!items || items.length === 0) {
    return null;
  }

  // Validate minimum items (spec requires 3-7)
  if (items.length < 3) {
    console.warn('[TldrBlock] Less than 3 items provided. Minimum 3 items required for optimal SEO.');
  }

  if (items.length > 7) {
    console.warn('[TldrBlock] More than 7 items provided. Maximum 7 items recommended for optimal readability.');
  }

  return (
    <aside
      className={`tldr-block bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg shadow-sm ${className}`}
      data-speakable="true"
      aria-label="Artikel samenvatting"
      role="complementary"
    >
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 m-0">
          In 30 Seconden
        </h2>
      </div>

      <ul className="space-y-3 m-0 p-0 list-none" role="list">
        {items.map((item, index) => (
          <li
            key={item.id || index}
            className="flex items-start gap-3 text-gray-800"
          >
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="flex-1 leading-relaxed">
              {parseMarkdownBold(item.point)}
            </span>
          </li>
        ))}
      </ul>

      {/* Visual indicator for voice assistants and AI readers */}
      <meta itemProp="speakable" content="true" />
    </aside>
  );
}

export default TldrBlock;
