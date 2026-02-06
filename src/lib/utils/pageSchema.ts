import type { Page } from '@/lib/types';
import { getCanonicalSiteUrl } from '@/lib/url/canonicalSiteUrl';

export type PageSchemaType = 'Article' | 'WebPage' | 'Service';
type PageSchemaInput = Pick<
  Page,
  | 'schemaType'
  | 'title'
  | 'seoMetadata'
  | 'serviceName'
  | 'serviceDescription'
  | 'serviceType'
  | 'areaServed'
  | 'providerOverride'
  | 'publicationDate'
  | 'publishedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export type ServiceSchemaData = {
  name: string;
  description: string;
  provider?: {
    name: string;
    url: string;
  };
  serviceType?: string;
  areaServed: string;
  url: string;
};

const PAGE_SCHEMA_TYPES: ReadonlySet<PageSchemaType> = new Set(['Article', 'WebPage', 'Service']);
const DEFAULT_PROVIDER_URL = 'https://www.maasiso.nl';
const DEFAULT_AREA_SERVED = 'Nederland';
const SCHEMA_CONTEXT = 'https://schema.org';
const ORGANIZATION_NAME = 'MaasISO';

export function normalizePageSchemaType(value: unknown): PageSchemaType {
  if (typeof value === 'string' && PAGE_SCHEMA_TYPES.has(value as PageSchemaType)) {
    return value as PageSchemaType;
  }

  return 'Article';
}

function sanitizeAbsoluteUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.search = '';
  return parsed.toString();
}

function pickFirstNonEmpty(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    const candidate = typeof value === 'string' ? value.trim() : '';
    if (candidate) {
      return candidate;
    }
  }

  return undefined;
}

function resolveCanonicalUrl(canonicalUrl: string): string | undefined {
  const canonical = String(canonicalUrl || '').trim();
  if (!canonical) {
    return undefined;
  }

  try {
    return sanitizeAbsoluteUrl(canonical);
  } catch {
    return undefined;
  }
}

export function getPagePublishedDate(
  page: Pick<Page, 'publicationDate' | 'publishedAt' | 'createdAt'> | null | undefined
): string | undefined {
  return pickFirstNonEmpty(page?.publicationDate, page?.publishedAt, page?.createdAt);
}

export function getPageModifiedDate(
  page: Pick<Page, 'updatedAt' | 'publishedAt' | 'createdAt'> | null | undefined
): string | undefined {
  return pickFirstNonEmpty(page?.updatedAt, page?.publishedAt, page?.createdAt);
}

export function buildPageServiceSchema(
  page: PageSchemaInput | null | undefined,
  canonicalUrl: string
): ServiceSchemaData | undefined {
  if (!page || normalizePageSchemaType(page.schemaType) !== 'Service') {
    return undefined;
  }

  const sanitizedUrl = resolveCanonicalUrl(canonicalUrl);
  if (!sanitizedUrl) {
    return undefined;
  }

  const name = String(page.serviceName || page.title || '').trim();
  const description = String(page.serviceDescription || page.seoMetadata?.metaDescription || '').trim();

  // Fail-safe: never render a malformed Service graph.
  if (!name || !description) {
    return undefined;
  }

  const areaServed = String(page.areaServed || DEFAULT_AREA_SERVED).trim() || DEFAULT_AREA_SERVED;
  const serviceType = String(page.serviceType || '').trim();
  const schema: ServiceSchemaData = {
    name,
    description,
    areaServed,
    url: sanitizedUrl,
  };

  if (serviceType) {
    schema.serviceType = serviceType;
  }

  if (!page.providerOverride) {
    schema.provider = {
      name: ORGANIZATION_NAME,
      url: getCanonicalSiteUrl(DEFAULT_PROVIDER_URL),
    };
  }

  return schema;
}

export function buildPagePrimarySchema(
  page: PageSchemaInput | null | undefined,
  canonicalUrl: string
): Record<string, unknown> | undefined {
  if (!page) {
    return undefined;
  }

  const schemaType = normalizePageSchemaType(page.schemaType);

  if (schemaType === 'Service') {
    const serviceSchema = buildPageServiceSchema(page, canonicalUrl);
    if (!serviceSchema) {
      return undefined;
    }

    const schema: Record<string, unknown> = {
      '@context': SCHEMA_CONTEXT,
      '@type': 'Service',
      name: serviceSchema.name,
      description: serviceSchema.description,
      url: serviceSchema.url,
      areaServed: serviceSchema.areaServed,
    };

    if (serviceSchema.provider?.name && serviceSchema.provider?.url) {
      schema.provider = {
        '@type': 'Organization',
        name: serviceSchema.provider.name,
        url: serviceSchema.provider.url,
      };
    }

    if (serviceSchema.serviceType) {
      schema.serviceType = serviceSchema.serviceType;
    }

    return schema;
  }

  const sanitizedUrl = resolveCanonicalUrl(canonicalUrl);
  const title = String(page.title || '').trim();

  if (!sanitizedUrl || !title) {
    return undefined;
  }

  const description = String(page.seoMetadata?.metaDescription || '').trim();
  const publishedDate = getPagePublishedDate(page);
  const modifiedDate = getPageModifiedDate(page);

  if (schemaType === 'WebPage') {
    const webPageSchema: Record<string, unknown> = {
      '@context': SCHEMA_CONTEXT,
      '@type': 'WebPage',
      name: title,
      url: sanitizedUrl,
    };

    if (description) {
      webPageSchema.description = description;
    }

    if (publishedDate) {
      webPageSchema.datePublished = publishedDate;
    }

    if (modifiedDate) {
      webPageSchema.dateModified = modifiedDate;
    }

    return webPageSchema;
  }

  const organizationUrl = getCanonicalSiteUrl(DEFAULT_PROVIDER_URL);
  const articleSchema: Record<string, unknown> = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: title,
    url: sanitizedUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': sanitizedUrl,
    },
    author: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: organizationUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: organizationUrl,
    },
  };

  if (description) {
    articleSchema.description = description;
  }

  if (publishedDate) {
    articleSchema.datePublished = publishedDate;
  }

  if (modifiedDate) {
    articleSchema.dateModified = modifiedDate;
  }

  return articleSchema;
}
