'use client';

import { BlogPost } from '@/lib/types';
import LazyImage from '../common/LazyImage';
import ErrorBoundary from '../common/ErrorBoundary';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface BlogPostContentProps {
  post: BlogPost;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(true);
  const [imageProcessingError, setImageProcessingError] = useState<string | null>(null);

  // Memoize header content
  const headerContent = useMemo(() => (
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-[#091E42] mb-4 leading-tight">
        {post.title}
      </h1>
      
      <div className="flex items-center text-[#091E42]/70 text-base space-x-4">
        {post.author && (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            {post.author}
          </span>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        )}
      </div>

      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.categories.map((category) => (
            <span
              key={category.id}
              className="px-3 py-1 text-[#091E42]/70 text-sm"
            >
              {category.name}
            </span>
          ))}
        </div>
      )}
    </header>
  ), [post.title, post.author, post.publishedAt, post.categories]);

  // Memoize featured image
  const featuredImage = useMemo(() => {
    if (!post.featuredImage?.url) return null;

    return (
      <ErrorBoundary
        fallback={
          <div className="w-full h-[400px] mb-8 bg-gray-100 flex items-center justify-center text-gray-500">
            Kon de afbeelding niet laden
          </div>
        }
      >
        <div className="relative w-full h-[250px] mb-6">
          <LazyImage
            src={post.featuredImage.url}
            alt={post.featuredImage.alternativeText || post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className="object-cover rounded-lg shadow-md"
            quality={90}
          />
        </div>
      </ErrorBoundary>
    );
  }, [post.featuredImage, post.title]);

  // Process content images after render
  const processImages = useCallback(() => {
    if (!contentRef.current) return;

    try {
      setIsProcessingImages(true);
      setImageProcessingError(null);

      // Find all img tags in the content
      const images = contentRef.current.getElementsByTagName('img');
      Array.from(images).forEach((img) => {
        const parent = img.parentElement;
        if (!parent) {
          throw new Error('Image element has no parent');
        }

        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'relative w-full h-[400px] my-6';

        // Create new LazyImage container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'relative w-full h-full';

        // Move img attributes to wrapper
        const src = img.src.replace(process.env.NEXT_PUBLIC_ASSET_PREFIX || '', '');
        if (!src) {
          throw new Error('Image source is missing');
        }

        imageContainer.setAttribute('data-src', src);
        imageContainer.setAttribute('data-alt', img.alt);

        // Replace original img with wrapper
        wrapper.appendChild(imageContainer);
        parent.replaceChild(wrapper, img);

        // Create and mount LazyImage component
        const lazyImage = document.createElement('img');
        lazyImage.src = src;
        lazyImage.alt = img.alt;
        lazyImage.className = 'object-contain w-full h-full';
        lazyImage.loading = 'lazy'; // Enable native lazy loading
        lazyImage.decoding = 'async'; // Enable async decoding
        lazyImage.onerror = () => {
          throw new Error(`Failed to load image: ${src}`);
        };
        imageContainer.appendChild(lazyImage);
      });
    } catch (error) {
      console.error('Error processing images:', error);
      setImageProcessingError(error instanceof Error ? error.message : 'Failed to process images');
    } finally {
      setIsProcessingImages(false);
    }
  }, []);

  // Process content: remove duplicate title and clean up spacing
  const processedContent = useMemo(() => {
    // Remove title if it matches post title
    const titlePattern = new RegExp(`^\\s*#\\s*${post.title}\\s*\\n`);
    const contentWithoutTitle = post.content.replace(titlePattern, '');
    
    // Replace <br> tags with proper spacing
    return contentWithoutTitle
      .replace(/<br>\s*\n/g, '\n') // Replace <br> followed by newline with single newline
      .replace(/<br>/g, '\n\n') // Replace remaining <br> with double newline
      .replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with double newline
  }, [post.content, post.title]);

  useEffect(() => {
    const timeoutId = setTimeout(processImages, 0);
    return () => clearTimeout(timeoutId);
  }, [processedContent, processImages]);

  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('BlogPostContent error:', error);
      }}
    >
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white mb-8">
        {/* Featured Image */}
        {featuredImage}

        {/* Image Processing Error */}
        {imageProcessingError && (
          <div className="mb-8 p-4 rounded-lg bg-yellow-50 text-yellow-800">
            <p className="text-sm">
              Waarschuwing: {imageProcessingError}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isProcessingImages && (
          <div className="mb-8 p-4 rounded-lg bg-blue-50 text-blue-800">
            <p className="text-sm">Afbeeldingen worden geladen...</p>
          </div>
        )}

        {/* Post Header */}
        {headerContent}

        {/* Post Content */}
        <ErrorBoundary
          fallback={
            <div className="p-4 rounded-lg bg-red-50 text-red-800">
              <h2 className="text-lg font-semibold mb-2">Kon de inhoud niet laden</h2>
              <p className="text-sm">Er is een fout opgetreden bij het laden van de blog post inhoud.</p>
            </div>
          }
        >
          <div
            ref={contentRef}
            className="prose prose-lg max-w-none text-[#091E42]/90
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 first:prose-h1:mt-0
              prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-[#091E42]
              prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-[#091E42]/90
              prose-h4:text-xl prose-h4:mb-4 prose-h4:mt-6 prose-h4:text-[#091E42]/80
              prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg prose-p:text-[#091E42]/80
              prose-li:mb-2 prose-li:text-lg prose-li:text-[#091E42]/80 prose-li:leading-relaxed
              prose-ul:mb-6 prose-ul:mt-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:mb-6 prose-ol:mt-4 prose-ol:list-decimal prose-ol:pl-6
              prose-blockquote:my-8 prose-blockquote:pl-4 prose-blockquote:border-l-4 prose-blockquote:border-[#091E42]/20 prose-blockquote:text-lg prose-blockquote:text-[#091E42]/70
              [&>*:first-child]:mt-0
              space-y-6"
          >
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 {...props} className="text-4xl font-bold mb-6 mt-8 leading-tight" />,
                h2: ({ node, ...props }) => <h2 {...props} className="text-3xl font-bold mb-4 mt-6 leading-tight" />,
                h3: ({ node, ...props }) => <h3 {...props} className="text-2xl font-bold mb-3 mt-5 leading-tight" />,
                h4: ({ node, ...props }) => <h4 {...props} className="text-xl font-bold mb-2 mt-4 leading-tight" />,
                p: ({ node, ...props }) => <p {...props} className="mb-4 leading-relaxed text-lg text-[#091E42]/80" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4 space-y-2 text-lg text-[#091E42]/80" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4 space-y-2 text-lg text-[#091E42]/80" />,
                li: ({ node, ...props }) => <li {...props} className="mb-2 leading-relaxed" />,
                table: ({ node, ...props }) => <table {...props} className="w-full my-6 border-collapse" />,
                thead: ({ node, ...props }) => <thead {...props} className="bg-gray-50" />,
                th: ({ node, ...props }) => <th {...props} className="px-4 py-2 text-left font-semibold text-[#091E42]" />,
                td: ({ node, ...props }) => <td {...props} className="px-4 py-2 text-[#091E42]/80" />,
                pre: ({ node, ...props }) => <pre {...props} className="bg-gray-50 p-4 my-4 overflow-x-auto" />,
                code: ({ node, ...props }) => <code {...props} className="font-mono text-base text-[#091E42]/90" />,
                blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-[#091E42]/20 pl-4 my-6 text-lg text-[#091E42]/70 leading-relaxed" />,
                a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline transition-colors duration-200" />,
                hr: ({ node, ...props }) => <hr {...props} className="my-6" />
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </ErrorBoundary>
      </article>
    </ErrorBoundary>
  );
}
