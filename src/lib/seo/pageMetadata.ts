import type { Metadata } from 'next';
import type { Page } from '@/lib/types';
import { normalizePageSchemaType, getPageModifiedDate, getPagePublishedDate } from '@/lib/utils/pageSchema';

type BuildDetailPageMetadataOptions = {
  page: Page | null;
  canonicalPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

function normalizeCanonicalPath(path: string): string {
  const trimmed = String(path || '').trim();
  if (!trimmed) {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, '/');

  if (normalized === '/') {
    return normalized;
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

export function buildDetailPageMetadata({
  page,
  canonicalPath,
  fallbackTitle,
  fallbackDescription,
}: BuildDetailPageMetadataOptions): Metadata {
  const title = page?.seoMetadata?.metaTitle || fallbackTitle;
  const description = page?.seoMetadata?.metaDescription || fallbackDescription;
  const normalizedCanonicalPath = normalizeCanonicalPath(canonicalPath);
  const schemaType = normalizePageSchemaType(page?.schemaType);
  const publishedDate = getPagePublishedDate(page);
  const modifiedDate = getPageModifiedDate(page);
  const openGraphType = schemaType === 'Article' ? 'article' : 'website';

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: normalizedCanonicalPath,
    },
    openGraph: {
      type: openGraphType,
      url: normalizedCanonicalPath,
      title,
      description,
      ...(openGraphType === 'article' && publishedDate ? { publishedTime: publishedDate } : {}),
      ...(modifiedDate ? { modifiedTime: modifiedDate } : {}),
    },
  };

  const other: Record<string, string> = {};

  if (publishedDate) {
    other.datePublished = publishedDate;
  }

  if (modifiedDate) {
    other.dateModified = modifiedDate;
  }

  if (Object.keys(other).length > 0) {
    metadata.other = other;
  }

  return metadata;
}
