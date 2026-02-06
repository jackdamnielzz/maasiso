import { buildPageServiceSchema, normalizePageSchemaType } from '../pageSchema';

describe('pageSchema utils', () => {
  describe('normalizePageSchemaType', () => {
    it('returns Service for valid Service schema type', () => {
      expect(normalizePageSchemaType('Service')).toBe('Service');
    });

    it('defaults to Article for unknown schema type', () => {
      expect(normalizePageSchemaType('HowTo')).toBe('Article');
      expect(normalizePageSchemaType(undefined)).toBe('Article');
    });
  });

  describe('buildPageServiceSchema', () => {
    it('returns undefined when page schemaType is not Service', () => {
      const schema = buildPageServiceSchema(
        {
          schemaType: 'Article',
          title: 'ISO 9001',
          seoMetadata: { metaDescription: 'Beschrijving' },
        } as any,
        'https://www.maasiso.nl/iso-certificering/iso-9001/'
      );

      expect(schema).toBeUndefined();
    });

    it('builds a Service schema with defaults', () => {
      const schema = buildPageServiceSchema(
        {
          schemaType: 'Service',
          title: 'ISO 9001',
          seoMetadata: { metaDescription: 'Begeleiding voor ISO 9001.' },
          serviceType: 'ISO-certificering',
        } as any,
        'https://www.maasiso.nl/iso-certificering/iso-9001/?utm=123#fragment'
      );

      expect(schema).toEqual({
        name: 'ISO 9001',
        description: 'Begeleiding voor ISO 9001.',
        provider: {
          name: 'MaasISO',
          url: 'https://www.maasiso.nl',
        },
        serviceType: 'ISO-certificering',
        areaServed: 'NL',
        url: 'https://www.maasiso.nl/iso-certificering/iso-9001/',
      });
    });

    it('omits provider when providerOverride is enabled', () => {
      const schema = buildPageServiceSchema(
        {
          schemaType: 'Service',
          title: 'ISO 14001',
          serviceDescription: 'Milieumanagement begeleiding.',
          providerOverride: true,
        } as any,
        'https://www.maasiso.nl/iso-certificering/iso-14001'
      );

      expect(schema?.provider).toBeUndefined();
      expect(schema?.name).toBe('ISO 14001');
    });

    it('returns undefined when required Service values are missing', () => {
      const schema = buildPageServiceSchema(
        {
          schemaType: 'Service',
          title: 'ISO 27001',
          seoMetadata: { metaDescription: '' },
        } as any,
        'https://www.maasiso.nl/informatiebeveiliging/iso-27001'
      );

      expect(schema).toBeUndefined();
    });
  });
});
