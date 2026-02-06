import { buildPagePrimarySchema, buildPageServiceSchema, normalizePageSchemaType } from '../pageSchema';

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
        areaServed: 'Nederland',
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

  describe('buildPagePrimarySchema', () => {
    it('builds an Article schema for default page types', () => {
      const schema = buildPagePrimarySchema(
        {
          schemaType: 'Article',
          title: 'ISO 27001',
          seoMetadata: { metaDescription: 'Informatiebeveiliging volgens ISO 27001.' },
          publicationDate: '2026-02-01T10:00:00Z',
          updatedAt: '2026-02-03T11:00:00Z',
        } as any,
        'https://www.maasiso.nl/informatiebeveiliging/iso-27001/'
      );

      expect(schema).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'ISO 27001',
        description: 'Informatiebeveiliging volgens ISO 27001.',
        datePublished: '2026-02-01T10:00:00Z',
        dateModified: '2026-02-03T11:00:00Z',
        url: 'https://www.maasiso.nl/informatiebeveiliging/iso-27001/',
      });
    });

    it('builds a WebPage schema when explicitly selected', () => {
      const schema = buildPagePrimarySchema(
        {
          schemaType: 'WebPage',
          title: 'Waarom MaasISO',
          seoMetadata: { metaDescription: 'Positionering en aanpak.' },
        } as any,
        'https://www.maasiso.nl/waarom-maasiso/'
      );

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Waarom MaasISO',
        description: 'Positionering en aanpak.',
        url: 'https://www.maasiso.nl/waarom-maasiso/',
      });
    });

    it('builds a Service schema when Service is selected', () => {
      const schema = buildPagePrimarySchema(
        {
          schemaType: 'Service',
          title: 'ISO 9001',
          seoMetadata: { metaDescription: 'Beschrijving' },
          serviceType: 'ISO-certificering',
        } as any,
        'https://www.maasiso.nl/iso-certificering/iso-9001/'
      );

      expect(schema).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'ISO 9001',
        description: 'Beschrijving',
        areaServed: 'Nederland',
        url: 'https://www.maasiso.nl/iso-certificering/iso-9001/',
      });
    });
  });
});
