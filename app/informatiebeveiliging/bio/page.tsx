import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const BIO_CANONICAL_PATH = '/informatiebeveiliging/bio';
const DEFAULT_TITLE = 'BIO (Baseline Informatiebeveiliging Overheid): Begeleiding & Advies | MaasISO';
const DEFAULT_DESCRIPTION =
  'BIO-compliance voor overheidsorganisaties. Van BIR naar BIO: praktische begeleiding bij implementatie, gap-analyse en naleving van de Baseline Informatiebeveiliging Overheid.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('bio');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: BIO_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// ISR: revalidate every 24 hours
export const revalidate = 86400;

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
