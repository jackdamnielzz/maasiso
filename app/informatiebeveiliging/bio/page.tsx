import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import AuthorityPageContent from '@/components/features/AuthorityPageContent';

export const metadata: Metadata = {
  title: 'BIO Certificering | MaasISO',
  description: 'BIO certificering en informatiebeveiliging met MaasISO. Professionele begeleiding voor uw organisatie naar BIO certificering.',
  alternates: {
    canonical: "/informatiebeveiliging/bio",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FallbackContent = () => (
  <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid="bio-fallback-content">
    <section className="py-16 md:py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
          <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
          <div className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
              BIO Certificering
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

export default async function BioPage() {
  try {
    const pageData = await getPage('bio');
    
    if (!pageData?.layout?.length) {
      return <FallbackContent />;
    }

    return (
      <AuthorityPageContent
        layout={pageData.layout}
        testId="bio-dynamic-content"
        featureGridTestId="bio-feature-cards-grid"
      />
    );
  } catch (error) {
    console.error('Error loading BIO page:', error);
    return <FallbackContent />;
  }
}
