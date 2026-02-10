import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const ISO16175_CANONICAL_PATH = '/iso-certificering/iso-16175';
const DEFAULT_TITLE = 'ISO 16175 Certificering | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 16175 certificering en documentbeheer met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 16175 certificering.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-16175');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO16175_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso16175Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 16175"
      strapiSlug="iso-16175"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
      visualVariant="home-premium"
    />
  );
}
