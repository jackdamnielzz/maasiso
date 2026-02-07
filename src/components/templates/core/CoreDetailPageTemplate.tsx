import { getPage } from '@/lib/api';
import AuthorityPageContent from '@/components/features/AuthorityPageContent';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import PageSchemaRenderer from '@/components/seo/PageSchemaRenderer';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Page } from '@/lib/types';
import { getCanonicalSiteUrl } from '@/lib/url/canonicalSiteUrl';

type CoreDetailPageTemplateProps = {
  title: string;
  strapiSlug: string;
  hub: {
    title: string;
    href: string;
  };
  dataTopic?: string;
};

type Layout = NonNullable<Page['layout']>;
type LayoutBlock = Layout[number] & Record<string, any>;

type StepCandidate = {
  step: number;
  title: string;
  description: string;
};

type Iso9001TextBucket =
  | 'wat-is'
  | 'normstructuur'
  | 'voordelen'
  | 'kosten'
  | 'doorlooptijd'
  | 'vergelijking'
  | 'auditproces'
  | 'other';

const ISO27001_WHY_PARAGRAPH_REGEX =
  /ISO 27001 laat zien dat informatiebeveiliging[\s\S]*?verantwoordelijkheden\./i;
const ISO27001_STEP3_PARAGRAPH_REGEX =
  /Beleid,\s*procedures,\s*rollen en beheersmaatregelen worden ingericht en geïntegreerd in de dagelijkse bedrijfsvoering\./i;

const NIS2_ROW_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const;
const NIS2_FALLBACK_ROWS: Record<(typeof NIS2_ROW_KEYS)[number], { measure: string; control: string }> = {
  a: {
    measure: 'a) Beleid risicoanalyse en informatiebeveiliging',
    control: 'A.5.1 Beleid, A.5.2 Rollen',
  },
  b: {
    measure: 'b) Incidentenbehandeling',
    control: 'A.5.24-A.5.28 Incident management',
  },
  c: {
    measure: 'c) Bedrijfscontinuïteit en crisisbeheer',
    control: 'A.5.29-A.5.30 BCM',
  },
  d: {
    measure: 'd) Beveiliging toeleveringsketen',
    control: 'A.5.19-A.5.23 Leveranciersbeheer',
  },
  e: {
    measure: 'e) Beveiliging bij aankoop en ontwikkeling',
    control: 'A.8.25-A.8.31 Secure development',
  },
  f: {
    measure: 'f) Beoordelen effectiviteit maatregelen',
    control: 'A.5.35-A.5.36 Naleving en audit',
  },
  g: {
    measure: 'g) Cyberhygiëne en opleiding',
    control: 'A.6.3 Bewustwording',
  },
  h: {
    measure: 'h) Beleid cryptografie',
    control: 'A.8.24 Cryptografie',
  },
  i: {
    measure: 'i) Personeelsbeveiliging en toegangsbeleid',
    control: 'A.6.1-A.6.2, A.8.1-A.8.5',
  },
  j: {
    measure: 'j) Multifactorauthenticatie',
    control: 'A.8.5 Authenticatie',
  },
};

function cloneLayout(layout: Layout): Layout {
  return layout.map((block) => {
    if (block?.__component === 'page-blocks.feature-grid') {
      return {
        ...block,
        features: Array.isArray((block as any).features)
          ? (block as any).features.map((feature: any) => ({ ...feature }))
          : [],
      };
    }
    return { ...block };
  }) as Layout;
}

