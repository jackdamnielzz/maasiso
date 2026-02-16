import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { getIconForFeature } from '@/lib/utils/iconMapper';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { KeyTakeaways } from '@/components/features/KeyTakeaways';
import { FactBlock } from '@/components/features/FactBlock';
import { FaqSection } from '@/components/features/FaqSection';
import SchemaMarkup from '@/components/ui/SchemaMarkup';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Page } from '@/lib/types';
import { getCanonicalSiteUrl } from '@/lib/url/canonicalSiteUrl';

type AuthorityPageContentProps = {
  layout?: NonNullable<Page['layout']>;
  heroFallbackImage?: Page['featuredImage'];
  testId?: string;
  featureGridTitleFallback?: string;
  featureGridTestId?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  dataTopic?: string;
  showIso9001LeadSnippet?: boolean;
};

type LayoutBlock = NonNullable<Page['layout']>[number] & Record<string, any>;

type CtaCandidate = {
  id: string;
  sourceComponent: 'hero' | 'button';
  originalIndex: number;
  title?: string;
  description?: string;
  text: string;
  link: string;
  style?: 'primary' | 'secondary';
  explicitPrimary: boolean;
};

const isDebugLoggingEnabled =
  process.env.NODE_ENV !== 'production' || process.env.MAASISO_DEBUG === '1';
const MARKDOWN_HEADING_REGEX = /^#{1,6}\s+/;
const EXPERT_QUOTE_HEADING_REGEX = /^#{1,6}\s*expertquote\b/i;

function toNonEmptyString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function hasHeroCta(block: LayoutBlock): boolean {
  if (block.__component !== 'page-blocks.hero') return false;
  const text = toNonEmptyString(block?.ctaButton?.text);
  const link = toNonEmptyString(block?.ctaButton?.link);
  return Boolean(text && link);
}

function isButtonCta(block: LayoutBlock): boolean {
  if (block.__component !== 'page-blocks.button') return false;
  const text = toNonEmptyString(block?.text || block?.ctaButton?.text);
  const link = toNonEmptyString(block?.link || block?.ctaButton?.link);
  return Boolean(text && link);
}

function isExplicitPrimaryCta(block: LayoutBlock): boolean {
  return Boolean(
    block?.isPrimary ||
      block?.primary ||
      block?.ctaButton?.isPrimary ||
      block?.ctaButton?.primary
  );
}

function collectCtaCandidates(
  layout: NonNullable<Page['layout']>
): { layoutWithoutCta: NonNullable<Page['layout']>; primaryCta?: CtaCandidate } {
  const layoutWithoutCta: LayoutBlock[] = [];
  const candidates: CtaCandidate[] = [];
  const contentAfterFirstCta: Array<{ id: string; component: string; index: number }> = [];
  let firstCtaIndex = -1;

  layout.forEach((block, index) => {
    const current = block as LayoutBlock;

    if (hasHeroCta(current)) {
      if (firstCtaIndex === -1) firstCtaIndex = index;
      candidates.push({
        id: String(current.id || `hero-cta-${index}`),
        sourceComponent: 'hero',
        originalIndex: index,
        text: toNonEmptyString(current.ctaButton?.text),
        link: toNonEmptyString(current.ctaButton?.link),
        style: current.ctaButton?.style,
        explicitPrimary: isExplicitPrimaryCta(current),
      });

      layoutWithoutCta.push({
        ...current,
        ctaButton: undefined,
      });
      return;
    }

    if (isButtonCta(current)) {
      if (firstCtaIndex === -1) firstCtaIndex = index;
      candidates.push({
        id: String(current.id || `button-cta-${index}`),
        sourceComponent: 'button',
        originalIndex: index,
        title: toNonEmptyString(current.title) || undefined,
        description: toNonEmptyString(current.description) || undefined,
        text: toNonEmptyString(current.text || current.ctaButton?.text),
        link: toNonEmptyString(current.link || current.ctaButton?.link),
        style: current.style || current.ctaButton?.style,
        explicitPrimary: isExplicitPrimaryCta(current),
      });
      return;
    }

    if (firstCtaIndex !== -1) {
      contentAfterFirstCta.push({
        id: String(current.id || index),
        component: String(current.__component || 'unknown'),
        index,
      });
    }

    layoutWithoutCta.push(current);
  });

  const explicitPrimary = candidates.filter((candidate) => candidate.explicitPrimary);
  const primaryCta =
    explicitPrimary.length > 0
      ? explicitPrimary[explicitPrimary.length - 1]
      : candidates[candidates.length - 1];

  if (isDebugLoggingEnabled && contentAfterFirstCta.length > 0) {
    console.warn('[CTA Order Violation] Content found after CTA in source layout. CTA rendered at page end.', {
      firstCtaIndex,
      violatingBlocks: contentAfterFirstCta,
    });
  }

  if (isDebugLoggingEnabled && candidates.length > 1 && primaryCta) {
    console.warn('[CTA Deduplication] Multiple CTAs detected. Rendering only one primary CTA.', {
      candidateCount: candidates.length,
      selectedCta: primaryCta,
    });
  }

  return {
    layoutWithoutCta: layoutWithoutCta as NonNullable<Page['layout']>,
    primaryCta,
  };
}

