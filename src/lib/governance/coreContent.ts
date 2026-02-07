import type { Page } from '@/lib/types';

type GovernanceIssueLevel = 'error' | 'warning';

export type GovernanceIssue = {
  level: GovernanceIssueLevel;
  code: string;
  message: string;
};

export type CoreDetailContent = {
  definition: string;
  explanationMarkdown: string;
  highlights: Array<{ id: string; title: string; value: string }>;
  costFacts: Array<{ id: string; label: string; value: string; source?: string | string[] }>;
  steps: Array<{ id: string; title: string; description: string; icon?: any; link?: string }>;
  faqItems: Array<{ id: string; question: string; answer: string }>;
};

export type GovernanceMode = 'strict' | 'warn';

export function getGovernanceMode(): GovernanceMode {
  const env = process.env.GOVERNANCE_STRICT;
  if (env === '0' || env === 'false') return 'warn';
  if (env === '1' || env === 'true') return 'strict';
  return process.env.NODE_ENV === 'production' ? 'strict' : 'warn';
}

function stripMarkdownHeadings(markdown: string): string {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/^(#{1,6})\s+.*$/gm, '')
    .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function firstParagraph(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';
  const parts = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return parts[0] || '';
}

export function extractCoreDetailContent(page: Page | null): { content: CoreDetailContent | null; issues: GovernanceIssue[] } {
  const issues: GovernanceIssue[] = [];
  if (!page) {
    return {
      content: null,
      issues: [{ level: 'error', code: 'missing_page', message: 'Geen Strapi pagina gevonden voor deze detailpagina.' }],
    };
  }

  const layout = page.layout ?? [];

  const allowed = new Set([
    // Legacy Strapi page-builder components that may still exist in data.
    // We treat them as content sources, but core structure is always rendered via templates.
    'page-blocks.hero',
    'page-blocks.key-takeaways',
    'page-blocks.text-block',
    'page-blocks.feature-grid',
    'page-blocks.faq-section',
    'page-blocks.fact-block',
    'page-blocks.button',
  ]);

  for (const block of layout) {
    if (!allowed.has(block.__component)) {
      issues.push({
        level: 'error',
        code: 'disallowed_component',
        message: `Strapi layout bevat niet-toegestane component: "${block.__component}". Deze core detailpagina gebruikt een vaste template; verwijder niet-core componenten uit Strapi.`,
      });
    }
  }

  const keyTakeaways = layout.find((b): b is any => b.__component === 'page-blocks.key-takeaways');
  const highlights = (keyTakeaways?.items ?? [])
    .map((item: any, idx: number) => ({
      id: String(item.id ?? idx),
      title: String(item.title ?? '').trim(),
      value: String(item.value ?? '').trim(),
    }))
    .filter((item: any) => item.title && item.value);

  const factBlocks = layout
    .filter((b): b is any => b.__component === 'page-blocks.fact-block')
    .map((b: any) => ({
      id: String(b.id ?? ''),
      label: String(b.label ?? ''),
      value: String(b.value ?? ''),
      source: Array.isArray(b.source)
        ? b.source.map((item: unknown) => String(item)).filter(Boolean)
        : b.source
          ? String(b.source)
          : undefined,
    }))
    .filter((b) => b.label || b.value);
  const costFacts = factBlocks;

  const textBlocks = layout
    .filter((b): b is any => b.__component === 'page-blocks.text-block')
    .map((b: any) => String(b.content ?? '').trim())
    .filter(Boolean);

  const definition = textBlocks.length ? firstParagraph(stripMarkdownHeadings(textBlocks[0])) : '';
  const explanationMarkdown = textBlocks.map(stripMarkdownHeadings).filter(Boolean).join('\n\n');

  if (!explanationMarkdown) {
    issues.push({
      level: 'error',
      code: 'missing_explanation',
      message: 'Core detailpagina mist uitleg: voeg minimaal één text-block toe.',
    });
  }

  const featureGrids = layout.filter((b): b is any => b.__component === 'page-blocks.feature-grid');
  if (featureGrids.length === 0) {
    issues.push({
      level: 'warning',
      code: 'missing_steps',
      message: 'Stappenplan ontbreekt: voeg een feature-grid toe in Strapi (wordt gebruikt in de sectie “Stappenplan”).',
    });
  } else if (featureGrids.length > 1) {
    issues.push({
      level: 'warning',
      code: 'multiple_steps',
      message: 'Meerdere feature-grids gevonden; alleen de eerste wordt gebruikt voor het stappenplan.',
    });
  }

  const steps = (featureGrids[0]?.features ?? []).map((f: any, idx: number) => ({
    id: String(f.id ?? idx),
    title: String(f.title ?? '').trim(),
    description: String(f.description ?? '').trim(),
    icon: f.icon,
    link: f.link,
  })).filter((s: any) => s.title || s.description);

  if (featureGrids.length > 0 && steps.length === 0) {
    issues.push({
      level: 'warning',
      code: 'empty_steps',
      message: 'Stappenplan is leeg: feature-grid moet minimaal één item bevatten.',
    });
  }

  const faqSections = layout.filter((b): b is any => b.__component === 'page-blocks.faq-section');
  if (faqSections.length === 0) {
    issues.push({
      level: 'error',
      code: 'missing_faq',
      message: 'FAQ ontbreekt: voeg een faq-section toe in Strapi (verplicht).',
    });
  } else if (faqSections.length > 1) {
    issues.push({
      level: 'warning',
      code: 'multiple_faq',
      message: 'Meerdere faq-sections gevonden; alleen de eerste wordt gebruikt.',
    });
  }

  const faqItems = (faqSections[0]?.items ?? []).map((item: any, idx: number) => ({
    id: String(item.id ?? idx),
    question: String(item.question ?? '').trim(),
    answer: String(item.answer ?? '').trim(),
  })).filter((item: any) => item.question && item.answer);

  if (faqSections.length > 0 && faqItems.length === 0) {
    issues.push({
      level: 'warning',
      code: 'empty_faq',
      message: 'FAQ is leeg: faq-section moet minimaal één item bevatten.',
    });
  }

  if (!definition.trim()) {
    issues.push({
      level: 'warning',
      code: 'missing_definition',
      message: 'Definitieblok kon niet worden afgeleid uit de eerste text-block. Zorg dat het eerste text-block start met een korte definitie (zonder heading).',
    });
  }

  const content: CoreDetailContent = {
    definition: definition.trim(),
    explanationMarkdown,
    highlights,
    costFacts,
    steps,
    faqItems,
  };

  return { content, issues };
}

export function assertGovernance(issues: GovernanceIssue[], context: string) {
  const mode = getGovernanceMode();
  const errors = issues.filter((i) => i.level === 'error');
  if (errors.length === 0) return;

  const message = [
    `Governance violation (${context})`,
    ...errors.map((e) => `- [${e.code}] ${e.message}`),
  ].join('\n');

  if (mode === 'strict') {
    throw new Error(message);
  }

  // eslint-disable-next-line no-console
  console.warn(message);
}
