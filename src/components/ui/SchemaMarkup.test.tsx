import { render } from '@testing-library/react';
import SchemaMarkup from './SchemaMarkup';

describe('SchemaMarkup', () => {
  it('renders Service and FAQPage JSON-LD payloads', () => {
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
          url: 'https://www.maasiso.nl/iso-certificering/iso-9001',
        }}
        faq={{
          questions: [
            { question: 'Wat kost ISO 9001?', answer: 'Tussen X en Y.' },
            { question: 'Hoe lang duurt het?', answer: '3 tot 6 maanden.' },
          ],
        }}
      />
    );

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((node) =>
      JSON.parse(node.textContent || '{}')
    );

    const serviceSchema = scripts.find((script) => script['@type'] === 'Service');
    const faqSchema = scripts.find((script) => script['@type'] === 'FAQPage');

    expect(serviceSchema).toBeDefined();
    expect(serviceSchema.name).toBe('ISO 9001 certificering');
    expect(serviceSchema.url).toBe('https://www.maasiso.nl/iso-certificering/iso-9001');

    expect(faqSchema).toBeDefined();
    expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
    expect(faqSchema.mainEntity[0].name).toBe('Wat kost ISO 9001?');
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBe('Tussen X en Y.');
  });
});
