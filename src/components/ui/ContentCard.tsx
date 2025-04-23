import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

type ContentCardProps = {
  title?: string;
  content: string;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
  alignment?: 'left' | 'center' | 'right';
  animate?: boolean;
};

/**
 * ContentCard component creates visually distinct content cards for text blocks
 * It supports markdown content, custom icons, and animations
 */
const ContentCard: React.FC<ContentCardProps> = ({
  title,
  content,
  icon,
  accentColor = '#00875A',
  className = '',
  alignment = 'left',
  animate = true
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-xl transition-all duration-300 ${
        animate ? 'transform hover:-translate-y-1' : ''
      } ${className}`}
      data-testid="content-card"
      style={{
        minHeight: '400px',
        maxHeight: '500px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      {/* Top accent bar with gradient */}
      <div
        className="h-1.5 bg-gradient-to-r"
        style={{
          backgroundImage: `linear-gradient(to right, ${accentColor}, #FF8B00)`
        }}
      ></div>
      
      <div className="p-8 h-full overflow-auto">
        {/* Background decorative icon */}
        {icon ? (
          <div className="absolute top-12 right-12 opacity-10 pointer-events-none">
            {icon}
          </div>
        ) : (
          <div className="absolute top-12 right-12 opacity-10 pointer-events-none">
            <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        
        <div className={`space-y-4 relative z-10 text-${alignment}`}>
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[#091E42] mb-4">
              {title}
            </h2>
          )}
          
          <div className="overflow-auto">
            <ReactMarkdown
              className="prose prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:my-4 max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-[#00875A] prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md"
              remarkPlugins={[remarkGfm, remarkBreaks]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;