function normalizeExpertQuoteMarkdown(content: string): string {
  const normalized = String(content || '').replace(/\r\n/g, '\n');
  if (!normalized) return normalized;

  const lines = normalized.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (!EXPERT_QUOTE_HEADING_REGEX.test(lines[index].trim())) continue;

    let cursor = index + 1;
    while (cursor < lines.length && lines[cursor].trim() === '') {
      cursor += 1;
    }

    if (cursor >= lines.length || MARKDOWN_HEADING_REGEX.test(lines[cursor].trim())) {
      return normalized;
    }

    const quoteLines: string[] = [];
    while (cursor < lines.length) {
      const currentLine = lines[cursor].trim();
      if (!currentLine) {
        cursor += 1;
        if (quoteLines.length > 0) break;
        continue;
      }
      if (MARKDOWN_HEADING_REGEX.test(currentLine) || /^[-—]\s+/.test(currentLine)) {
        break;
      }
      quoteLines.push(currentLine);
      cursor += 1;
    }

    while (cursor < lines.length && lines[cursor].trim() === '') {
      cursor += 1;
    }

    if (quoteLines.length === 0 || cursor >= lines.length) {
      return normalized;
    }

    const attributionLine = lines[cursor].trim();
    if (!/^[-—]\s+/.test(attributionLine)) {
      return normalized;
    }

    const attribution = attributionLine.replace(/^[-—]\s+/, '').trim();
    if (!attribution) {
      return normalized;
    }

    const replacement = [
      ...lines.slice(0, index + 1),
      '',
      `> ${quoteLines.join(' ')}`,
      '>',
      `> — ${attribution}`,
      ...lines.slice(cursor + 1),
    ];

    return replacement.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  return normalized;
}

function toTextContent(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(toTextContent).join('');
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return toTextContent(element.props?.children);
  }
  return '';
}

function parseMarkdownBold(text: string): React.ReactNode {
  if (!text) return text;

  const normalized = text.replace(/__(.*?)__/g, '**$1**');
  if (!normalized.includes('**')) return normalized;

  const parts = normalized.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part));
}

const groupFactBlocks = (layout: NonNullable<Page['layout']> = []) => {
  const grouped: Array<NonNullable<Page['layout']>[number] | { __component: 'page-blocks.fact-block-group'; id: string; items: any[] }> = [];
  let factGroup: any[] = [];

  layout.forEach((block) => {
    if (block?.__component === 'page-blocks.fact-block') {
      factGroup.push(block);
      return;
    }

    if (factGroup.length) {
      grouped.push({
        __component: 'page-blocks.fact-block-group',
        id: `fact-block-group-${factGroup[0]?.id ?? grouped.length}`,
        items: factGroup
      });
      factGroup = [];
    }

    grouped.push(block);
  });

  if (factGroup.length) {
    grouped.push({
      __component: 'page-blocks.fact-block-group',
      id: `fact-block-group-${factGroup[0]?.id ?? grouped.length}`,
      items: factGroup
    });
  }

  return grouped;
};

