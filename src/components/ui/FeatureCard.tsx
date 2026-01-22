'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface FeatureCardProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
  showMoreInfo?: boolean;
  link?: string | null;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  content,
  icon,
  showMoreInfo = false,
  link,
  className = '',
}) => {
  return (
    <a
      href={link || '#'}
      className={`block group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}
    >
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00] rounded-t-lg"></div>

      {/* Card content */}
      <div className="p-6 md:p-8 flex flex-col items-center text-center">
        {/* Icon */}
        {icon && (
          <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-[#091E42] mb-4 group-hover:text-[#00875A] transition-colors duration-200">
          {title}
        </h3>

        {/* Content */}
        <div className="prose prose-sm md:prose-base text-center">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            className="text-gray-600 line-clamp-3"
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Call to action button */}
        {showMoreInfo && link && (
          <div className="mt-4 w-full">
            <div className="inline-flex items-center justify-center px-6 py-3 bg-[#00875A] text-white rounded-lg font-medium transition-all duration-200 group-hover:bg-[#006C48] group-hover:shadow-md">
              Lees meer over {title}
              <svg
                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </a>
  );
};

export default FeatureCard;