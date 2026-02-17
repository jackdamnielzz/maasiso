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
import { Iso9001CostSectionCta, Iso9001HeroLeadCta } from '@/components/features/Iso9001LeadCtas';

type AuthorityPageContentProps = {
  layout?: NonNullable<Page['layout']>;
  heroFallbackImage?: Page['featuredImage'];
  heroImage?: {
    src: string;
    alt?: string;
  };
  sectionImage?: {
    src: string;
    alt?: string;
  };
  benefitsSectionImage?: {
    src: string;
    alt?: string;
  };
  implementationDurationImage?: {
    src: string;
    alt?: string;
  };
  auditSectionImage?: {
    src: string;
    alt?: string;
  };
  transitionTimelineImage?: {
    src: string;
    alt?: string;
  };
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

const MARKDOWN_PROSE_CLASS =
  'prose prose-slate max-w-none prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:my-6 prose-p:text-base prose-p:leading-8 prose-ul:list-disc prose-ol:list-decimal prose-li:my-2.5 prose-li:leading-7 prose-code:rounded prose-code:bg-gray-100 prose-code:p-1 prose-pre:rounded-md prose-pre:bg-gray-100 prose-pre:p-4';

const MARKDOWN_TABLE_CLASS =
  'w-full min-w-[640px] text-sm leading-relaxed [&_thead]:bg-slate-100/90 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#091E42] [&_td]:px-4 [&_td]:py-3 [&_tbody_tr]:border-t [&_tbody_tr]:border-slate-200 [&_tbody_tr:nth-child(even)]:bg-slate-50/60';

const MARKDOWN_INLINE_IMAGE_CLASS =
  'h-auto w-full rounded-xl border border-slate-200/80 shadow-[0_10px_26px_rgba(9,30,66,0.09)]';

const MARKDOWN_BLOCKQUOTE_CLASS =
  'my-8 border-l-4 border-[#00875A] bg-[#f7fffb] pl-5 pr-4 py-3 italic text-slate-700 rounded-r-xl';

const markdownComponents = {
  h2: (props: any) => {
    const { children, ...restProps } = props;
    const rest = { ...restProps };
    delete rest.node;
    const headingText = toTextContent(children).trim().toLowerCase();
    const isKostenHeading = /wat\s+kost\s+iso\s*9001\s+certificering\??/i.test(headingText);

    return (
      <h2 id={isKostenHeading ? 'kosten' : rest.id} {...rest}>
        {children}
      </h2>
    );
  },
  table: (props: any) => {
    const rest = { ...props };
    delete rest.node;
    return (
      <div className="my-8 w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(9,30,66,0.06)]">
        <table className={MARKDOWN_TABLE_CLASS} {...rest} />
      </div>
    );
  },
  img: (props: any) => {
    const { src, alt, ...restProps } = props;
    const rest = { ...restProps };
    delete rest.node;
    const imageSource = typeof src === 'string' ? getImageUrl(src, 'large') : '/placeholder-blog.jpg';
    return (
      <img
        src={imageSource}
        alt={alt || ''}
        className={MARKDOWN_INLINE_IMAGE_CLASS}
        loading="lazy"
        {...rest}
      />
    );
  },
  blockquote: (props: any) => {
    const { children, ...restProps } = props;
    const rest = { ...restProps };
    delete rest.node;
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
        shouldRenderCite = false;
      }
    }

    return (
      <blockquote {...rest} className={MARKDOWN_BLOCKQUOTE_CLASS}>
        {blockChildren}
        {shouldRenderCite && citeText ? (
          <cite className="mt-3 block text-sm not-italic font-medium text-slate-600">— {citeText}</cite>
        ) : null}
      </blockquote>
    );
  },
};

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
  heroImage,
  sectionImage,
  benefitsSectionImage,
  implementationDurationImage,
  auditSectionImage,
  transitionTimelineImage,
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
  let textBlockRenderIndex = 0;

  return (
    <main
      className="flex-1 bg-[radial-gradient(140%_90%_at_50%_0%,#e8f3ff_0%,#f8fbff_35%,#ffffff_100%)]"
      data-testid={testId}
      data-topic={dataTopic}
    >
      {breadcrumbSchemaItems ? (
        <>
          <SchemaMarkup breadcrumbs={{ items: breadcrumbSchemaItems }} />
          {showBreadcrumbs ? (
            <div className="border-b border-slate-200/90 bg-white/80 backdrop-blur-sm">
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
            const heroImageSrc = heroImage?.src
              ? heroImage.src
              : resolvedHeroImage?.url
                ? getImageUrl(resolvedHeroImage, 'large')
                : null;
            const heroImageAlt =
              heroImage?.alt ||
              resolvedHeroImage?.alternativeText ||
              resolvedHeroImage?.name ||
              block?.title ||
              'Hero afbeelding';
            return (
              <React.Fragment key={blockKey}>
                <section className="hero-section relative overflow-hidden bg-[#091E42]">
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
                      <div className="absolute inset-0 bg-gradient-to-br from-[#050f24]/85 via-[#091E42]/76 to-[#032545]/76"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(0,135,90,0.28),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(255,139,0,0.24),transparent_44%)]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050f24]/78 via-transparent to-transparent"></div>
                    </>
                  ) : null}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#00875A] opacity-10 blur-2xl -mr-20 -mt-20 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#FF8B00] opacity-10 blur-2xl -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                    <div className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-white opacity-5 blur-xl transform -translate-y-1/2"></div>
                  </div>
                  <div className="container-custom relative z-10">
                    <div className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 px-6 py-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:px-8 md:px-10 md:py-12">
                      <h1 className="mb-5 text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl md:mb-6 md:text-5xl">
                        {block.title}
                      </h1>
                      {block.subtitle && (
                        <p className="mx-auto mb-1 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
                          {parseMarkdownBold(String(block.subtitle))}
                        </p>
                      )}
                      {showIso9001LeadSnippet ? <Iso9001HeroLeadCta /> : null}
                    </div>
                  </div>
                </section>
                {showIso9001LeadSnippet ? (
                  <section className="bg-gradient-to-b from-white via-[#f8fcff] to-white py-10 md:py-14">
                    <div className="container-custom px-4 sm:px-6 lg:px-8">
                      <div className="mx-auto max-w-5xl rounded-2xl border border-[#dce9f6] bg-white p-6 shadow-[0_14px_36px_rgba(9,30,66,0.08)] md:p-8">
                        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                          <ul className="space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00875A]"></span>
                              <span><strong>Voor wie:</strong> MKB (1-100+ medewerkers), alle sectoren</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00875A]"></span>
                              <span><strong>Doorlooptijd:</strong> gemiddeld 3-6 maanden</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00875A]"></span>
                              <span><strong>Investering:</strong> meestal EUR 5.000-EUR 15.000 (incl. certificering)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00875A]"></span>
                              <span><strong>Aanpak:</strong> wij begeleiden, certificerende instelling audit</span>
                            </li>
                          </ul>
                          <a
                            href="#kosten"
                            className="inline-flex items-center justify-center rounded-lg border border-[#00875A]/35 bg-[#f1fbf6] px-4 py-2.5 text-sm font-semibold text-[#006B47] transition hover:bg-[#e4f7ee]"
                          >
                            Bekijk kosten →
                          </a>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}
              </React.Fragment>
            );
          }

          case 'page-blocks.key-takeaways':
            return (
              <section key={blockKey} className="bg-gradient-to-b from-white via-[#f8fbff] to-white pt-12 pb-10 md:pt-16 md:pb-14">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <KeyTakeaways
                    items={block.items}
                    className="max-w-5xl mx-auto"
                    variant="iso9001"
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
            const wrapperClass = isSingle ? 'max-w-3xl mx-auto' : '';
            const gridClass = isSingle
              ? 'relative grid grid-cols-1 place-items-center gap-6 sm:gap-8 md:gap-10'
              : 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10';
            const itemBaseClass = isSingle ? 'w-full max-w-sm' : 'w-full';
            return (
              <section key={blockKey} className="bg-gradient-to-b from-[#f8fbff] via-white to-[#f7fcfa] py-14 md:py-24">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto text-center mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42]">Kernfeiten</h2>
                  </div>
                  <div
                    className={`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 px-6 py-8 shadow-[0_18px_45px_rgba(9,30,66,0.08)] md:px-12 md:py-12 ${wrapperClass}`}
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
            const iso90012026ChangesHeadingRegex =
              /(^|\n)\s*#{0,6}\s*wat\s+verandert\s+er\s+in\s+iso\s*9001:?\s*2026\??/i;
            const isIso90012026ChangesBlock = iso90012026ChangesHeadingRegex.test(normalizedTextBlockContent);
            const sectionImageAnchorRegex =
              /De norm is gebaseerd op\s+7\s+kwaliteitsmanagement\s*principes/i;
            const sectionClausesHeadingRegex =
              /(^|\n)\s*#{0,6}\s*.*\bclausules\s*4\s*[–-]\s*10\b/i;
            const sectionClausesMarkerRegex = /\bclausules\s*4\s*[–-]\s*10\b/i;
            const sectionHeadingRegex =
              /(^|\n)\s*#{1,6}\s*.*\b(?:structuur|normstructuur)\b.*\bISO\s*9001\b/i;
            const sectionAnchorMatch = Boolean(sectionImage?.src) && sectionImageAnchorRegex.test(normalizedTextBlockContent)
              ? normalizedTextBlockContent.match(sectionImageAnchorRegex)
              : null;
            const clausesAnchorMatch = Boolean(sectionImage?.src) && sectionClausesHeadingRegex.test(normalizedTextBlockContent)
              ? normalizedTextBlockContent.match(sectionClausesHeadingRegex)
              : null;
            let shouldInjectSectionImage = false;
            let contentBeforeStructureImage = normalizedTextBlockContent;
            let contentFromStructureImage = normalizedTextBlockContent;

            if (clausesAnchorMatch?.index !== undefined && !isIso90012026ChangesBlock && sectionImage?.src) {
              const contentLines = normalizedTextBlockContent.split('\n');
              const clausesMarkerIndex = contentLines.findIndex((line) => sectionClausesMarkerRegex.test(line));
              const startIndex = clausesMarkerIndex === -1 ? 0 : clausesMarkerIndex + 1;
              let insertionLine = contentLines.length;
              let inList = false;
              for (let lineIndex = startIndex; lineIndex < contentLines.length; lineIndex += 1) {
                const line = contentLines[lineIndex];
                const isListItem = /^\s*[-*]\s+/.test(line);
                if (isListItem) {
                  inList = true;
                  continue;
                }
                if (inList && line.trim() === '') {
                  continue;
                }
                if (inList) {
                  insertionLine = lineIndex;
                  break;
                }
              }
              if (inList) {
                shouldInjectSectionImage = true;
                contentBeforeStructureImage = contentLines.slice(0, insertionLine).join('\n').trimEnd();
                contentFromStructureImage = contentLines.slice(insertionLine).join('\n').trimStart();
              }
            }
            if (!shouldInjectSectionImage && sectionAnchorMatch?.index !== undefined && !isIso90012026ChangesBlock && sectionImage?.src) {
              const searchStart = sectionAnchorMatch.index + sectionAnchorMatch[0].length;
              const headingMatch = normalizedTextBlockContent.slice(searchStart).match(sectionHeadingRegex);
              const sentenceEnd = normalizedTextBlockContent.indexOf('.', searchStart);
              const insertionCandidate =
                headingMatch?.index !== undefined
                  ? searchStart + headingMatch.index + (headingMatch[1] ? headingMatch[1].length : 0)
                  : sentenceEnd > -1
                    ? sentenceEnd + 1
                    : searchStart;
              if (insertionCandidate >= 0 && insertionCandidate <= normalizedTextBlockContent.length) {
                shouldInjectSectionImage = true;
                contentBeforeStructureImage = normalizedTextBlockContent.slice(0, insertionCandidate).trimEnd();
                contentFromStructureImage = normalizedTextBlockContent.slice(insertionCandidate).trimStart();
              }
            }

            const implementationDurationHeadingRegex =
              /(^|\n)\s*#{0,6}\s*.*\bhoelang\s+duurt\s+iso\s*9001\s+implementatie\b.*$/i;
            let shouldInjectImplementationDurationImage = false;
            let contentBeforeImplementationDurationImage = normalizedTextBlockContent;
            let contentFromImplementationDurationImage = normalizedTextBlockContent;
            if (!isIso90012026ChangesBlock && Boolean(implementationDurationImage?.src)) {
              const lines = normalizedTextBlockContent.split('\n');
              const headingLineIndex = lines.findIndex((line) => implementationDurationHeadingRegex.test(line));
              if (headingLineIndex !== -1) {
                shouldInjectImplementationDurationImage = true;
                const insertionLine = headingLineIndex + 1;
                contentBeforeImplementationDurationImage = lines.slice(0, insertionLine).join('\n').trimEnd();
                contentFromImplementationDurationImage = lines.slice(insertionLine).join('\n').trimStart();
              }
            }

            const transitionTimelineHeadingRegex =
              /(^|\n)\s*#{0,6}\s*.*\btransitie\s*[-–]?\s*timeline\b.*$/i;
            const benefitsHeadingRegex = /(^|\n)\s*#{1,6}\s*voordelen\s*van\s*iso\s*9001/i;
            const tableLineRegex = /^\s*\|.*\|\s*$/;
            const transitionTimelineTableMarkerRegex = /\btransitie\s*[-–]?\s*timeline\b/i;
            const isTransitionTimelineBlock =
              !isIso90012026ChangesBlock &&
              Boolean(transitionTimelineImage?.src) &&
              (transitionTimelineHeadingRegex.test(normalizedTextBlockContent) ||
                transitionTimelineTableMarkerRegex.test(normalizedTextBlockContent));

            let shouldInjectTransitionTimelineImage = false;
            let contentBeforeTransitionTimelineImage = normalizedTextBlockContent;
            let contentFromTransitionTimelineImage = normalizedTextBlockContent;
            if (isTransitionTimelineBlock && transitionTimelineImage?.src) {
              const lines = normalizedTextBlockContent.split('\n');
              const benefitsHeadingIndex = lines.findIndex((line) => benefitsHeadingRegex.test(line));
              const transitionHeadingIndex = lines.findIndex((line) =>
                transitionTimelineHeadingRegex.test(line)
              );
              const scanStart = Math.max(0, transitionHeadingIndex);
              const scanEnd = benefitsHeadingIndex === -1 ? lines.length : benefitsHeadingIndex;
              let insertionLine = scanEnd;
              let foundTableLine = false;

              for (let lineIndex = scanStart; lineIndex < scanEnd; lineIndex += 1) {
                const line = lines[lineIndex];
                const isTableLine =
                  tableLineRegex.test(line) || /^\s*\|?\s*:?-{3,}.*\|?$/i.test(line);

                if (isTableLine) {
                  foundTableLine = true;
                  insertionLine = lineIndex + 1;
                  continue;
                }

                if (foundTableLine && line.trim() === '') {
                  insertionLine = lineIndex + 1;
                  break;
                }
              }

              if (foundTableLine) {
                shouldInjectTransitionTimelineImage = true;
                contentBeforeTransitionTimelineImage = lines.slice(0, insertionLine).join('\n').trimEnd();
                contentFromTransitionTimelineImage = lines.slice(insertionLine).join('\n').trimStart();
              }
            }

            const benefitsSectionHeadingRegex =
              /(^|\n)\s*#{1,6}\s*voordelen\s*van\s*iso\s*9001\s*certificering/i;
            const benefitsSectionImageAnchorRegex = /hoger klantvertrouwen/i;
            const auditSectionHeadingRegex =
              /(^|\n)\s*#{1,6}\s*hoe\s+verloopt\s+een\s+iso\s*9001\s+audit\b/i;
            const isBenefitsSectionBlock =
              benefitsSectionHeadingRegex.test(normalizedTextBlockContent) ||
              /voordelen\s*van\s*iso\s*9001/i.test(normalizedTextBlockContent) ||
              benefitsSectionImageAnchorRegex.test(normalizedTextBlockContent);
            const isAuditSectionBlock =
              auditSectionHeadingRegex.test(normalizedTextBlockContent) ||
              /fase\s*1\s+audit/i.test(normalizedTextBlockContent) ||
              /fase\s*2\s+audit/i.test(normalizedTextBlockContent);
            const markdownHeadingRegex = /^\s*#{1,6}\s+/;

            let shouldInjectAuditSectionImage = false;
            let contentBeforeAuditSectionImage = normalizedTextBlockContent;
            let contentFromAuditSectionImage = normalizedTextBlockContent;
            if (isAuditSectionBlock && !isIso90012026ChangesBlock && Boolean(auditSectionImage?.src)) {
              const lines = normalizedTextBlockContent.split('\n');
              const headingLineIndex = lines.findIndex((line) => auditSectionHeadingRegex.test(line));
              const insertionStart = Math.max(0, headingLineIndex + 1);
              let insertionLine = lines.length;

              for (let lineIndex = insertionStart; lineIndex < lines.length; lineIndex += 1) {
                if (markdownHeadingRegex.test(lines[lineIndex])) {
                  insertionLine = lineIndex;
                  break;
                }
              }

              shouldInjectAuditSectionImage = true;
              contentBeforeAuditSectionImage = lines.slice(0, insertionLine).join('\n').trimEnd();
              contentFromAuditSectionImage = lines.slice(insertionLine).join('\n').trimStart();
            }

            let shouldInjectBenefitsSectionImage = false;
            let contentBeforeBenefitsImage = normalizedTextBlockContent;
            let contentFromBenefitsImage = normalizedTextBlockContent;
            if (isBenefitsSectionBlock && !isIso90012026ChangesBlock && Boolean(benefitsSectionImage?.src)) {
              const lines = normalizedTextBlockContent.split('\n');
              const headingLineIndex = lines.findIndex((line) => benefitsSectionHeadingRegex.test(line));
              const anchorLineIndex = lines.findIndex((line) => benefitsSectionImageAnchorRegex.test(line));
              const startIndex =
                headingLineIndex === -1
                  ? (anchorLineIndex === -1 ? 0 : anchorLineIndex + 1)
                  : headingLineIndex + 1;
              let insertionLine = lines.length;

              for (let lineIndex = startIndex; lineIndex < lines.length; lineIndex += 1) {
                if (markdownHeadingRegex.test(lines[lineIndex])) {
                  insertionLine = lineIndex;
                  break;
                }
              }

              shouldInjectBenefitsSectionImage = true;
              contentBeforeBenefitsImage = lines.slice(0, insertionLine).join('\n').trimEnd();
              contentFromBenefitsImage = lines.slice(insertionLine).join('\n').trimStart();
            }

            const shouldInjectImage =
              shouldInjectSectionImage ||
              shouldInjectImplementationDurationImage ||
              shouldInjectAuditSectionImage ||
              shouldInjectBenefitsSectionImage ||
              shouldInjectTransitionTimelineImage;
            const imageBlockBefore = shouldInjectSectionImage
              ? contentBeforeStructureImage
              : shouldInjectImplementationDurationImage
              ? contentBeforeImplementationDurationImage
              : shouldInjectAuditSectionImage
              ? contentBeforeAuditSectionImage
              : shouldInjectBenefitsSectionImage
              ? contentBeforeBenefitsImage
              : shouldInjectTransitionTimelineImage
              ? contentBeforeTransitionTimelineImage
              : normalizedTextBlockContent;
            const imageBlockAfter = shouldInjectSectionImage
              ? contentFromStructureImage
              : shouldInjectImplementationDurationImage
              ? contentFromImplementationDurationImage
              : shouldInjectAuditSectionImage
              ? contentFromAuditSectionImage
              : shouldInjectBenefitsSectionImage
              ? contentFromBenefitsImage
              : shouldInjectTransitionTimelineImage
              ? contentFromTransitionTimelineImage
              : normalizedTextBlockContent;
            const sectionImageSrc =
              shouldInjectSectionImage && sectionImage?.src
                ? sectionImage.src
              : shouldInjectImplementationDurationImage
              ? implementationDurationImage?.src || ''
              : shouldInjectAuditSectionImage
              ? auditSectionImage?.src || ''
              : shouldInjectBenefitsSectionImage
              ? benefitsSectionImage?.src || ''
              : shouldInjectTransitionTimelineImage
              ? transitionTimelineImage?.src || ''
              : '';
            const sectionImageAlt =
              shouldInjectSectionImage
                ? sectionImage?.alt || 'ISO 9001 structuur afbeelding'
                : shouldInjectImplementationDurationImage
                ? implementationDurationImage?.alt || 'ISO 9001 doorlooptijd afbeelding'
                : shouldInjectAuditSectionImage
                ? auditSectionImage?.alt || 'ISO 9001 audit afbeelding'
                : shouldInjectBenefitsSectionImage
                ? benefitsSectionImage?.alt || 'ISO 9001 voordelen samenvatting'
                : shouldInjectTransitionTimelineImage
                ? transitionTimelineImage?.alt || 'ISO 9001 transitie timeline'
                : 'ISO 9001 afbeelding';

            const isKostenSection = block.id === 'kosten-sectie';
            const textBlockId = isKostenSection ? 'kosten-sectie' : undefined;
            const renderedTextBlockIndex = textBlockRenderIndex;
            textBlockRenderIndex += 1;
            const textBlockToneClass =
              renderedTextBlockIndex % 2 === 0
                ? 'bg-white'
                : 'bg-gradient-to-b from-[#f7fbff] to-white border-y border-slate-100/80';
            const textAlignmentClass =
              block.alignment === 'center'
                ? 'text-center'
                : block.alignment === 'right'
                ? 'text-right'
                : 'text-left';
            return (
              <React.Fragment key={blockKey}>
                <section id={textBlockId} className={`py-16 md:py-28 ${textBlockToneClass}`}>
                  <div className="container-custom px-4 sm:px-6 lg:px-8">
                    <div className="relative mx-auto mb-14 max-w-5xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_20px_50px_rgba(9,30,66,0.08)] transition-all duration-300 hover:shadow-[0_26px_58px_rgba(9,30,66,0.12)]">
                      <div className="h-2 bg-gradient-to-r from-[#00875A] via-[#14a271] to-[#FF8B00]"></div>
                      <div className="p-8 md:p-12">
                        <div className="pointer-events-none absolute top-8 right-8 opacity-10 md:top-12 md:right-12">
                          <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        <div className={`relative z-10 space-y-10 ${textAlignmentClass}`}>
                          {shouldInjectImage ? (
                            <>
                              <ReactMarkdown
                                className={MARKDOWN_PROSE_CLASS}
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={markdownComponents}
                              >
                                {imageBlockBefore}
                              </ReactMarkdown>
                              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_12px_30px_rgba(9,30,66,0.09)]">
                                <div className="relative aspect-[16/9] w-full">
                                  <Image
                                    src={sectionImageSrc || ''}
                                    alt={sectionImageAlt}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 1100px"
                                    className="object-cover rounded-xl"
                                  />
                                </div>
                              </div>
                              <ReactMarkdown
                                className={MARKDOWN_PROSE_CLASS}
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={markdownComponents}
                              >
                                {imageBlockAfter}
                              </ReactMarkdown>
                            </>
                          ) : (
                            <ReactMarkdown
                              className={MARKDOWN_PROSE_CLASS}
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              components={markdownComponents}
                            >
                              {normalizedTextBlockContent}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                {showIso9001LeadSnippet && isKostenSection ? <Iso9001CostSectionCta /> : null}
              </React.Fragment>
            );

          case 'page-blocks.feature-grid': {
            const features = Array.isArray(block.features) ? block.features : [];
            return (
              <section key={blockKey} className="bg-[linear-gradient(180deg,#f5faff_0%,#edf7f4_55%,#f8fbff_100%)] py-16 md:py-28">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  {features.length > 0 ? (
                    <>
                      <div className="text-center mb-12 md:mb-14">
                        <p className="mx-auto mb-4 inline-flex items-center rounded-full border border-[#00875A]/20 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#00875A]">
                          Implementatieroute
                        </p>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 md:mb-4">
                          {block.title || (features.length > 0 ? `De ${features.length} stappen` : featureGridTitleFallback)}
                        </h2>
                        <div className="h-1 w-16 rounded-full bg-[#00875A] mx-auto md:w-20"></div>
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
                            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 md:p-7 shadow-[0_12px_30px_rgba(9,30,66,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00875A]/35 hover:shadow-[0_18px_40px_rgba(9,30,66,0.12)]">
                              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00875A] via-[#1ea678] to-[#FF8B00] opacity-80"></div>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span className="inline-flex items-center rounded-full border border-[#00875A]/20 bg-[#00875A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#00875A]">
                                    Stap {index + 1}
                                  </span>
                                  <h3 className="mt-3 md:mt-4 text-base md:text-lg font-semibold text-[#091E42]">
                                    {feature.title || 'Stap'}
                                  </h3>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f6fbf9_100%)] md:h-10 md:w-10">
                                  <img
                                    src={iconUrl}
                                    alt={iconAlt}
                                    className="h-5 w-5 object-contain md:h-6 md:w-6"
                                  />
                                </div>
                              </div>
                              <div className="mt-5 text-gray-600 leading-relaxed">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkBreaks]}
                                  className="prose prose-sm max-w-none text-gray-600 prose-p:leading-7 prose-li:my-1.5"
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
              <section key={blockKey} className="bg-gradient-to-b from-white via-[#f7fbff] to-white py-16 md:py-28">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    <FaqSection items={block.items} variant="iso9001" />
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
          className="relative overflow-hidden bg-[radial-gradient(120%_95%_at_50%_0%,#13325d_0%,#091E42_48%,#08162e_100%)] py-14 text-white md:py-24"
          data-cta-final="true"
          data-cta-source={primaryCta.sourceComponent}
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#00875A] opacity-[0.12] blur-2xl -mr-20 -mt-20 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#FF8B00] opacity-[0.12] blur-2xl -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
            <div className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-white opacity-5 blur-lg transform -translate-y-1/2"></div>
          </div>
          <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 px-6 py-10 text-center shadow-[0_24px_56px_rgba(0,0,0,0.24)] backdrop-blur-sm md:px-10 md:py-12">
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
                className="primary-button w-full text-center !bg-gradient-to-r !from-[#FF8B00] !to-[#FF6B00] px-7 py-4 shadow-[0_14px_32px_rgba(255,139,0,0.38)] transition-all duration-300 hover:!from-[#FF9B20] hover:!to-[#FF7A00] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,139,0,0.45)] sm:w-auto"
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
