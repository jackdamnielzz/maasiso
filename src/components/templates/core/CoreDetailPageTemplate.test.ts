jest.mock('@/components/features/AuthorityPageContent', () => () => null);
jest.mock('@/components/templates/core/CoreBreadcrumbBar', () => () => null);
jest.mock('@/components/ui/SchemaMarkup', () => () => null);
jest.mock('@/lib/api', () => ({
  getPage: jest.fn(),
}));

const { normalizeIso9001Layout } = require('./CoreDetailPageTemplate');

describe('normalizeIso9001Layout', () => {
  it('enforces the ISO 9001 block order and keeps CTA buttons at the end', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const layout: any = [
      { id: 'btn-top', __component: 'page-blocks.button', text: 'Top CTA', link: '/contact', style: 'primary' },
      { id: 'comparison', __component: 'page-blocks.text-block', content: '## ISO 9001 vs andere normen', alignment: 'left' },
      { id: 'hero', __component: 'page-blocks.hero', title: 'ISO 9001', subtitle: 'Sub' },
      { id: 'normstructuur', __component: 'page-blocks.text-block', content: '## Normstructuur ISO 9001 - clausules 4-10', alignment: 'left' },
      {
        id: 'grid-b',
        __component: 'page-blocks.feature-grid',
        features: [
          { id: 's3', title: 'Stap 3 - Implementatie', description: '...' },
          { id: 's5', title: 'Stap 5 - Certificering', description: '...' },
        ],
      },
      { id: 'definition', __component: 'page-blocks.text-block', content: '## Wat is ISO 9001?', alignment: 'left' },
      {
        id: 'faq',
        __component: 'page-blocks.faq-section',
        items: [{ id: 'q1', question: 'Vraag?', answer: 'Antwoord.' }],
      },
      { id: 'fact-1', __component: 'page-blocks.fact-block', label: 'Fact', value: 'Value' },
      {
        id: 'key',
        __component: 'page-blocks.key-takeaways',
        items: [{ id: 'k1', title: 'Kern', value: 'Waarde' }],
      },
      {
        id: 'grid-a',
        __component: 'page-blocks.feature-grid',
        features: [
          { id: 's1', title: 'Stap 1 - Gap-analyse', description: '...' },
          { id: 's2', title: 'Stap 2 - Documentatie', description: '...' },
        ],
      },
      { id: 'audit', __component: 'page-blocks.text-block', content: '## Auditproces ISO 9001 - fase 1 en fase 2', alignment: 'left' },
      { id: 'voordelen', __component: 'page-blocks.text-block', content: '## Voordelen van ISO 9001 Certificering', alignment: 'left' },
      { id: 'doorlooptijd', __component: 'page-blocks.text-block', content: '## Hoelang duurt ISO 9001 implementatie?', alignment: 'left' },
      { id: 'kosten', __component: 'page-blocks.text-block', content: '## Wat kost ISO 9001 certificering?', alignment: 'left' },
      { id: 'extra', __component: 'page-blocks.text-block', content: '## Implementatie-opmerking', alignment: 'left' },
      { id: 'btn-bottom', __component: 'page-blocks.button', text: 'Bottom CTA', link: '/contact', style: 'primary' },
    ];

    const normalized = normalizeIso9001Layout(layout);
    const componentOrder = normalized.map((block: any) => block.__component);

    expect(componentOrder[0]).toBe('page-blocks.hero');
    expect(componentOrder[1]).toBe('page-blocks.key-takeaways');
    expect(componentOrder[2]).toBe('page-blocks.fact-block');

    const firstButtonIndex = componentOrder.findIndex((component: string) => component === 'page-blocks.button');
    expect(firstButtonIndex).toBeGreaterThan(0);
    expect(componentOrder.slice(firstButtonIndex).every((component: string) => component === 'page-blocks.button')).toBe(
      true
    );

    const faqIndex = normalized.findIndex((block: any) => block.id === 'faq');
    const extraIndex = normalized.findIndex((block: any) => block.id === 'extra');
    expect(extraIndex).toBeGreaterThan(-1);
    expect(faqIndex).toBeGreaterThan(extraIndex);

    const featureGrids = normalized.filter((block: any) => block.__component === 'page-blocks.feature-grid');
    expect(featureGrids).toHaveLength(1);
    expect(featureGrids[0].features.map((feature: any) => feature.title)).toEqual([
      'Stap 1 - Gap-analyse',
      'Stap 2 - Documentatie',
      'Stap 3 - Implementatie',
      'Stap 5 - Certificering',
    ]);

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
