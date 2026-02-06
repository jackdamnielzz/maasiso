import { getPage } from '@/lib/api';
import AuthorityPageContent from '@/components/features/AuthorityPageContent';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Page } from '@/lib/types';

type CoreDetailPageTemplateProps = {
  title: string;
  strapiSlug: string;
  hub: {
    title: string;
    href: string;
  };
  dataTopic?: string;
};

function cloneLayout(layout: NonNullable<Page['layout']>): NonNullable<Page['layout']> {
  return layout.map((block: any) => {
    if (block?.__component === 'page-blocks.feature-grid') {
      return {
        ...block,
        features: Array.isArray(block.features) ? block.features.map((f: any) => ({ ...f })) : [],
      };
    }
    return { ...block };
  }) as NonNullable<Page['layout']>;
}

function extractTrailingStepsFromText(content: string) {
  const lines = content.split('\n');
  const used = new Set<number>();
  const extracted: Array<{ step: number; title: string; description: string }> = [];

  const stepHeader = /^\s*(?:[-*]\s*)?(?:\*\*)?\s*Stap\s*([45])\s*[:\-–]\s*(.+?)\s*(?:\*\*)?\s*$/i;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(stepHeader);
    if (!match) continue;

    const step = Number(match[1]);
    const title = match[2].trim();
    used.add(i);

    const descriptionLines: string[] = [];
    let j = i + 1;
    while (j < lines.length) {
      if (lines[j].match(stepHeader)) break;
      descriptionLines.push(lines[j]);
      used.add(j);
      j += 1;
    }

    extracted.push({
      step,
      title,
      description: descriptionLines.join('\n').trim(),
    });

    i = j - 1;
  }

  if (!extracted.length) {
    return { content, steps: [] as Array<{ step: number; title: string; description: string }> };
  }

  const remaining = lines
    .filter((_, idx) => !used.has(idx))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { content: remaining, steps: extracted };
}

function normalizeNis2Table(content: string): string {
  const lower = content.toLowerCase();
  if (!lower.includes('nis2 artikel 21')) return content;

  const lines = content.split('\n');
  const looseRows: Array<{ letter: string; text: string; index: number }> = [];

  lines.forEach((line, index) => {
    const m = line.match(/^\s*([hij])[\)\.\-:]\s*(.+)\s*$/i);
    if (!m) return;
    looseRows.push({ letter: m[1].toLowerCase(), text: m[2].trim(), index });
  });

  if (!looseRows.length) return content;

  let separatorIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*\|?\s*:?-{2,}/.test(lines[i])) {
      separatorIndex = i;
      break;
    }
  }
  if (separatorIndex === -1) return content;

  let tableEnd = separatorIndex + 1;
  while (tableEnd < lines.length && /^\s*\|/.test(lines[tableEnd])) {
    tableEnd += 1;
  }

  const headerLine = lines[Math.max(0, separatorIndex - 1)] || '';
  const headerColumns = headerLine.includes('|')
    ? headerLine.split('|').filter((c) => c.trim().length > 0).length
    : 2;
  const columnCount = Math.max(2, headerColumns);

  const generatedRows = looseRows.map(({ letter, text }) => {
    const cells = [letter.toUpperCase(), text, ...Array(Math.max(0, columnCount - 2)).fill('')];
    return `| ${cells.join(' | ')} |`;
  });

  const removeIndexes = new Set(looseRows.map((row) => row.index));
  const withoutLooseRows = lines.filter((_, index) => !removeIndexes.has(index));

  const adjustedTableEnd = tableEnd - looseRows.filter((r) => r.index < tableEnd).length;
  withoutLooseRows.splice(adjustedTableEnd, 0, ...generatedRows);

  return withoutLooseRows.join('\n');
}

function moveButtonsToEnd(layout: NonNullable<Page['layout']>): NonNullable<Page['layout']> {
  const normalBlocks = layout.filter((b: any) => b?.__component !== 'page-blocks.button');
  const buttonBlocks = layout.filter((b: any) => b?.__component === 'page-blocks.button');
  return [...normalBlocks, ...buttonBlocks] as NonNullable<Page['layout']>;
}

