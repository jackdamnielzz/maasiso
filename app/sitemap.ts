import { getBlogPosts, getWhitepapers } from '@/lib/api';
import { MetadataRoute } from 'next';
import { BlogPost, StrapiData, Whitepaper } from '@/lib/types';
import { REMOVED_PATHS } from '@/config/removed-urls';

export const revalidate = 3600;
const isDebugLoggingEnabled =
  process.env.NODE_ENV !== 'production' || process.env.MAASISO_DEBUG === '1';
const STATIC_LASTMOD_FALLBACK = '2026-02-03T00:00:00.000Z';

function getStableLastModifiedDate(): Date {
  const configured = process.env.SITEMAP_STATIC_LASTMOD || STATIC_LASTMOD_FALLBACK;
  const parsed = new Date(configured);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(STATIC_LASTMOD_FALLBACK);
  }
  return parsed;
}

function resolveLastModifiedDate(
  dateCandidates: Array<string | Date | undefined>,
  fallback: Date
): Date {
  for (const candidate of dateCandidates) {
    if (!candidate) continue;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return fallback;
}

// Helper function for authenticated fetch to Strapi for collections not yet in api.ts
async function fetchStrapiCollection<T>(path: string): Promise<T[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
  const token = process.env.STRAPI_TOKEN;

  if (!token) {
    console.error('Sitemap: STRAPI_TOKEN is missing');
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error(`Sitemap: Failed to fetch ${path}, status: ${response.status}`);
      return [];
    }

    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error(`Sitemap: Error fetching ${path}:`, error);
    return [];
  }
}

type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiPaginatedResponse<T> = {
  data: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim();
  return trimmed.replace(/\/+$/g, '');
}

function canonicalizeSitemapBaseUrl(input: string): string {
  try {
    const parsed = new URL(normalizeBaseUrl(input));

    if (parsed.hostname === 'maasiso.nl') {
      parsed.hostname = 'www.maasiso.nl';
    }

    parsed.protocol = 'https:';
    return normalizeBaseUrl(parsed.toString());
  } catch {
    return 'https://www.maasiso.nl';
  }
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === '' || trimmed === '/') return '/';
  const normalized = `/${trimmed.replace(/^\/+/, '').replace(/\/+$/g, '')}`;
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function buildUrl(base: string, path: string): string {
  const normalizedBase = normalizeBaseUrl(base);
  const normalizedPath = normalizePath(path);
  return `${normalizedBase}${normalizedPath}`.trim();
}

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

async function fetchStrapiPaginated<T>(path: string): Promise<StrapiPaginatedResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
  const token = process.env.STRAPI_TOKEN;

  if (!token) {
    console.error('Sitemap: STRAPI_TOKEN is missing');
    return { data: [] };
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error(`Sitemap: Failed to fetch ${path}, status: ${response.status}`);
      return { data: [] };
    }

    const json = await response.json();
    return json as StrapiPaginatedResponse<T>;
  } catch (error) {
    console.error(`Sitemap: Error fetching ${path}:`, error);
    return { data: [] };
  }
}

async function fetchAllBlogPosts(): Promise<{ posts: BlogPost[]; total: number }> {
  const pageSize = 100;
  let page = 1;
  let posts: BlogPost[] = [];
  let total = 0;

  do {
    const result = await getBlogPosts(page, pageSize);
    posts = posts.concat(result.posts);
    total = result.total || posts.length;
    page += 1;
  } while (posts.length < total);

  return { posts, total };
}

