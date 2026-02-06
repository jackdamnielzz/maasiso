import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const ISO27001_CANONICAL_PATH = '/informatiebeveiliging/iso-27001';
const DEFAULT_TITLE = 'ISO 27001 Certificering | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 27001 certificering en informatiebeveiliging met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 27001 certificering.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-27001');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO27001_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso27001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 27001"
      strapiSlug="iso-27001"
      hub={{ title: 'Informatiebeveiliging', href: '/informatiebeveiliging' }}
      dataTopic="informatiebeveiliging"
    />
  );
}
