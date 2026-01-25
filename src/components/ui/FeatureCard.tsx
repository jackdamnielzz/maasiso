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
      className={`relative flex flex-col h-full group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-[#00875A]/5 rounded-full transition-transform duration-700 group-hover:scale-[3]"></div>
      
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00875A] to-[#FF8B00] transform -translate-y-full transition-transform duration-500 group-hover:translate-y-0"></div>

      {/* Card content */}
      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Icon wrapper */}
        {icon && (
          <div className="mb-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 transition-all duration-500 group-hover:bg-white group-hover:shadow-lg group-hover:-translate-y-1">
            <div className="transform transition-transform duration-500 group-hover:scale-110">
              {icon}
            </div>
          </div>
        )}

        {/* Text content */}
        <div className="flex-grow">
          <h3 className="text-2xl font-extrabold text-[#091E42] mb-4 transition-colors duration-300 group-hover:text-[#00875A]">
            {title}
          </h3>
          <div className="prose prose-slate text-gray-600">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              className="line-clamp-4 leading-relaxed"
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer info */}
        {showMoreInfo && (
          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center text-[#00875A] font-bold text-sm uppercase tracking-wider">
            <span>Ontdek deze dienst</span>
            <svg
              className="ml-3 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}
      </div>
    </a>
  );
};

export default FeatureCard;