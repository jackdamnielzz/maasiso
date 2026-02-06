import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';

const ISO9001_CANONICAL_PATH = '/iso-certificering/iso-9001';
const DEFAULT_TITLE = 'ISO 9001 Certificering | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 9001 certificering en kwaliteitsmanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 9001 certificering.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-9001');
  const title = pageData?.seoMetadata?.metaTitle || DEFAULT_TITLE;
  const description = pageData?.seoMetadata?.metaDescription || DEFAULT_DESCRIPTION;
  const publishedTime = pageData?.publicationDate || pageData?.publishedAt || pageData?.createdAt;
  const modifiedTime = pageData?.updatedAt || pageData?.publishedAt || pageData?.createdAt;

  return {
    title,
    description,
    alternates: {
      canonical: ISO9001_CANONICAL_PATH,
    },
    openGraph: {
      type: 'article',
      url: ISO9001_CANONICAL_PATH,
      title,
      description,
      publishedTime,
      modifiedTime,
    },
  };
}

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso9001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 9001"
      strapiSlug="iso-9001"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
    />
  );
}
