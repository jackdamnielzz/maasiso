import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import AuthorityPageContent from '@/components/features/AuthorityPageContent';
import SchemaMarkup from '@/components/ui/SchemaMarkup';

export const metadata: Metadata = {
  title: 'ISO 14001 Certificering | MaasISO',
  description: 'ISO 14001 certificering en milieumanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 14001 certificering.',
  alternates: {
    canonical: "/iso-certificering/iso-14001",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'ISO-certificering', href: '/iso-certificering' },
  { label: 'ISO 14001', href: '/iso-certificering/iso-14001' }
];

const FallbackContent = () => (
  <main
    className="flex-1 bg-gradient-to-b from-blue-50 to-white"
    data-testid="iso14001-fallback-content"
    data-topic="iso-certificering"
  >
    <SchemaMarkup
      breadcrumbs={{
        items: [
          { name: 'Home', item: 'https://maasiso.nl' },
          { name: 'ISO-certificering', item: 'https://maasiso.nl/iso-certificering' },
          { name: 'ISO 14001', item: 'https://maasiso.nl/iso-certificering/iso-14001' }
        ]
      }}
    />
    <section className="py-16 md:py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
          <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
          <div className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
              ISO 14001 Certificering
            </h2>
            <p className="text-gray-600 mb-4">
              De inhoud van deze pagina wordt geladen vanuit het Content Management Systeem (Strapi).
            </p>
            <p className="text-gray-600">
              Neem contact op met de beheerder als deze melding blijft bestaan.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default async function Iso14001Page() {
  try {
    const pageData = await getPage('iso-14001');
    
    if (!pageData?.layout?.length) {
      return <FallbackContent />;
    }

    return (
      <AuthorityPageContent
        layout={pageData.layout}
        testId="iso14001-dynamic-content"
        featureGridTestId="iso14001-feature-cards-grid"
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={false}
        dataTopic="iso-certificering"
      />
    );
  } catch (error) {
    console.error('Error loading ISO 14001 page:', error);
    return <FallbackContent />;
  }
}
