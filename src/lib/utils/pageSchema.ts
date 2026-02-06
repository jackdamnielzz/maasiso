import type { Page } from '@/lib/types';
import { getCanonicalSiteUrl } from '@/lib/url/canonicalSiteUrl';

export type PageSchemaType = 'Article' | 'WebPage' | 'Service';

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

export function buildPageServiceSchema(
  page: Pick<
    Page,
    'schemaType' | 'title' | 'seoMetadata' | 'serviceName' | 'serviceDescription' | 'serviceType' | 'areaServed' | 'providerOverride'
  > | null | undefined,
  canonicalUrl: string
): ServiceSchemaData | undefined {
  if (!page || normalizePageSchemaType(page.schemaType) !== 'Service') {
    return undefined;
  }

  const canonical = String(canonicalUrl || '').trim();
  if (!canonical) {
    return undefined;
  }

  let sanitizedUrl: string;
  try {
    sanitizedUrl = sanitizeAbsoluteUrl(canonical);
  } catch {
    return undefined;
  }

  const name = String(page.serviceName || page.title || '').trim();
  const description = String(page.serviceDescription || page.seoMetadata?.metaDescription || '').trim();

  // Fail-safe: never render a malformed Service graph.
  if (!name || !description) {
    return undefined;
  }

  const areaServed = String(page.areaServed || 'NL').trim() || 'NL';
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
      name: 'MaasISO',
      url: getCanonicalSiteUrl(DEFAULT_PROVIDER_URL),
    };
  }

  return schema;
}
