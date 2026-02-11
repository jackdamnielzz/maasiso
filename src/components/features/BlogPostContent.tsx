"use client";

import React from 'react';
import Link from 'next/link';
import { BlogPost, TldrItem, RelatedPost } from '../../lib/types';
import dynamic from 'next/dynamic';
import LazyImage from '../common/LazyImage';
import ErrorBoundary from '../common/ErrorBoundary';
import ScrollToTop from '../common/ScrollToTop';
import BackToBlog from '../common/BackToBlog';
import TldrBlock from './TldrBlock';
import remarkGfm from 'remark-gfm';

const DOWNLOAD_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'csv',
  'zip',
  'rar',
  '7z',
  'txt'
]);

const isDownloadLink = (link: string | undefined): boolean => {
  if (!link) return false;

  try {
    const url = new URL(link, window.location.origin);
    const pathname = url.pathname.toLowerCase();
    const ext = pathname.split('.').pop();

    return !!ext && DOWNLOAD_EXTENSIONS.has(ext);
  } catch {
    const lowercase = link.toLowerCase();
    const ext = lowercase.split('.').pop();
    return !!ext && DOWNLOAD_EXTENSIONS.has(ext);
  }
};

const getDownloadMetadata = (link: string) => {
  try {
    const url = new URL(link, window.location.origin);
    const pathname = url.pathname;
    const filename = pathname.split('/').filter(Boolean).pop() || '';
    const ext = filename.includes('.') ? filename.split('.').pop() || '' : '';

    return {
      fileName: filename,
      fileExt: ext.toLowerCase(),
      fileUrl: url.toString()
    };
  } catch {
    const parts = link.split('/');
    const filename = parts[parts.length - 1] || '';
    const ext = filename.includes('.') ? filename.split('.').pop() || '' : '';

    return {
      fileName: filename,
      fileExt: ext.toLowerCase(),
      fileUrl: link
    };
  }
};

const pushDownloadEvent = (link: string, linkText?: string) => {
  if (typeof window === 'undefined') return;

  const analyticsEnabled = window.localStorage.getItem('analytics_enabled') === 'true';
  if (!analyticsEnabled) return;

  const { fileName, fileExt, fileUrl } = getDownloadMetadata(link);
  const pagePath = window.location.pathname;
  const contentGroup = pagePath.startsWith('/blog/') ? 'blog' : 'page';
  const postSlug = pagePath.startsWith('/blog/') ? pagePath.replace('/blog/', '') : undefined;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'file_download',
    file_name: fileName,
    file_ext: fileExt,
    file_url: fileUrl,
    link_text: linkText,
    page_path: pagePath,
    content_group: contentGroup,
    post_slug: postSlug,
    download_method: 'public_url'
  });
};

const DOWNLOAD_CTA_TARGET_SLUG = 'taak-risico-analyse-voorbeeld-excel';
const DOWNLOAD_ANCHOR_ID = 'blog-download-link';

type DownloadLinkCandidate = {
  href: string;
  label?: string;
};

const findFirstDownloadLink = (content: string): DownloadLinkCandidate | null => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)\s]+(?:\.[^)]+)?(?:\?[^)]*)?)\)/g;
  const htmlLinkRegex = /<a\s+[^>]*href=(?:"([^"]+)"|'([^']+)')[^>]*>(.*?)<\/a>/gi;

  let markdownMatch: RegExpExecArray | null = markdownLinkRegex.exec(content);
  while (markdownMatch) {
    const label = markdownMatch[1]?.trim();
    const href = markdownMatch[2]?.trim()?.replace(/^<|>$/g, '');

    if (href && isDownloadLink(href)) {
      return { href, label };
    }

    markdownMatch = markdownLinkRegex.exec(content);
  }

  let htmlMatch: RegExpExecArray | null = htmlLinkRegex.exec(content);
  while (htmlMatch) {
    const href = (htmlMatch[1] || htmlMatch[2] || '').trim();
    const label = htmlMatch[3]?.replace(/<[^>]*>/g, '').trim();

    if (href && isDownloadLink(href)) {
      return { href, label };
    }

    htmlMatch = htmlLinkRegex.exec(content);
  }

  return null;
};

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
  tldrItems?: TldrItem[];
}

