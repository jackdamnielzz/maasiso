"use client";

import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '@/lib/api';
import Link from 'next/link';
import { BlogPost } from '../../lib/types';
import dynamic from 'next/dynamic';
import LazyImage from '../common/LazyImage';
import ErrorBoundary from '../common/ErrorBoundary';
import ScrollToTop from '../common/ScrollToTop';
import BackToBlog from '../common/BackToBlog';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false
});

function preprocessContent(content: string): string {
  const contentWithoutTitle = content
    .replace(/^# .+?\n\n/, '')
    .replace(/<br>/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return contentWithoutTitle;
}

interface BlogPostContentProps {
  post: BlogPost;
}

export const BlogPostContent: React.FC<BlogPostContentProps> = ({ post }) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const { posts } = await getBlogPosts(1, 3);
        setRelatedPosts(posts.filter(p => p.slug !== post.slug));
      } catch (error) {
        console.error('Error fetching related posts:', error);
      }
    };

    fetchRelatedPosts();
  }, [post.slug]);

  return (
    <ErrorBoundary>
      <div className="container-custom pt-32 pb-12 flex flex-col lg:flex-row gap-12">
        <article className="flex-1 lg:px-6 relative z-0 transform-gpu">
          <Link
            href="/blog"
            className="inline-flex items-center text-[#0052CC] hover:text-[#0065FF] mb-12 mt-4 group transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Terug naar Blog
          </Link>
          
          <header className="mb-16">
            <h1 className="text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold text-[#091E42] mb-8 leading-[1.2] break-words hyphens-auto max-w-[90%]">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center text-[15px] text-[#6B778C] space-x-2">
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              {post.author && (
                <>
                  <span className="text-[#091E42]/40">•</span>
                  <span className="font-medium">
                    {typeof post.author === 'string' ? post.author : post.author.name}
                  </span>
                </>
              )}
            </div>
          </header>

          {post.featuredImage && (
            <div className="relative aspect-[2/1] w-full mb-10 rounded-lg overflow-hidden shadow-lg">
              <LazyImage
                src={
                  post.featuredImage.url.startsWith('http')
                    ? post.featuredImage.url
                    : `/api/proxy/assets/uploads/${post.featuredImage.url.split('/uploads/').pop()}`
                }
                alt={post.featuredImage.alternativeText || post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none text-[#42526E] relative z-0
 overflow-hidden
            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#172B4D]
            prose-h1:text-[2.25rem] prose-h1:mb-12 prose-h1:mt-16 first:prose-h1:mt-0
 prose-h1:break-words
            prose-h2:text-[1.75rem] prose-h2:mb-8 prose-h2:mt-14
            prose-h3:text-[1.5rem] prose-h3:mb-6 prose-h3:mt-12
            prose-h4:text-[1.25rem] prose-h4:mb-6 prose-h4:mt-10
            prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[1.125rem]
            prose-li:mb-3 prose-li:text-[1.125rem] prose-li:leading-[1.8]
            prose-ul:mb-8 prose-ul:mt-6 prose-ul:list-disc prose-ul:pl-8
            prose-ol:mb-8 prose-ol:mt-6 prose-ol:list-decimal prose-ol:pl-8
            prose-blockquote:my-10 prose-blockquote:pl-6 prose-blockquote:border-l-4 prose-blockquote:border-[#DFE1E6] prose-blockquote:text-[1.125rem] prose-blockquote:text-[#42526E] prose-blockquote:italic
            [&>*:first-child]:mt-0
            space-y-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 {...props} className="text-[2.25rem] font-semibold mb-12 mt-16 leading-[1.2] text-[#172B4D] break-words" />,
                h2: ({ node, ...props }) => <h2 {...props} className="text-[1.75rem] font-semibold mb-8 mt-14 leading-[1.3] text-[#172B4D] break-words" />,
                h3: ({ node, ...props }) => <h3 {...props} className="text-[1.5rem] font-semibold mb-6 mt-12 leading-[1.3] text-[#172B4D] break-words" />,
                h4: ({ node, ...props }) => <h4 {...props} className="text-[1.25rem] font-semibold mb-6 mt-10 leading-[1.4] text-[#172B4D] break-words" />,
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
              {preprocessContent(post.content)}
            </ReactMarkdown>
          </div>
        </article>

        {/* Related Posts Sidebar */}
        <aside className="w-full lg:w-96 space-y-8">
          <div className="bg-gradient-to-b from-[#F8F9FA] to-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm">
            <h2 className="text-[1.25rem] font-semibold text-[#172B4D] mb-6">
              Gerelateerde artikelen
            </h2>
            <div className="space-y-8">
              {relatedPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block group px-6 py-4 -mx-6 transition-all duration-200 hover:bg-[#F8F9FA]/50 first:pt-0 last:pb-0"
                >
                  {post.featuredImage && (
                    <div className="relative aspect-[2/1] w-full mb-4 overflow-hidden">
                      <LazyImage
                        src={
                          post.featuredImage.url.startsWith('http')
                            ? post.featuredImage.url
                            : `/api/proxy/assets/uploads/${post.featuredImage.url.split('/uploads/').pop()}`
                        }
                        alt={post.featuredImage.alternativeText || post.title}
                        fill
                        className="object-cover transition-all duration-200 group-hover:scale-102 group-hover:brightness-102"
                      />
                    </div>
                  )}
                  <h3 className="text-[1.125rem] font-medium text-[#172B4D] group-hover:text-[#0052CC] line-clamp-2 leading-snug transition-colors duration-200">
                    {post.title}
                  </h3>
                  {post.publishedAt && (
                    <div className="flex items-center mt-3 text-sm text-[#6B778C]">
                      <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <ScrollToTop />
      <BackToBlog />
    </ErrorBoundary>
  );
};

export default BlogPostContent;