function getStepNumber(text: string | undefined): number | null {
  const match = String(text ?? '').match(/stap\s*([1-5])/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function extractLeakedStepsFromText(content: string): { cleanedContent: string; steps: StepCandidate[] } {
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const lines = normalizedContent.split('\n');
  const consumedIndexes = new Set<number>();
  const extractedSteps: StepCandidate[] = [];
  const stepHeaderRegex =
    /^\s*(?:[-*]\s*)?(?:#{1,6}\s*)?(?:\*\*)?\s*Stap\s*([45])\s*[:\-–]\s*(.+?)\s*(?:\*\*)?\s*$/i;

  for (let index = 0; index < lines.length; index += 1) {
    const headerMatch = lines[index].match(stepHeaderRegex);
    if (!headerMatch) continue;

    const step = Number(headerMatch[1]);
    const titleRemainder = headerMatch[2].trim();
    consumedIndexes.add(index);

    const descriptionLines: string[] = [];
    let cursor = index + 1;
    while (cursor < lines.length) {
      const currentLine = lines[cursor];
      if (stepHeaderRegex.test(currentLine)) break;
      if (/^\s*#{1,6}\s+/.test(currentLine)) break;
      consumedIndexes.add(cursor);
      descriptionLines.push(currentLine);
      cursor += 1;
    }

    extractedSteps.push({
      step,
      title: titleRemainder.startsWith(`Stap ${step}`) ? titleRemainder : `Stap ${step} - ${titleRemainder}`,
      description: descriptionLines.join('\n').trim(),
    });

    index = cursor - 1;
  }

  if (extractedSteps.length === 0) {
    return { cleanedContent: normalizedContent, steps: [] };
  }

  const cleanedContent = lines
    .filter((_, lineIndex) => !consumedIndexes.has(lineIndex))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanedContent, steps: extractedSteps };
}

function parseNis2Row(line: string): { key: string; measure: string; control: string } | null {
  // Strict: only match rows where first column explicitly starts with "a)" .. "j)"
  // and the mapping control column starts with an Annex A reference.
  const tableRowMatch = line.match(/^\s*\|\s*([a-j])[\)\.]\s+(.+?)\s*\|\s*(A\.[^|]+)\s*\|\s*$/i);
  if (tableRowMatch) {
    const key = tableRowMatch[1].toLowerCase();
    const rawMeasure = tableRowMatch[2].trim();
    const control = tableRowMatch[3].trim();
    return {
      key,
      measure: `${key}) ${rawMeasure}`.trim(),
      control,
    };
  }

  const looseRowMatch = line.match(/^\s*[-*]?\s*([a-j])[\)\.]\s+(.+?)\s+(A\.[0-9].*)\s*$/i);
  if (!looseRowMatch) return null;

  const key = looseRowMatch[1].toLowerCase();
  const rawMeasure = looseRowMatch[2].trim().replace(/^[a-j][\)\.]\s*/i, '');
  const control = looseRowMatch[3].trim();
  return {
    key,
    measure: `${key}) ${rawMeasure}`.trim(),
    control,
  };
}

function buildCanonicalNis2Table(rowsByKey: Map<string, { measure: string; control: string }>): string {
  const header = '| NIS2 Artikel 21 - Maatregel | ISO 27001 Annex A controls |';
  const separator = '|---|---|';
  const rows = NIS2_ROW_KEYS.map((key) => {
    const row = rowsByKey.get(key) ?? NIS2_FALLBACK_ROWS[key];
    return `| ${row.measure} | ${row.control} |`;
  });
  return [header, separator, ...rows].join('\n');
}

function normalizeNis2Table(content: string): string {
  const normalizedContent = content.replace(/\r\n/g, '\n');
  if (!normalizedContent.toLowerCase().includes('nis2 artikel 21')) {
    return normalizedContent;
  }

  const lines = normalizedContent.split('\n');
  const rowsByKey = new Map<string, { measure: string; control: string }>();
  lines.forEach((line) => {
    const parsed = parseNis2Row(line);
    if (parsed) {
      rowsByKey.set(parsed.key, { measure: parsed.measure, control: parsed.control });
    }
  });

  const rowLikeIndexes: number[] = [];
  lines.forEach((line, index) => {
    const isPipeOnly = line.trim() === '|';
    const isTableHeaderRow =
      /^\s*\|.*NIS2 Artikel 21.*\|.*ISO 27001 Annex A controls.*\|?\s*$/i.test(line);
    const isTableSeparatorRow = /^\s*\|?\s*:?-{3,}.*\|?\s*$/.test(line);
    const isTableRow = /^\s*\|.*\|.*\|\s*$/.test(line);
    const isLooseRow = parseNis2Row(line) !== null;

    if (isPipeOnly || isTableHeaderRow || isTableSeparatorRow || isTableRow || isLooseRow) {
      rowLikeIndexes.push(index);
    }
  });

  const firstRowIndex = rowLikeIndexes.length > 0 ? Math.min(...rowLikeIndexes) : -1;
  const lastRowIndex = rowLikeIndexes.length > 0 ? Math.max(...rowLikeIndexes) : -1;

  const prefix =
    firstRowIndex === -1
      ? lines.join('\n').trim()
      : lines.slice(0, firstRowIndex).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const suffix =
    lastRowIndex === -1
      ? ''
      : lines.slice(lastRowIndex + 1).join('\n').replace(/\n{3,}/g, '\n\n').trim();

  const canonicalTable = buildCanonicalNis2Table(rowsByKey);
  return [prefix, canonicalTable, suffix].filter(Boolean).join('\n\n').trim();
}