export const BlogPostContent: React.FC<BlogPostContentProps> = ({ post, tldrItems }) => {
  // Use the relatedPosts from the post data directly (from database links)
  const sidebarPosts: RelatedPost[] = post.relatedPosts || [];
  const processedContent = preprocessContent(post.content);
  const enableDownloadCta = post.slug === DOWNLOAD_CTA_TARGET_SLUG;
  const downloadLinkCandidate = React.useMemo(
    () => (enableDownloadCta ? findFirstDownloadLink(processedContent) : null),
    [enableDownloadCta, processedContent]
  );

  let hasAssignedDownloadAnchor = false;

  return (
    <ErrorBoundary>
      <div className="container-custom pt-32 pb-12 flex flex-col lg:flex-row gap-12">
        <article className="flex-1 lg:px-6 relative z-0 transform-gpu">
          <Link
            href="/blog"
            className="inline-flex items-center text-[#0052CC] hover:text-[#0065FF] mb-8 mt-4 group transition-colors duration-200"
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
            <div className="flex flex-wrap items-center text-[15px] text-[#6B778C] gap-2">
              {post.publishedAt && (
                <time dateTime={post.publishedAt} className="flex items-center">
                  <span className="text-[#6B778C]/80 mr-1">Gepubliceerd:</span>
                  {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              )}
              {/* Show "Laatst bijgewerkt" only if it differs from publishedAt by at least 1 day */}
              {post.updatedAt && post.publishedAt && (() => {
                const publishedDate = new Date(post.publishedAt);
                const updatedDate = new Date(post.updatedAt);
                const diffInDays = Math.abs(updatedDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
                
                if (diffInDays >= 1) {
                  return (
                    <>
                      <span className="text-[#091E42]/40">|</span>
                      <time dateTime={post.updatedAt} className="flex items-center">
                        <span className="text-[#6B778C]/80 mr-1">Bijgewerkt:</span>
                        {updatedDate.toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </>
                  );
                }
                return null;
              })()}
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

          {/* TL;DR Section - positioned after featured image and before intro */}
          {tldrItems && tldrItems.length > 0 && (
            <TldrBlock items={tldrItems} className="mb-8" />
          )}

          {downloadLinkCandidate && (
            <div className="mb-10">
              <a
                href={`#${DOWNLOAD_ANCHOR_ID}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0052CC] px-6 py-3 text-[1rem] font-semibold text-white no-underline shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0747A6] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0065FF]"
              >
                Direct naar de download
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 14a1 1 0 01-1-1V6.414L6.707 8.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 11-1.414 1.414L11 6.414V13a1 1 0 01-1 1zM4 16a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
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
                a: ({ node, ...props }) => {
                  const href = typeof props.href === 'string' ? props.href : undefined;
                  const isDownload = isDownloadLink(href);
                  const isStyledDownload = enableDownloadCta && isDownload;
                  const assignDownloadAnchor = isStyledDownload && !hasAssignedDownloadAnchor;

                  if (assignDownloadAnchor) {
                    hasAssignedDownloadAnchor = true;
                  }

                  return (
                    <a
                      {...props}
                      id={assignDownloadAnchor ? DOWNLOAD_ANCHOR_ID : props.id}
                      className={
                        isStyledDownload
                          ? 'my-4 inline-flex items-center gap-2 rounded-lg border border-[#0052CC]/20 bg-[#E9F2FF] px-5 py-3 font-semibold text-[#0052CC] no-underline shadow-sm transition-all duration-200 hover:bg-[#D6E8FF] hover:text-[#0747A6] hover:no-underline hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0065FF] scroll-mt-32'
                          : 'text-[#0052CC] hover:text-[#0065FF] hover:underline transition-colors duration-200'
                      }
                      onClick={(event) => {
                        props.onClick?.(event);

                        if (event.defaultPrevented) return;
                        if (isDownload) {
                          const linkText = typeof props.children === 'string' ? props.children : undefined;
                          pushDownloadEvent(String(props.href), linkText);
                        }
                      }}
                    >
                      {props.children}
                      {isStyledDownload && (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M10 14a1 1 0 01-1-1V6.414L6.707 8.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 11-1.414 1.414L11 6.414V13a1 1 0 01-1 1zM4 16a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </a>
                  );
                },
                hr: ({ node, ...props }) => <hr {...props} className="my-12 border-t border-[#DFE1E6]" />
              }}
            >
              {processedContent}
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
              {sidebarPosts.length === 0 && (
                <p className="text-[#6B778C] text-sm italic">
                  Geen gerelateerde artikelen beschikbaar.
                </p>
              )}
              {sidebarPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block group px-6 py-4 -mx-6 transition-all duration-200 hover:bg-[#F8F9FA]/50 first:pt-0 last:pb-0"
                >
                  {relatedPost.featuredImage && (
                    <div className="relative aspect-[2/1] w-full mb-4 overflow-hidden">
                      <LazyImage
                        src={
                          relatedPost.featuredImage.url.startsWith('http')
                            ? relatedPost.featuredImage.url
                            : `/api/proxy/assets/uploads/${relatedPost.featuredImage.url.split('/uploads/').pop()}`
                        }
                        alt={relatedPost.featuredImage.alternativeText || relatedPost.title}
                        fill
                        className="object-cover transition-all duration-200 group-hover:scale-102 group-hover:brightness-102"
                      />
                    </div>
                  )}
                  <h3 className="text-[1.125rem] font-medium text-[#172B4D] group-hover:text-[#0052CC] line-clamp-2 leading-snug transition-colors duration-200">
                    {relatedPost.title}
                  </h3>
                  {relatedPost.publishedAt && (
                    <div className="flex items-center mt-3 text-sm text-[#6B778C]">
                      <time dateTime={relatedPost.publishedAt}>{new Date(relatedPost.publishedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
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