async function fetchAllWhitepapers(): Promise<{ whitepapers: { data: StrapiData<Whitepaper>[] }; total: number }> {
  const pageSize = 100;
  let page = 1;
  let whitepapers: StrapiData<Whitepaper>[] = [];
  let total = 0;

  do {
    const result = await getWhitepapers(page, pageSize);
    whitepapers = whitepapers.concat(result.whitepapers.data);
    total = result.total || whitepapers.length;
    page += 1;
  } while (whitepapers.length < total);

  return { whitepapers: { data: whitepapers }, total };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = canonicalizeSitemapBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maasiso.nl'
  );
  const stableLastModified = getStableLastModifiedDate();
  
  // Base static routes
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/kennis',
    '/kennis/blog',
    '/kennis/whitepapers',
    '/kennis/e-learning',
    '/over-ons',
    '/over-niels-maas',
    '/contact',
    '/waarom-maasiso',
    '/iso-selector',
    '/privacy-policy',
    '/terms-and-conditions',
    '/cookie-policy',
    '/informatiebeveiliging',
    '/informatiebeveiliging/iso-27001',
    '/informatiebeveiliging/bio',
    '/iso-certificering',
    '/iso-certificering/iso-9001/',
    '/iso-certificering/iso-14001',
    '/iso-certificering/iso-45001',
    '/iso-certificering/iso-16175',
    '/avg-wetgeving',
    '/avg-wetgeving/avg',
  ]
    .filter(route => !REMOVED_PATHS.has(route))
    .map((route) => ({
      url: buildUrl(baseUrl, route),
      lastModified: stableLastModified,
      changeFrequency: 'daily',
      priority: route === '' ? 1 : 0.8,
    }));

  try {
    // Fetch all dynamic content in parallel with individual error handling
    const [blogResult, whitepaperResult]: [
      Awaited<ReturnType<typeof fetchAllBlogPosts>>,
      Awaited<ReturnType<typeof fetchAllWhitepapers>>
    ] = await Promise.all([
      fetchAllBlogPosts().catch(err => {
        console.error('Sitemap: Failed to fetch blog posts:', err);
        return { posts: [], total: 0 };
      }),
      fetchAllWhitepapers().catch(err => {
        console.error('Sitemap: Failed to fetch whitepapers:', err);
        return {
          whitepapers: { data: [] as StrapiData<Whitepaper>[] },
          total: 0
        };
      }),
    ]);

    // Log counts for debugging
    if (isDebugLoggingEnabled) {
      console.log(
        `Sitemap: ${blogResult.posts.length} blogposts, ${whitepaperResult.whitepapers.data.length} whitepapers`
      );
    }

    // Map Blog Posts
    // Use updatedAt as priority for freshness signals (important for SEO)
    const blogEntries: MetadataRoute.Sitemap = blogResult.posts
      .filter(post => post.slug)
      .filter(post => {
        const slug = normalizeSlug(post.slug);
        return (
          !REMOVED_PATHS.has(`/blog/${slug}`) &&
          !REMOVED_PATHS.has(`/kennis/blog/${slug}`)
        );
      })
      .map(post => ({
        url: buildUrl(baseUrl, `/kennis/blog/${normalizeSlug(post.slug)}`),
        lastModified: resolveLastModifiedDate(
          [post.updatedAt, post.publishedAt, post.createdAt],
          stableLastModified
        ),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    // Map Whitepapers
    const whitepaperEntries: MetadataRoute.Sitemap = whitepaperResult.whitepapers.data
      .filter(item => item.attributes?.slug)
      .map(item => ({
        url: buildUrl(baseUrl, `/kennis/whitepapers/${normalizeSlug(item.attributes.slug)}`),
        lastModified: resolveLastModifiedDate(
          [item.attributes.updatedAt, item.attributes.publishedAt, item.attributes.createdAt],
          stableLastModified
        ),
        changeFrequency: 'monthly',
        priority: 0.5,
      }));

    const entries = [
      ...staticPages,
      ...blogEntries,
      ...whitepaperEntries
    ];
    const dedupedByUrl = new Map<string, MetadataRoute.Sitemap[number]>();
    for (const entry of entries) {
      if (!dedupedByUrl.has(entry.url)) {
        dedupedByUrl.set(entry.url, entry);
      }
    }
    return Array.from(dedupedByUrl.values());

  } catch (error) {
    console.error('Critical error during sitemap generation:', error);
    // Fallback to at least the static pages
    return staticPages;
  }
}