function mergeFeatureGrids(blocks: LayoutBlock[]): LayoutBlock | null {
  const featureGridIndexes = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block?.__component === 'page-blocks.feature-grid')
    .map(({ index }) => index);

  if (featureGridIndexes.length === 0) return null;

  const primary = blocks[featureGridIndexes[0]];
  const mergedFeatures = Array.isArray(primary.features) ? [...primary.features] : [];

  featureGridIndexes.slice(1).forEach((index) => {
    const extras = Array.isArray(blocks[index]?.features) ? blocks[index].features : [];
    mergedFeatures.push(...extras);
    blocks[index] = null as unknown as LayoutBlock;
  });

  primary.features = mergedFeatures;
  return primary;
}

function appendStepToFeatureGrid(grid: LayoutBlock, step: StepCandidate): void {
  const features = Array.isArray(grid.features) ? grid.features : [];
  const hasStepAlready = features.some((feature: any) => getStepNumber(feature?.title) === step.step);
  if (hasStepAlready) return;

  features.push({
    id: `iso27001-step-${step.step}`,
    title: step.title,
    description: step.description,
    link: '',
  });

  const sorted = [...features].sort((a: any, b: any) => {
    const aStep = getStepNumber(a?.title);
    const bStep = getStepNumber(b?.title);
    if (aStep && bStep) return aStep - bStep;
    if (aStep) return -1;
    if (bStep) return 1;
    return 0;
  });

  grid.features = sorted;
}

function sortFeatureGridSteps(grid: LayoutBlock): void {
  const features = Array.isArray(grid.features) ? [...grid.features] : [];
  if (!features.length) return;

  const sorted = features
    .map((feature: any, index: number) => ({ feature, index }))
    .sort((left, right) => {
      const leftStep = getStepNumber(String(left.feature?.title || ''));
      const rightStep = getStepNumber(String(right.feature?.title || ''));

      if (leftStep && rightStep) return leftStep - rightStep;
      if (leftStep) return -1;
      if (rightStep) return 1;
      return left.index - right.index;
    })
    .map((entry) => entry.feature);

  grid.features = sorted;
}

