"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TableOfContents from './TableOfContents';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false
});

interface MarkdownContentProps {
  content: string;
}

const proseClasses = [
  'prose prose-lg max-w-none text-[#42526E] relative z-0',
  'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#172B4D]',
  'prose-h1:text-[2.25rem] prose-h1:mb-12 prose-h1:mt-16 first:prose-h1:mt-0',
  'prose-h2:text-[1.75rem] prose-h2:mb-8 prose-h2:mt-14',
  'prose-h3:text-[1.5rem] prose-h3:mb-6 prose-h3:mt-12',
  'prose-h4:text-[1.25rem] prose-h4:mb-6 prose-h4:mt-10',
  'prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[1.125rem]',
  'prose-li:mb-3 prose-li:text-[1.125rem] prose-li:leading-[1.8]',
  'prose-ul:mb-8 prose-ul:mt-6 prose-ul:list-disc prose-ul:pl-8',
  'prose-ol:mb-8 prose-ol:mt-6 prose-ol:list-decimal prose-ol:pl-8',
  'prose-blockquote:my-10 prose-blockquote:pl-6 prose-blockquote:border-l-4 prose-blockquote:border-[#DFE1E6]',
  'prose-blockquote:text-[1.125rem] prose-blockquote:text-[#42526E] prose-blockquote:italic',
  '[&>*:first-child]:mt-0',
  'space-y-8'
].join(' ');

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const addIdToHeading = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Process the content to convert article headers to proper h2 elements
  const processedContent = content.replace(
    /\*\*(Artikel\s+\d+[:.][^*]+)\*\*/g,
    (_, title) => `## ${title}`
  );

  return (
    <>
      <div className={proseClasses}>
        <ReactMarkdown
          components={{
            h1: ({ node, children, ...props }) => {
              const id = addIdToHeading(children as string);
              return <h1 id={id} {...props} className="text-[2.25rem] font-semibold mb-12 mt-16 leading-[1.2] text-[#172B4D]">{children}</h1>;
            },
            h2: ({ node, children, ...props }) => {
              const id = addIdToHeading(children as string);
              return <h2 id={id} {...props} className="text-[1.75rem] font-semibold mb-8 mt-14 leading-[1.3] text-[#172B4D] scroll-mt-24">{children}</h2>;
            },
            h3: ({ node, children, ...props }) => {
              const id = addIdToHeading(children as string);
              return <h3 id={id} {...props} className="text-[1.5rem] font-semibold mb-6 mt-12 leading-[1.3] text-[#172B4D] scroll-mt-24">{children}</h3>;
            },
            h4: ({ node, children, ...props }) => {
              const id = addIdToHeading(children as string);
              return <h4 id={id} {...props} className="text-[1.25rem] font-semibold mb-6 mt-10 leading-[1.4] text-[#172B4D] scroll-mt-24">{children}</h4>;
            },
            p: ({ node, ...props }) => <p {...props} className="mb-8 leading-[1.8] text-[1.125rem] text-[#42526E]" />,
            ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-8 mb-8 space-y-3 text-[1.125rem] text-[#42526E]" />,
            ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-8 mb-8 space-y-3 text-[1.125rem] text-[#42526E]" />,
            li: ({ node, ...props }) => <li {...props} className="mb-3 leading-[1.8]" />,
            table: ({ node, ...props }) => <table {...props} className="w-full my-8 border-collapse bg-white rounded-lg overflow-hidden shadow-sm border border-[#DFE1E6]" />,
            thead: ({ node, ...props }) => <thead {...props} className="bg-[#F4F5F7] border-b border-[#DFE1E6]" />,
            th: ({ node, ...props }) => <th {...props} className="px-6 py-3 text-left font-semibold text-[#172B4D]" />,
            td: ({ node, ...props }) => <td {...props} className="px-6 py-4 text-[#42526E] border-b border-[#DFE1E6]" />,
            pre: ({ node, ...props }) => <pre {...props} className="bg-[#F4F5F7] p-6 my-6 overflow-x-auto rounded-lg" />,
            code: ({ node, ...props }) => <code {...props} className="font-mono text-[1rem] text-[#42526E]" />,
            blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-[#DFE1E6] pl-6 my-10 text-[1.125rem] text-[#42526E] leading-[1.8] italic" />,
            a: ({ node, ...props }) => <a {...props} className="text-[#0052CC] hover:text-[#0065FF] hover:underline transition-colors duration-200" />,
            hr: ({ node, ...props }) => <hr {...props} className="my-12 border-t border-[#DFE1E6]" />
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default MarkdownContent;