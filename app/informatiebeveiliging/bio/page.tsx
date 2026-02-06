import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const BIO_CANONICAL_PATH = '/informatiebeveiliging/bio';
const DEFAULT_TITLE = 'BIO Certificering | MaasISO';
const DEFAULT_DESCRIPTION =
  'BIO certificering en informatiebeveiliging met MaasISO. Professionele begeleiding voor uw organisatie naar BIO certificering.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('bio');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: BIO_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BioPage() {
  return (
    <CoreDetailPageTemplate
      title="BIO"
      strapiSlug="bio"
      hub={{ title: 'Informatiebeveiliging', href: '/informatiebeveiliging' }}
      dataTopic="informatiebeveiliging"
    />
  );
}
