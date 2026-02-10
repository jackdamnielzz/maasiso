import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const ISO14001_CANONICAL_PATH = '/iso-certificering/iso-14001';
const DEFAULT_TITLE = 'ISO 14001 Certificering | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 14001 certificering en milieumanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 14001 certificering.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-14001');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO14001_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso14001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 14001"
      strapiSlug="iso-14001"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
      visualVariant="home-premium"
    />
  );
}