export default function AuthorityPageContent({
  layout = [],
  heroFallbackImage,
  testId,
  featureGridTitleFallback = 'De stappen',
  featureGridTestId,
  breadcrumbs,
  showBreadcrumbs = true,
  dataTopic,
  showIso9001LeadSnippet = false,
}: AuthorityPageContentProps) {
  const { layoutWithoutCta, primaryCta } = collectCtaCandidates(layout);
  const layoutBlocks = groupFactBlocks(layoutWithoutCta);
  const siteUrl = getCanonicalSiteUrl();
  const breadcrumbSchemaItems = breadcrumbs?.length
    ? breadcrumbs.map((item) => ({
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`
    }))
    : null;

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid={testId} data-topic={dataTopic}>
      {breadcrumbSchemaItems ? (
        <>
          <SchemaMarkup breadcrumbs={{ items: breadcrumbSchemaItems }} />
          {showBreadcrumbs ? (
            <div className="bg-white/80 border-b border-slate-200">
              <div className="container-custom px-4 sm:px-6 lg:px-8 py-3">
                <Breadcrumbs items={breadcrumbs ?? []} />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {layoutBlocks.map((block: any, index: number) => {
        const blockKey = `${block?.__component ?? 'block'}-${block?.id ?? 'x'}-${index}`;
        switch (block.__component) {
          case 'page-blocks.hero': {
            const resolvedHeroImage =
              block?.backgroundImage?.url
                ? block.backgroundImage
                : heroFallbackImage;
            const heroImageSrc =
              resolvedHeroImage?.url
                ? getImageUrl(resolvedHeroImage, 'large')
                : null;
            const heroImageAlt =
              resolvedHeroImage?.alternativeText ||
              resolvedHeroImage?.name ||
              block?.title ||
              'Hero afbeelding';
            return (
              <section key={blockKey} className="hero-section relative overflow-hidden bg-[#091E42]">
                {heroImageSrc ? (
                  <>
                    <Image
                      src={heroImageSrc}
                      alt={heroImageAlt}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#091E42]/70"></div>
                  </>
                ) : null}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                  <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
                </div>
                <div className="container-custom relative z-10">
                  <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 md:mb-6 text-white drop-shadow-lg">
                      {block.title}
                    </h1>
                    {block.subtitle && (
                      <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                        {parseMarkdownBold(String(block.subtitle))}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          case 'page-blocks.key-takeaways':
            return (
              <section key={blockKey} className="pt-12 pb-10 md:pt-16 md:pb-14 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <KeyTakeaways items={block.items} className="max-w-5xl mx-auto" />
                  {showIso9001LeadSnippet && (
                    <div className="mt-10 max-w-5xl mx-auto rounded-xl border border-emerald-100 bg-emerald-50 p-7 text-center">
                      <h3 className="text-lg font-bold text-[#091E42]">
                        Wil je weten wat ISO 9001 voor jouw organisatie betekent?
                      </h3>
                      <p className="mt-3 text-gray-700">
                        Plan een vrijblijvend kennismakingsgesprek. We bellen binnen 1 werkdag terug.
                      </p>
                      <p className="mt-4 text-[#091E42]">
                        <a
                          href="/contact?source=key_takeaways"
                          className="font-semibold text-[#00875A] underline hover:text-[#006B47]"
                        >
                          Plan gesprek
                        </a>
                        {' '}→ Of bel direct:{' '}
                        <a
                          href="tel:+31623578344"
                          className="font-semibold text-[#00875A] underline hover:text-[#006B47]"
                        >
                          +31 6 23 57 83 44
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );

          case 'page-blocks.fact-block-group': {
            if (!block.items || block.items.length === 0) {
              return null;
            }
            const factCount = block.items.length;
            const isSingle = factCount === 1;
            const wrapperClass = isSingle ? 'max-w-3xl mx-auto' : '';
            const gridClass = isSingle
              ? 'relative grid grid-cols-1 place-items-center gap-6 sm:gap-8 md:gap-10'
              : 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10';
            const itemBaseClass = isSingle ? 'w-full max-w-sm' : 'w-full';
            return (
              <section key={blockKey} className="py-14 md:py-24 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto text-center mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42]">Kernfeiten</h2>
                  </div>
                  <div
                    className={`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 px-6 py-8 md:px-12 md:py-12 shadow-md ${wrapperClass}`}
                  >
                    <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-[#00875A]/10 blur-3xl"></div>
                    <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-[#FF8B00]/10 blur-3xl"></div>
                    <div className={`${gridClass} min-w-0`}>
                      {block.items.map((fact: any, index: number) => {
                        return (
                          <div key={fact.id || index} className={`${itemBaseClass} min-w-0`}>
                            <FactBlock data={fact} className="h-full" index={index} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'page-blocks.text-block':
            const normalizedTextBlockContent = normalizeExpertQuoteMarkdown(
              String(block.content || '')
            );
            const textBlockId = block.id === 'kosten-sectie' ? 'kosten-sectie' : undefined;
            return (
              <section key={blockKey} id={textBlockId} className="py-16 md:py-28">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-14 max-w-5xl mx-auto relative hover:shadow-xl transition-all duration-300">
                    <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
                    <div className="p-8 md:p-12">
                      <div className="absolute top-8 right-8 md:top-12 md:right-12 opacity-10 pointer-events-none">
                        <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={`space-y-10 relative z-10 text-${block.alignment || 'left'}`}>
                        <ReactMarkdown
                          className="prose prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:my-6 max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-[#00875A] prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md"
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            table: ({ node, ...props }) => (
                              <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] text-sm" {...props} />
                              </div>
                            ),
                            img: ({ node, src, alt, ...props }) => {
                              const imageSource =
                                typeof src === 'string' ? getImageUrl(src, 'large') : '/placeholder-blog.jpg';
                              return (
                                <img
                                  src={imageSource}
                                  alt={alt || ''}
                                  className="h-auto w-full rounded-xl border border-slate-200/80 shadow-sm"
                                  loading="lazy"
                                  {...props}
                                />
                              );
                            },
                            blockquote: ({ node, children, ...props }) => {
                              const blockChildren = React.Children.toArray(children);
                              let citeText = '';
                              let shouldRenderCite = false;

                              if (blockChildren.length > 0) {
                                const lastChild = blockChildren[blockChildren.length - 1];
                                const lastChildText = toTextContent(lastChild).trim();
                                const citeMatch = lastChildText.match(/^[—-]\s*(.+)$/);

                                if (citeMatch?.[1]) {
                                  citeText = citeMatch[1].trim();
                                  blockChildren.pop();
                                  shouldRenderCite = true;
                                }
                              }

                              if (!citeText) {
                                const aggregatedText = blockChildren.map((child) => toTextContent(child)).join('\n');
                                const attributionLine = aggregatedText
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean)
                                  .reverse()
                                  .find((line) => /^[-—]\s+/.test(line));

                                if (attributionLine) {
                                  citeText = attributionLine.replace(/^[-—]\s+/, '').trim();
                                  // The attribution line is already visible in markdown content.
                                  // Avoid rendering a second, duplicate citation.
                                  shouldRenderCite = false;
                                }
                              }

                              return (
                                <blockquote
                                  {...props}
                                  className="my-8 border-l-4 border-[#00875A] pl-5 italic text-slate-700"
                                >
                                  {blockChildren}
                                  {shouldRenderCite && citeText ? (
                                    <cite className="mt-3 block text-sm not-italic font-medium text-slate-600">
                                      — {citeText}
                                    </cite>
                                  ) : null}
                                </blockquote>
                              );
                            },
                          }}
                        >
                          {normalizedTextBlockContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.feature-grid': {
            const features = Array.isArray(block.features) ? block.features : [];
            return (
              <section key={blockKey} className="py-16 md:py-28 bg-[#F8FAFC]">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  {features.length > 0 ? (
                    <>
                      <div className="text-center mb-12 md:mb-14">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 md:mb-4">
                          {block.title || (features.length > 0 ? `De ${features.length} stappen` : featureGridTitleFallback)}
                        </h2>
                        <div className="w-16 md:w-20 h-1 bg-[#00875A] mx-auto rounded-full"></div>
                        {block.subtitle && (
                          <p className="text-gray-600 text-center max-w-2xl mx-auto mt-4 md:mt-6 text-sm sm:text-base">
                            {block.subtitle}
                          </p>
                        )}
                      </div>
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8"
                        data-testid={featureGridTestId}
                      >
                        {features.map((feature: any, index: number) => {
                          const candidateIconUrl = feature.icon?.url
                            ? getImageUrl(feature.icon, 'small')
                            : '';
                          const iconUrl = candidateIconUrl && candidateIconUrl !== '/placeholder-blog.jpg'
                            ? candidateIconUrl
                            : getIconForFeature(feature.title || '');
                          const iconAlt = feature.icon?.alternativeText || feature.title || 'Stap icoon';
                          const content = feature.description?.trim() || `Wij bieden professionele begeleiding en advies voor ${feature.title}.`;
                          const isFiveSteps = features.length === 5;
                          const offsetClass =
                            isFiveSteps && index === 3
                              ? 'lg:col-start-2'
                              : isFiveSteps && index === 4
                                ? 'lg:col-start-4'
                                : '';
                          const card = (
                            <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span className="inline-flex items-center rounded-full bg-[#00875A]/10 text-[#00875A] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                                    Stap {index + 1}
                                  </span>
                                  <h3 className="mt-3 md:mt-4 text-base md:text-lg font-semibold text-[#091E42]">
                                    {feature.title || 'Stap'}
                                  </h3>
                                </div>
                                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                                  <img
                                    src={iconUrl}
                                    alt={iconAlt}
                                    className="h-5 w-5 md:h-6 md:w-6 object-contain"
                                  />
                                </div>
                              </div>
                              <div className="mt-5 text-gray-600">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkBreaks]}
                                  className="prose prose-sm max-w-none text-gray-600"
                                >
                                  {content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          );

                          return (
                            <div
                              key={feature.id || index}
                              className={`lg:col-span-2 ${offsetClass}`}
                            >
                              {feature.link ? (
                                <a href={feature.link} className="block h-full">
                                  {card}
                                </a>
                              ) : (
                                card
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-8">
                      <div className="w-20 h-1 bg-[#00875A] mx-auto"></div>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          case 'page-blocks.faq-section':
            return (
              <section key={blockKey} className="py-16 md:py-28 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    <FaqSection items={block.items} />
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.button':
            return null;

          default:
            return null;
        }
      })}
      {primaryCta ? (
        <section
          className="relative overflow-hidden bg-[#091E42] text-white py-14 md:py-24"
          data-cta-final="true"
          data-cta-source={primaryCta.sourceComponent}
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
          </div>
          <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-tight">
                {primaryCta.title || 'Klaar om de volgende stap te zetten?'}
              </h2>
              {primaryCta.description ? (
                <p className="text-sm sm:text-base md:text-lg text-white/85 mb-6 md:mb-8 leading-relaxed">
                  {parseMarkdownBold(primaryCta.description)}
                </p>
              ) : null}
              <a
                href={primaryCta.link || '/contact'}
                className="primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {primaryCta.text || 'Neem contact op'}
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
