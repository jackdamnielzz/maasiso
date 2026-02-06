import { buildDetailPageMetadata } from '../pageMetadata';

describe('buildDetailPageMetadata', () => {
  it('renders article metadata with publication and modified dates', () => {
    const metadata = buildDetailPageMetadata({
      page: {
        id: '1',
        title: 'ISO 9001',
        slug: 'iso-9001',
        seoMetadata: {
          metaTitle: 'SEO titel',
          metaDescription: 'SEO omschrijving',
          keywords: 'iso',
        },
        schemaType: 'Article',
        publicationDate: '2026-02-01T10:00:00Z',
        publishedAt: '2026-02-02T10:00:00Z',
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-02-03T10:00:00Z',
      } as any,
      canonicalPath: '/iso-certificering/iso-9001/',
      fallbackTitle: 'Fallback title',
      fallbackDescription: 'Fallback description',
    });

    expect(metadata.title).toBe('SEO titel');
    expect(metadata.description).toBe('SEO omschrijving');
    expect((metadata.openGraph as any)?.type).toBe('article');
    expect((metadata.openGraph as any)?.publishedTime).toBe('2026-02-01T10:00:00Z');
    expect((metadata.openGraph as any)?.modifiedTime).toBe('2026-02-03T10:00:00Z');
    expect((metadata.other as any)?.datePublished).toBe('2026-02-01T10:00:00Z');
  });

  it('renders website metadata for Service pages', () => {
    const metadata = buildDetailPageMetadata({
      page: {
        id: '2',
        title: 'AVG',
        slug: 'avg',
        seoMetadata: {
          metaTitle: '',
          metaDescription: '',
          keywords: '',
        },
        schemaType: 'Service',
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-02-03T10:00:00Z',
      } as any,
      canonicalPath: '/avg-wetgeving/avg',
      fallbackTitle: 'AVG & Privacy',
      fallbackDescription: 'Fallback',
    });

    expect(metadata.title).toBe('AVG & Privacy');
    expect((metadata.openGraph as any)?.type).toBe('website');
    expect((metadata.openGraph as any)?.publishedTime).toBeUndefined();
    expect((metadata.openGraph as any)?.modifiedTime).toBe('2026-02-03T10:00:00Z');
  });
});
