import { render } from '@testing-library/react';
import SchemaMarkup from './SchemaMarkup';

describe('SchemaMarkup', () => {
  const extractGraphNodes = (payload: any) =>
    Array.isArray(payload?.['@graph']) ? payload['@graph'] : [payload];

  it('renders a provided primary schema payload', () => {
    const { container } = render(
      <SchemaMarkup
        primary={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Testpagina',
          url: 'https://www.maasiso.nl/testpagina',
        }}
      />
    );

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((node) =>
      JSON.parse(node.textContent || '{}')
    );

    expect(scripts).toHaveLength(1);
    expect(scripts[0]['@type']).toBe('WebPage');
    expect(scripts[0].name).toBe('Testpagina');
  });

  it('renders Service and FAQPage JSON-LD payloads in a single script', () => {
    const { container } = render(
      <SchemaMarkup
        service={{
          name: 'ISO 9001 certificering',
          description: 'Beschrijving',
          provider: {
            name: 'MaasISO',
            url: 'https://www.maasiso.nl',
          },
          serviceType: 'ISO 9001 certificering',
          areaServed: 'NL',
          url: 'https://www.maasiso.nl/iso-certificering/iso-9001',
        }}
        faq={{
          questions: [
            { question: 'Wat kost **ISO 9001**?', answer: 'Tussen **X** en <strong>Y</strong>.' },
            { question: 'Hoe lang duurt het?', answer: '3 tot 6 maanden.' },
          ],
        }}
      />
    );

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((node) =>
      JSON.parse(node.textContent || '{}')
    );

    expect(scripts).toHaveLength(1);

    const nodes = extractGraphNodes(scripts[0]);
    const serviceSchema = nodes.find((script: any) => script['@type'] === 'Service');
    const faqSchema = nodes.find((script: any) => script['@type'] === 'FAQPage');

    expect(serviceSchema).toBeDefined();
    expect(serviceSchema.name).toBe('ISO 9001 certificering');
    expect(serviceSchema.url).toBe('https://www.maasiso.nl/iso-certificering/iso-9001');
    expect(serviceSchema.areaServed).toBe('NL');
    expect(serviceSchema.provider['@type']).toBe('Organization');

    expect(faqSchema).toBeDefined();
    expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
    expect(faqSchema.mainEntity[0].name).toBe('Wat kost ISO 9001?');
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBe('Tussen X en Y.');
  });
});