function getFirstMarkdownHeading(content: string): string {
  const match = content.replace(/\r\n/g, '\n').match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/m);
  return String(match?.[1] || '').replace(/[*_`]/g, '').trim();
}

function classifyIso9001TextBlock(block: LayoutBlock): Iso9001TextBucket {
  const rawContent = String(block?.content || '');
  const heading = getFirstMarkdownHeading(rawContent);
  const normalized = `${heading}\n${rawContent}`.toLowerCase();

  if (normalized.includes('wat is iso 9001')) return 'wat-is';
  if (
    normalized.includes('normstructuur iso 9001') ||
    normalized.includes('clausules 4-10') ||
    normalized.includes('clausules 4–10') ||
    (normalized.includes('clausules 4') && normalized.includes('clausules 10'))
  ) {
    return 'normstructuur';
  }
  if (normalized.includes('voordelen') && normalized.includes('iso 9001')) return 'voordelen';
  if (
    normalized.includes('wat kost iso 9001') ||
    normalized.includes('kosten iso 9001') ||
    normalized.includes('wat kost iso-9001')
  ) {
    return 'kosten';
  }
  if (
    normalized.includes('hoelang duurt iso 9001') ||
    normalized.includes('hoe lang duurt iso 9001') ||
    normalized.includes('doorlooptijd iso 9001')
  ) {
    return 'doorlooptijd';
  }
  if (
    normalized.includes('iso 9001 vs') ||
    normalized.includes('vs andere iso') ||
    normalized.includes('vs andere normen')
  ) {
    return 'vergelijking';
  }
  if (
    normalized.includes('auditproces') ||
    (normalized.includes('fase 1') && normalized.includes('fase 2') && normalized.includes('audit'))
  ) {
    return 'auditproces';
  }

  return 'other';
}

export function normalizeIso9001Layout(layout: Layout): Layout {
  const blocks = cloneLayout(layout) as LayoutBlock[];
  const primaryFeatureGrid = mergeFeatureGrids(blocks);

  if (primaryFeatureGrid) {
    sortFeatureGridSteps(primaryFeatureGrid);
  }

  const compact = blocks.filter(Boolean) as LayoutBlock[];
  const ordered: LayoutBlock[] = [];
  const consumed = new Set<LayoutBlock>();

  const takeFirst = (predicate: (block: LayoutBlock) => boolean) => {
    const block = compact.find((candidate) => !consumed.has(candidate) && predicate(candidate));
    if (!block) return;
    consumed.add(block);
    ordered.push(block);
  };

  const takeAll = (predicate: (block: LayoutBlock) => boolean) => {
    compact.forEach((block) => {
      if (consumed.has(block)) return;
      if (!predicate(block)) return;
      consumed.add(block);
      ordered.push(block);
    });
  };

  takeFirst((block) => block.__component === 'page-blocks.hero');
  takeFirst((block) => block.__component === 'page-blocks.key-takeaways');
  takeAll((block) => block.__component === 'page-blocks.fact-block');
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'wat-is'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'normstructuur'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'voordelen'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'kosten'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'doorlooptijd'
  );
  takeFirst((block) => block.__component === 'page-blocks.feature-grid');
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'vergelijking'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyIso9001TextBlock(block) === 'auditproces'
  );

  const unmatchedBeforeFaq = compact.filter(
    (block) =>
      !consumed.has(block) &&
      block.__component !== 'page-blocks.faq-section' &&
      block.__component !== 'page-blocks.button'
  );

  unmatchedBeforeFaq.forEach((block) => {
    console.warn('[ISO9001 Layout] Unmatched block placed before FAQ.', {
      component: block.__component,
      blockId: block.id,
      heading: block.__component === 'page-blocks.text-block' ? getFirstMarkdownHeading(String(block.content || '')) : '',
    });
    consumed.add(block);
    ordered.push(block);
  });

  takeAll((block) => block.__component === 'page-blocks.faq-section');
  takeAll((block) => block.__component === 'page-blocks.button');

  compact.forEach((block) => {
    if (consumed.has(block)) return;
    consumed.add(block);
    ordered.push(block);
  });

  return ordered as Layout;
}

function moveLooseNis2RowsToNis2Block(blocks: LayoutBlock[]): void {
  const targetIndex = blocks.findIndex(
    (block) =>
      block?.__component === 'page-blocks.text-block' &&
      String(block.content || '').toLowerCase().includes('nis2 artikel 21')
  );
  if (targetIndex === -1) return;

  const collectedRows: Array<{ measure: string; control: string }> = [];
  blocks.forEach((block, index) => {
    if (index === targetIndex || block?.__component !== 'page-blocks.text-block' || !block.content) return;

    const lines = String(block.content).replace(/\r\n/g, '\n').split('\n');
    let hasNis2Rows = false;
    const keepLines: string[] = [];

    lines.forEach((line) => {
      const parsed = parseNis2Row(line);
      if (parsed) {
        hasNis2Rows = true;
        collectedRows.push({ measure: parsed.measure, control: parsed.control });
        return;
      }
      keepLines.push(line);
    });

    if (!hasNis2Rows) return;

    const cleanedContent = keepLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    blocks[index].content = cleanedContent;
    if (!cleanedContent) {
      blocks[index] = null as unknown as LayoutBlock;
    }
  });

  if (collectedRows.length === 0) return;
  const existing = String(blocks[targetIndex].content || '').trim();
  const injectedRows = collectedRows.map((row) => `| ${row.measure} | ${row.control} |`).join('\n');
  blocks[targetIndex].content = `${existing}\n${injectedRows}`.trim();
}

function moveWhyParagraphToWaaromBlock(blocks: LayoutBlock[]): void {
  const whyIndex = blocks.findIndex(
    (block) =>
      block?.__component === 'page-blocks.text-block' &&
      String(block.content || '').toLowerCase().includes('waarom iso 27001')
  );
  if (whyIndex === -1) return;

  const whyContent = String(blocks[whyIndex].content || '');
  if (ISO27001_WHY_PARAGRAPH_REGEX.test(whyContent)) return;

  for (let index = 0; index < blocks.length; index += 1) {
    if (index === whyIndex) continue;
    const block = blocks[index];
    if (!block || block.__component !== 'page-blocks.text-block' || !block.content) continue;

    const sourceContent = String(block.content);
    const match = sourceContent.match(ISO27001_WHY_PARAGRAPH_REGEX);
    if (!match?.[0]) continue;

    const paragraph = match[0].trim();
    const cleanedSource = sourceContent.replace(match[0], '').replace(/\n{3,}/g, '\n\n').trim();
    blocks[index].content = cleanedSource;
    if (!cleanedSource) {
      blocks[index] = null as unknown as LayoutBlock;
    }

    blocks[whyIndex].content = `${String(blocks[whyIndex].content || '').trim()}\n\n${paragraph}`.trim();
    return;
  }
}

function moveStep3ParagraphIntoFeatureGrid(blocks: LayoutBlock[]): void {
  const primaryFeatureGrid = blocks.find((block) => block?.__component === 'page-blocks.feature-grid');
  if (!primaryFeatureGrid || !Array.isArray(primaryFeatureGrid.features)) return;

  let paragraphToMove = '';
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (!block || block.__component !== 'page-blocks.text-block' || !block.content) continue;

    const sourceContent = String(block.content);
    const match = sourceContent.match(ISO27001_STEP3_PARAGRAPH_REGEX);
    if (!match?.[0]) continue;

    paragraphToMove = match[0].trim();
    const cleaned = sourceContent.replace(match[0], '').replace(/\n{3,}/g, '\n\n').trim();
    blocks[index].content = cleaned;
    if (!cleaned) {
      blocks[index] = null as unknown as LayoutBlock;
    }
    break;
  }

  if (!paragraphToMove) return;

  const features = primaryFeatureGrid.features as any[];
  const step3Feature =
    features.find((feature) => getStepNumber(String(feature?.title || '')) === 3) || features[2];
  if (!step3Feature) return;

  const description = String(step3Feature.description || '').trim();
  if (description.includes(paragraphToMove)) return;
  step3Feature.description = [description, paragraphToMove].filter(Boolean).join('\n\n').trim();
}

function enforceIso27001TextOrder(blocks: LayoutBlock[]): Layout {
  const ordered: LayoutBlock[] = [];
  const consumed = new Set<LayoutBlock>();

  const takeFirst = (predicate: (block: LayoutBlock) => boolean) => {
    const block = blocks.find((candidate) => !consumed.has(candidate) && predicate(candidate));
    if (!block) return;
    consumed.add(block);
    ordered.push(block);
  };

  const takeAll = (predicate: (block: LayoutBlock) => boolean) => {
    blocks.forEach((block) => {
      if (consumed.has(block)) return;
      if (!predicate(block)) return;
      consumed.add(block);
      ordered.push(block);
    });
  };

  const classifyTextBlock = (content: string):
    | 'definition'
    | 'why'
    | 'annex'
    | 'cost'
    | 'duration'
    | 'comparison'
    | 'nis2'
    | 'other' => {
    const normalized = content.toLowerCase();
    if (normalized.includes('wat is iso 27001 certificering')) return 'definition';
    if (normalized.includes('waarom iso 27001')) return 'why';
    if (normalized.includes('annex a')) return 'annex';
    if (normalized.includes('wat kost iso 27001 certificering')) return 'cost';
    if (normalized.includes('hoelang duurt een iso 27001 traject') || normalized.includes('hoe lang duurt')) {
      return 'duration';
    }
    if (normalized.includes('iso 27001 vs iso 27002 vs nis2')) return 'comparison';
    if (normalized.includes('nis2 artikel 21')) return 'nis2';
    return 'other';
  };

  takeFirst((block) => block.__component === 'page-blocks.hero');
  takeFirst((block) => block.__component === 'page-blocks.key-takeaways');
  takeAll((block) => block.__component === 'page-blocks.fact-block');
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'definition'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'why'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'annex'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'cost'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'duration'
  );
  takeFirst((block) => block.__component === 'page-blocks.feature-grid');
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'comparison'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'nis2'
  );
  takeAll(
    (block) => block.__component === 'page-blocks.text-block' && classifyTextBlock(String(block.content || '')) === 'other'
  );
  takeAll((block) => block.__component === 'page-blocks.faq-section');

  blocks.forEach((block) => {
    if (consumed.has(block)) return;
    if (block.__component === 'page-blocks.button') return;
    consumed.add(block);
    ordered.push(block);
  });

  takeAll((block) => block.__component === 'page-blocks.button');

  return ordered as Layout;
}

export function normalizeIso27001Layout(layout: Layout): Layout {
  const blocks = cloneLayout(layout) as LayoutBlock[];
  const primaryFeatureGrid = mergeFeatureGrids(blocks);

  if (primaryFeatureGrid) {
    blocks.forEach((block, index) => {
      if (!block || block.__component !== 'page-blocks.text-block' || !block.content) return;
      if (!/stap\s*[45]\s*[:\-–]/i.test(String(block.content))) return;

      const { cleanedContent, steps } = extractLeakedStepsFromText(String(block.content));
      if (!steps.length) return;

      steps.forEach((step) => appendStepToFeatureGrid(primaryFeatureGrid, step));
      blocks[index].content = cleanedContent;
      if (!cleanedContent) {
        blocks[index] = null as unknown as LayoutBlock;
      }
    });
  }

  moveLooseNis2RowsToNis2Block(blocks);

  blocks.forEach((block, index) => {
    if (!block || block.__component !== 'page-blocks.text-block' || !block.content) return;
    if (!String(block.content).toLowerCase().includes('nis2 artikel 21')) return;
    blocks[index].content = normalizeNis2Table(String(block.content));
  });

  moveWhyParagraphToWaaromBlock(blocks);
  moveStep3ParagraphIntoFeatureGrid(blocks);

  const compact = blocks.filter(Boolean) as Layout;
  return enforceIso27001TextOrder(compact as LayoutBlock[]);
}

export default async function CoreDetailPageTemplate({
  title,
  strapiSlug,
  hub,
  dataTopic,
}: CoreDetailPageTemplateProps) {
  const pageData = await getPage(strapiSlug);
  const layout = pageData?.layout
    ? strapiSlug === 'iso-27001'
      ? normalizeIso27001Layout(pageData.layout)
      : strapiSlug === 'iso-9001'
        ? normalizeIso9001Layout(pageData.layout)
        : pageData.layout
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

  const siteUrl = getCanonicalSiteUrl();
  const baseDetailPath = `${hub.href}/${strapiSlug}`.replace(/\/{2,}/g, '/');
  const detailPath = baseDetailPath.endsWith('/') ? baseDetailPath : `${baseDetailPath}/`;
  const detailUrl = detailPath.startsWith('http') ? detailPath : `${siteUrl}${detailPath}`;

  const faqBlock = layout.find((block) => block.__component === 'page-blocks.faq-section') as LayoutBlock | undefined;
  const faqQuestions = Array.isArray(faqBlock?.items)
    ? faqBlock.items
      .map((item: any) => ({
        question: String(item?.question || '').trim(),
        answer: String(item?.answer || '').trim(),
      }))
      .filter((item: { question: string; answer: string }) => item.question && item.answer)
    : [];

  return (
    <>
      <PageSchemaRenderer page={pageData} canonicalUrl={detailUrl} faqQuestions={faqQuestions} />
      <AuthorityPageContent
        layout={layout}
        breadcrumbs={breadcrumbs}
        showBreadcrumbs
        dataTopic={dataTopic}
      />
    </>
  );
}
