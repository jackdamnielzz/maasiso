"use client";

import React, { useState } from 'react';

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  title: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const extractHeadings = (markdown: string): TocItem[] => {
    const headingRegex = /(?:\*\*(Artikel\s+\d+[:.][^*]+)\*\*|^##\s+(\d+\.\s+[^\n]+)|^##\s+([^\n]+))/gm;
    const headings: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const title = (match[1] || match[2] || match[3]).trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (title) {
        headings.push({ id, title });
      }
    }

    return headings;
  };

  const headings = extractHeadings(content);
  const [collapsed, setCollapsed] = useState(true);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="bg-white rounded-lg shadow-lg p-8 mb-8" aria-label="Table of contents">
      <button
        type="button"
        className="flex items-center w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 mb-4"
        aria-expanded={!collapsed}
        aria-controls="toc-list"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <span className="text-2xl font-semibold text-[#172B4D] flex-1">Inhoudsopgave</span>
        <svg
          className={`w-6 h-6 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="sr-only">{collapsed ? 'Toon inhoudsopgave' : 'Verberg inhoudsopgave'}</span>
      </button>
      {!collapsed && (
        <ul id="toc-list" className="space-y-4">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className="text-[1.125rem]"
            >
              <a
                href={`#${heading.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                {heading.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default TableOfContents;