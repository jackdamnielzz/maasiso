import { mapPage } from '@/lib/api';

describe('mapPage', () => {
  it('maps publicationDate from raw Strapi page data', () => {
    const rawData = {
      id: 99,
      title: 'ISO 9001',
      slug: 'iso-9001',
      seoTitle: 'SEO title',
      seoDescription: 'SEO description',
      seoKeywords: 'iso,9001',
      publicationDate: '2026-02-02T08:30:00Z',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-03T10:00:00Z',
      publishedAt: '2026-02-03T10:00:00Z',
      layout: [],
    };

    const mapped = mapPage(rawData);

    expect(mapped).not.toBeNull();
    expect(mapped?.publicationDate).toBe('2026-02-02T08:30:00Z');
  });

  it('maps featuredImage when Strapi returns an array relation', () => {
    const rawData = {
      id: 100,
      title: 'ISO 45001',
      slug: 'iso-45001',
      seoTitle: 'SEO title',
      seoDescription: 'SEO description',
      seoKeywords: 'iso,45001',
      featuredImage: [
        {
          id: 200,
          name: 'hero.jpg',
          alternativeText: 'Hero',
          width: 1200,
          height: 630,
          formats: {},
          hash: 'hero',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 12,
          url: '/uploads/hero.jpg',
          provider: 'local',
          createdAt: '2026-02-01T10:00:00Z',
          updatedAt: '2026-02-01T10:00:00Z',
          publishedAt: '2026-02-01T10:00:00Z',
        },
      ],
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-03T10:00:00Z',
      publishedAt: '2026-02-03T10:00:00Z',
      layout: [],
    };

    const mapped = mapPage(rawData);

    expect(mapped).not.toBeNull();
    expect(mapped?.featuredImage?.url).toBe('/uploads/hero.jpg');
    expect(mapped?.featuredImage?.alternativeText).toBe('Hero');
  });

  it('maps featuredImage when Strapi returns a v5 single relation with data object', () => {
    const rawData = {
      id: 101,
      title: 'AVG',
      slug: 'avg',
      seoTitle: 'SEO title',
      seoDescription: 'SEO description',
      seoKeywords: 'avg,privacy',
      featuredImage: {
        data: {
          id: 201,
          name: 'avg-hero.jpg',
          alternativeText: 'AVG Hero',
          width: 1280,
          height: 720,
          formats: {},
          hash: 'avg-hero',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 14,
          url: '/uploads/avg-hero.jpg',
          provider: 'local',
          createdAt: '2026-02-01T10:00:00Z',
          updatedAt: '2026-02-01T10:00:00Z',
          publishedAt: '2026-02-01T10:00:00Z',
        },
      },
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-03T10:00:00Z',
      publishedAt: '2026-02-03T10:00:00Z',
      layout: [],
    };

    const mapped = mapPage(rawData);

    expect(mapped).not.toBeNull();
    expect(mapped?.featuredImage?.url).toBe('/uploads/avg-hero.jpg');
    expect(mapped?.featuredImage?.alternativeText).toBe('AVG Hero');
  });
});