function normalizeIso27001Layout(layout: NonNullable<Page['layout']>): NonNullable<Page['layout']> {
  const blocks = cloneLayout(layout) as any[];

  // Fix 1: combine all feature-grid steps into one block (1..5 in the same component)
  const featureGridIndexes = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block?.__component === 'page-blocks.feature-grid')
    .map(({ index }) => index);

  if (featureGridIndexes.length > 1) {
    const primaryIndex = featureGridIndexes[0];
    const primary = blocks[primaryIndex];
    const mergedFeatures = Array.isArray(primary.features) ? [...primary.features] : [];

    for (const idx of featureGridIndexes.slice(1)) {
      const extra = Array.isArray(blocks[idx]?.features) ? blocks[idx].features : [];
      mergedFeatures.push(...extra);
      blocks[idx] = null;
    }

    primary.features = mergedFeatures;
  }

  // Also capture step 4/5 if they leaked into a text block
  const primaryFeatureGrid = blocks.find((b) => b?.__component === 'page-blocks.feature-grid');
  if (primaryFeatureGrid) {
    const existingTitles = new Set(
      (Array.isArray(primaryFeatureGrid.features) ? primaryFeatureGrid.features : [])
        .map((f: any) => String(f?.title || '').toLowerCase().trim())
    );

    blocks.forEach((block, index) => {
      if (!block || block.__component !== 'page-blocks.text-block' || !block.content) return;
      const { content, steps } = extractTrailingStepsFromText(String(block.content));
      if (!steps.length) return;

      const mapped = steps
        .sort((a, b) => a.step - b.step)
        .map((s) => ({
          id: `iso27001-step-${s.step}`,
          title: s.title,
          description: s.description,
          link: '',
        }))
        .filter((s) => {
          const key = s.title.toLowerCase().trim();
          if (!key || existingTitles.has(key)) return false;
          existingTitles.add(key);
          return true;
        });

      if (mapped.length) {
        primaryFeatureGrid.features = [...(primaryFeatureGrid.features || []), ...mapped];
      }

      blocks[index].content = content;
      if (!String(content || '').trim()) {
        blocks[index] = null;
      }
    });
  }

  // Fix 2: force loose h/i/j NIS2 mapping rows back into the markdown table
  blocks.forEach((block, index) => {
    if (!block || block.__component !== 'page-blocks.text-block' || !block.content) return;
    blocks[index].content = normalizeNis2Table(String(block.content));
  });

  // Fix 3: make sure the "ISO 27001 laat zien..." paragraph sits in "Waarom ISO 27001" block
  const phrase = 'ISO 27001 laat zien dat informatiebeveiliging';
  const phraseRegex = /ISO 27001 laat zien dat informatiebeveiliging[\s\S]*?(?=\n\n|$)/i;
  const sourceIndex = blocks.findIndex(
    (b) => b?.__component === 'page-blocks.text-block' && phraseRegex.test(String(b?.content || ''))
  );
  const whyIndex = blocks.findIndex(
    (b) =>
      b?.__component === 'page-blocks.text-block' &&
      String(b?.content || '').toLowerCase().includes('waarom iso 27001')
  );

  if (sourceIndex !== -1 && whyIndex !== -1 && sourceIndex !== whyIndex) {
    const sourceText = String(blocks[sourceIndex].content || '');
    const match = sourceText.match(phraseRegex);
    if (match?.[0]) {
      const paragraph = match[0].trim();
      blocks[sourceIndex].content = sourceText.replace(match[0], '').replace(/\n{3,}/g, '\n\n').trim();
      if (!String(blocks[whyIndex].content || '').includes(paragraph)) {
        blocks[whyIndex].content = `${String(blocks[whyIndex].content || '').trim()}\n\n${paragraph}`.trim();
      }
      if (!String(blocks[sourceIndex].content || '').trim()) {
        blocks[sourceIndex] = null;
      }
    }
  }

  const compact = blocks.filter(Boolean) as NonNullable<Page['layout']>;

  // Keep CTA as last block on this page so body content always appears before CTA.
  return moveButtonsToEnd(compact);
}

export default async function CoreDetailPageTemplate({
  title,
  strapiSlug,
  hub,
  dataTopic,
}: CoreDetailPageTemplateProps) {
  const pageData = await getPage(strapiSlug);
  const layout =
    strapiSlug === 'iso-27001' && pageData?.layout
      ? normalizeIso27001Layout(pageData.layout)
      : pageData?.layout;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: hub.title, href: hub.href },
    { label: title, href: `${hub.href}/${strapiSlug}`.replace(/\/{2,}/g, '/') },
  ];

  if (!pageData || !Array.isArray(layout) || layout.length === 0) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-topic={dataTopic}>
        <CoreBreadcrumbBar items={breadcrumbs} />
        <section className="py-16 md:py-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
              <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
              <div className="p-8 md:p-10 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">{title}</h1>
                <p className="text-gray-600">
                  De inhoud voor deze pagina is niet beschikbaar. Controleer de Strapi configuratie.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AuthorityPageContent
      layout={layout}
      breadcrumbs={breadcrumbs}
      showBreadcrumbs
      dataTopic={dataTopic}
    />
  );
}
