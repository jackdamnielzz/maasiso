import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';
import StickyLeadCapture from '@/components/marketing/StickyLeadCapture';

const ISO9001_CANONICAL_PATH = '/iso-certificering/iso-9001/';
const DEFAULT_TITLE = 'ISO 9001 Certificering | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 9001 certificering en kwaliteitsmanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 9001 certificering.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-9001');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO9001_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso9001Page() {
  return (
    <>
      <CoreDetailPageTemplate
        title="ISO 9001"
        strapiSlug="iso-9001"
        hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
        dataTopic="iso-certificering"
      />
      <StickyLeadCapture />
    </>
  );
}
