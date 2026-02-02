import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import AuthorityPageContent from '@/components/features/AuthorityPageContent';

export const metadata: Metadata = {
  title: 'AVG & Privacy | MaasISO',
  description: 'AVG en privacy compliance met MaasISO. Professionele begeleiding voor uw organisatie bij het implementeren van AVG-richtlijnen en privacybeleid.',
  alternates: {
    canonical: "/avg-wetgeving/avg",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AvgPage() {
  let pageData = null;
  let hasValidContent = false;

  try {
    pageData = await getPage('avg');
    hasValidContent = Boolean(pageData && pageData.layout && pageData.layout.length > 0);
  } catch (error) {
    hasValidContent = false;
  }

  // Fallback content if Strapi data is missing
  if (!hasValidContent) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid="avg-fallback-content">
        <section className="py-16 md:py-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
              <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
              <div className="p-8 md:p-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
                  AVG & Privacy
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
  }

  return (
    <AuthorityPageContent
      layout={pageData?.layout}
      testId="avg-dynamic-content"
      featureGridTitleFallback="De 6 stappen"
      featureGridTestId="avg-feature-cards-carousel"
    />
  );
}
