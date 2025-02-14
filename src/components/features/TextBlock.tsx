import React from 'react';
import { TextBlockComponent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { marked } from 'marked';

interface TextBlockProps {
  data: TextBlockComponent;
  className?: string;
}

export function TextBlock({ data, className }: TextBlockProps) {
  // Convert markdown to HTML
  const htmlContent = React.useMemo(() => {
    return marked(data.content || '', {
      breaks: true, // Enable line breaks
      gfm: true, // Enable GitHub Flavored Markdown
    });
  }, [data.content]);

  return (
    <div 
      className={cn(
        'prose prose-lg mx-auto max-w-4xl px-4 py-8',
        data.alignment === 'left' && 'text-left',
        data.alignment === 'center' && 'text-center',
        data.alignment === 'right' && 'text-right',
        className
      )}
    >
      <div
        className={cn(
          'prose-headings:mb-4 prose-headings:font-bold',
          'prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl',
          'prose-p:mb-4 prose-p:leading-relaxed',
          'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
          'prose-strong:font-bold',
          'prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:list-decimal prose-ol:pl-6',
          'prose-li:mb-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic'
        )}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
