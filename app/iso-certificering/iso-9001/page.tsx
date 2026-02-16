import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';
import StickyLeadCapture from '@/components/marketing/StickyLeadCapture';

const ISO9001_CANONICAL_PATH = '/iso-certificering/iso-9001/';
const ISO9001_HERO_IMAGE = '/hero-iso9001-pagina.jpg';
const ISO9001_SECTION_IMAGE = '/iso9001-clausules-4-10.png';
const ISO9001_IMPLEMENTATION_DURATION_IMAGE = '/dea107c7-1d12-41a0-9349-2e1c8936acc2.jpg';
const ISO9001_BENEFITS_SECTION_IMAGE = '/dd9e8ce8-66e3-4a59-ba73-aa96c529a3a3.jpg';
const ISO9001_AUDIT_SECTION_IMAGE = '/2f4d7977-bf5a-438f-a452-7cd40e810128.png';
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
        heroImage={{ src: ISO9001_HERO_IMAGE, alt: 'ISO 9001 certificering en kwaliteitsmanagement' }}
        sectionImage={{
          src: ISO9001_SECTION_IMAGE,
          alt: 'Clausules 4-10 uit ISO 9001'
        }}
        benefitsSectionImage={{
          src: ISO9001_BENEFITS_SECTION_IMAGE,
          alt: 'Samenvatting van voordelen van ISO 9001 certificering'
        }}
        auditSectionImage={{
          src: ISO9001_AUDIT_SECTION_IMAGE,
          alt: 'Hoe verloopt een ISO 9001 audit'
        }}
        implementationDurationImage={{
          src: ISO9001_IMPLEMENTATION_DURATION_IMAGE,
          alt: 'Hoe lang duurt ISO 9001 implementatie'
        }}
      />
      <StickyLeadCapture />
    </>
  );
}
