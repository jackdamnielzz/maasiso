import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

type CoreMarkdownProps = {
  markdown: string;
  className?: string;
};

export default function CoreMarkdown({ markdown, className }: CoreMarkdownProps) {
  return (
    <ReactMarkdown
      className={
        className ||
        'prose prose-headings:text-[#091E42] prose-headings:font-bold prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-p:leading-relaxed max-w-none'
      }
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        // Core pages: headings are owned by the template, not by CMS content.
        h1: ({ node, ...props }) => <p {...props} />,
        h2: ({ node, ...props }) => <p {...props} />,
        h3: ({ node, ...props }) => <p {...props} />,
        h4: ({ node, ...props }) => <p {...props} />,
        h5: ({ node, ...props }) => <p {...props} />,
        h6: ({ node, ...props }) => <p {...props} />,
        table: ({ node, ...props }) => (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm" {...props} />
          </div>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

