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
  visualVariant?: 'default' | 'home-premium';
};

type LayoutBlock = NonNullable<Page['layout']>[number] & Record<string, any>;
type QuickNavItem = {
  id: string;
  label: string;
};

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
  visualVariant = 'default',
}: AuthorityPageContentProps) {
  const { layoutWithoutCta, primaryCta } = collectCtaCandidates(layout);
  const layoutBlocks = groupFactBlocks(layoutWithoutCta);
  const isHomePremium = visualVariant === 'home-premium';
  const siteUrl = getCanonicalSiteUrl();
  const breadcrumbSchemaItems = breadcrumbs?.length
    ? breadcrumbs.map((item) => ({
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`
    }))
    : null;
  const quickNavItems: QuickNavItem[] = [];

  if (isHomePremium) {
    if (layoutBlocks.some((block: any) => block?.__component === 'page-blocks.key-takeaways')) {
      quickNavItems.push({ id: 'key-takeaways', label: 'Key Takeaways' });
    }
    if (layoutBlocks.some((block: any) => block?.__component === 'page-blocks.fact-block-group')) {
      quickNavItems.push({ id: 'kernfeiten', label: 'Kernfeiten' });
    }
    if (layoutBlocks.some((block: any) => block?.__component === 'page-blocks.text-block')) {
      quickNavItems.push({ id: 'uitleg', label: 'Uitleg' });
    }
    if (layoutBlocks.some((block: any) => block?.__component === 'page-blocks.feature-grid')) {
      quickNavItems.push({ id: 'stappenplan', label: 'Stappenplan' });
    }
    if (layoutBlocks.some((block: any) => block?.__component === 'page-blocks.faq-section')) {
      quickNavItems.push({ id: 'faq', label: 'FAQ' });
    }
  }

  let hasRenderedTextBlockAnchor = false;
  let hasRenderedFeatureGridAnchor = false;

  return (
    <main
      className={
        isHomePremium
          ? 'relative isolate flex-1 overflow-hidden bg-[#f3f6fb] text-[#091E42]'
          : 'flex-1 bg-gradient-to-b from-blue-50 to-white'
      }
      data-testid={testId}
      data-topic={dataTopic}
    >
      {isHomePremium ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#0057B8]/15 blur-3xl" />
          <div className="absolute right-[-8rem] top-[35rem] h-[24rem] w-[24rem] rounded-full bg-[#FF8B00]/20 blur-3xl" />
        </div>
      ) : null}
      {breadcrumbSchemaItems ? (
        <>
          <SchemaMarkup breadcrumbs={{ items: breadcrumbSchemaItems }} />
          {showBreadcrumbs ? (
            <div
              className={
                isHomePremium
                  ? 'border-b border-[#d6deea] bg-white/90 backdrop-blur'
                  : 'bg-white/80 border-b border-slate-200'
              }
            >
              <div className="container-custom px-4 sm:px-6 lg:px-8 py-3">
                <Breadcrumbs items={breadcrumbs ?? []} />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {isHomePremium && quickNavItems.length > 0 ? (
        <nav
          aria-label="Sectienavigatie"
          className="sticky top-[80px] z-30 border-y border-[#d6deea] bg-white/90 backdrop-blur"
        >
          <div className="container-custom px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5a6e8f]">Snel naar</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {quickNavItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="inline-flex whitespace-nowrap rounded-full border border-[#cfdae8] bg-white px-3 py-1.5 text-sm font-medium text-[#1a3763] transition hover:border-[#0057B8] hover:text-[#0057B8]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
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
              <section
                key={blockKey}
                className={
                  isHomePremium
                    ? 'hero-section relative overflow-hidden bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#0f4177]'
                    : 'hero-section relative overflow-hidden bg-[#091E42]'
                }
              >
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
                    <div className={isHomePremium ? 'absolute inset-0 bg-[#091E42]/65' : 'absolute inset-0 bg-[#091E42]/70'}></div>
                  </>
                ) : null}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className={isHomePremium ? 'absolute top-0 right-0 h-96 w-96 rounded-full bg-[#0057B8] opacity-15 -mr-20 -mt-20 blur-xl' : 'absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow'}></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                  <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
                </div>
                <div className="container-custom relative z-10">
                  <div className="text-center">
                    {isHomePremium ? (
                      <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
                        ISO-certificering
                      </span>
                    ) : null}
                    <h1 className={isHomePremium ? 'mb-5 mt-6 text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl' : 'text-3xl sm:text-4xl md:text-5xl font-bold mb-5 md:mb-6 text-white drop-shadow-lg'}>
                      {block.title}
                    </h1>
                    {block.subtitle && (
                      <p className={isHomePremium ? 'mx-auto mb-6 max-w-3xl text-base text-white/90 sm:text-lg md:mb-8 md:text-xl' : 'text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto'}>
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
              <section
                id={isHomePremium ? 'key-takeaways' : undefined}
                key={blockKey}
                className={
                  isHomePremium
                    ? '!py-0 bg-transparent'
                    : 'pt-8 pb-4 md:pt-12 md:pb-8 bg-white'
                }
              >
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <KeyTakeaways
                    items={block.items}
                    className={isHomePremium ? 'mx-auto max-w-5xl py-12 md:py-16' : 'max-w-5xl mx-auto'}
                    variant={isHomePremium ? 'home-premium' : 'default'}
                  />
                </div>
              </section>
            );

          case 'page-blocks.fact-block-group': {
            if (!block.items || block.items.length === 0) {
              return null;
            }
            const factCount = block.items.length;
            const isSingle = factCount === 1;
            const remainder = factCount % 4;
            const shouldCenterLast = remainder === 1 && factCount > 4;
            const shouldCenterLastTwo = remainder === 2 && factCount > 4;
            const wrapperClass = isSingle ? 'max-w-3xl mx-auto' : '';
            const gridClass = isSingle
              ? 'relative grid grid-cols-1 place-items-center gap-4 sm:gap-6 md:gap-8'
              : 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8';
            const itemBaseClass = isSingle ? 'w-full max-w-sm' : 'w-full';
            return (
              <section
                id={isHomePremium ? 'kernfeiten' : undefined}
                key={blockKey}
                className={isHomePremium ? '!py-0 bg-transparent' : 'py-10 md:py-16 bg-white'}
              >
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className={isHomePremium ? 'mx-auto mb-6 max-w-4xl pt-12 text-center md:mb-8 md:pt-16' : 'max-w-4xl mx-auto text-center mb-6 md:mb-8'}>
                    <h2 className={isHomePremium ? 'text-2xl font-bold text-[#091E42] sm:text-3xl md:text-4xl' : 'text-2xl sm:text-3xl font-bold text-[#091E42]'}>
                      Kernfeiten
                    </h2>
                  </div>
                  <div
                    className={`relative overflow-hidden ${isHomePremium ? 'rounded-2xl border border-[#d7e1ee] bg-white px-5 py-6 shadow-sm md:px-10 md:py-10' : 'rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 px-5 py-6 md:px-10 md:py-10 shadow-md'} ${wrapperClass}`}
                  >
                    <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-[#00875A]/10 blur-3xl"></div>
                    <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-[#FF8B00]/10 blur-3xl"></div>
                    <div className={`${gridClass} min-w-0`}>
                      {block.items.map((fact: any, index: number) => {
                        const isLast = index === factCount - 1;
                        const isSecondLast = index === factCount - 2;
                        const balanceClass = shouldCenterLast && isLast
                          ? 'xl:col-span-2 xl:col-start-2 xl:justify-self-center xl:max-w-[320px]'
                          : shouldCenterLastTwo && isSecondLast
                            ? 'xl:col-start-2'
                            : '';
                        return (
                          <div key={fact.id || index} className={`${itemBaseClass} ${balanceClass} min-w-0`}>
                            <FactBlock data={fact} className="h-full" />
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
            const sectionId = isHomePremium && !hasRenderedTextBlockAnchor ? 'uitleg' : undefined;
            if (isHomePremium && !hasRenderedTextBlockAnchor) {
              hasRenderedTextBlockAnchor = true;
            }
            return (
              <section
                id={sectionId}
                key={blockKey}
                className={isHomePremium ? '!py-0 bg-transparent' : 'py-12 md:py-24'}
              >
                <div className={isHomePremium ? 'container-custom px-4 py-10 sm:px-6 lg:px-8 md:py-12' : 'container-custom px-4 sm:px-6 lg:px-8'}>
                  <div
                    className={
                      isHomePremium
                        ? 'relative mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl border border-[#d7e1ee] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:mb-10 md:p-10'
                        : 'bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-4xl mx-auto relative hover:shadow-xl transition-all duration-300'
                    }
                  >
                    {!isHomePremium ? (
                      <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
                    ) : null}
                    <div className={isHomePremium ? '' : 'p-6 md:p-10'}>
                      <div className={isHomePremium ? 'pointer-events-none absolute right-8 top-8 opacity-5 md:right-10 md:top-10' : 'absolute top-8 right-8 md:top-12 md:right-12 opacity-10 pointer-events-none'}>
                        <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={`space-y-8 relative z-10 text-${block.alignment || 'left'}`}>
                        <ReactMarkdown
                          className={
                            isHomePremium
                              ? 'prose max-w-none prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#0057B8] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-[#4b5f80] prose-p:leading-relaxed prose-p:text-base prose-p:my-5 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-[#FF8B00] prose-blockquote:pl-4 prose-blockquote:italic prose-code:rounded prose-code:bg-[#edf3fb] prose-code:p-1 prose-pre:rounded-md prose-pre:bg-[#edf3fb]'
                              : 'prose prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:my-6 max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-[#00875A] prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md'
                          }
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
            const sectionId = isHomePremium && !hasRenderedFeatureGridAnchor ? 'stappenplan' : undefined;
            if (isHomePremium && !hasRenderedFeatureGridAnchor) {
              hasRenderedFeatureGridAnchor = true;
            }
            return (
              <section
                id={sectionId}
                key={blockKey}
                className={isHomePremium ? '!py-0 bg-transparent' : 'py-12 md:py-24 bg-[#F8FAFC]'}
              >
                <div className={isHomePremium ? 'container-custom px-4 pb-12 sm:px-6 lg:px-8 md:pb-16' : 'container-custom px-4 sm:px-6 lg:px-8'}>
                  {features.length > 0 ? (
                    <>
                      <div className={isHomePremium ? 'mb-10 pt-12 text-center md:mb-12 md:pt-16' : 'text-center mb-10 md:mb-12'}>
                        <h2 className={isHomePremium ? 'mb-3 text-2xl font-bold text-[#091E42] sm:text-3xl md:mb-4 md:text-4xl' : 'text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 md:mb-4'}>
                          {block.title || (features.length > 0 ? `De ${features.length} stappen` : featureGridTitleFallback)}
                        </h2>
                        <div className={isHomePremium ? 'mx-auto h-1 w-16 rounded-full bg-[#0057B8] md:w-20' : 'w-16 md:w-20 h-1 bg-[#00875A] mx-auto rounded-full'}></div>
                        {block.subtitle && (
                          <p className="text-gray-600 text-center max-w-2xl mx-auto mt-4 md:mt-6 text-sm sm:text-base">
                            {block.subtitle}
                          </p>
                        )}
                      </div>
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6"
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
                            <div
                              className={
                                isHomePremium
                                  ? 'h-full rounded-2xl border border-[#d7e1ee] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/35 hover:shadow-md md:p-6'
                                  : 'h-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm'
                              }
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span
                                    className={
                                      isHomePremium
                                        ? 'inline-flex items-center rounded-full bg-[#0057B8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0057B8]'
                                        : 'inline-flex items-center rounded-full bg-[#00875A]/10 text-[#00875A] px-3 py-1 text-xs font-semibold uppercase tracking-widest'
                                    }
                                  >
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
                              <div className="mt-4 text-gray-600">
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
              <section
                id={isHomePremium ? 'faq' : undefined}
                key={blockKey}
                className={isHomePremium ? '!py-0 bg-transparent' : 'py-12 md:py-24 bg-white'}
              >
                <div className={isHomePremium ? 'container-custom px-4 py-12 sm:px-6 lg:px-8 md:py-16' : 'container-custom px-4 sm:px-6 lg:px-8'}>
                  <div className={isHomePremium ? 'mx-auto max-w-4xl rounded-2xl border border-[#d7e1ee] bg-white p-6 shadow-sm md:p-8' : 'max-w-4xl mx-auto'}>
                    <FaqSection items={block.items} variant={isHomePremium ? 'home-premium' : 'default'} />
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
          className={
            isHomePremium
              ? '!py-0 bg-transparent'
              : 'relative overflow-hidden bg-[#091E42] text-white py-14 md:py-24'
          }
          data-cta-final="true"
          data-cta-source={primaryCta.sourceComponent}
        >
          <div
            className={
              isHomePremium
                ? 'relative overflow-hidden bg-gradient-to-r from-[#091E42] via-[#0d2f65] to-[#134078] py-14 text-white md:py-16'
                : 'relative overflow-hidden bg-[#091E42] text-white py-14 md:py-24'
            }
          >
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className={isHomePremium ? 'absolute right-0 top-0 h-96 w-96 rounded-full bg-[#0057B8]/20 -mr-20 -mt-20 blur-xl' : 'absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow'}></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
              <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
            </div>
            <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="mb-4 text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                  {primaryCta.title || 'Klaar om de volgende stap te zetten?'}
                </h2>
                {primaryCta.description ? (
                  <p className="mb-6 text-sm leading-relaxed text-white/85 sm:text-base md:mb-8 md:text-lg">
                    {parseMarkdownBold(primaryCta.description)}
                  </p>
                ) : null}
                <a
                  href={primaryCta.link || '/contact'}
                  className="primary-button w-full text-center transition-all duration-300 hover:-translate-y-1 hover:bg-[#FF9B20] hover:shadow-lg sm:w-auto"
                >
                  {primaryCta.text || 'Neem contact op'}
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
