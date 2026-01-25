import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import DienstenContent from '@/components/features/DienstenContent';

export const metadata: Metadata = {
  title: 'Diensten | MaasISO - ISO-certificering & Informatiebeveiliging',
  description: 'Ontdek de diensten van MaasISO op het gebied van ISO-certificering, informatiebeveiliging, AVG-compliance en meer. Professionele begeleiding voor uw organisatie.',
  keywords: 'ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO',
  alternates: {
    canonical: "/diensten",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DienstenPage() {
  // Fetch content from Strapi
  let pageData = null;
  let hasValidContent = false;

  try {
    console.log("[Diensten] Fetching page data directly from Strapi...");
    pageData = await getPage('diensten');
    hasValidContent = Boolean(pageData && pageData.layout && pageData.layout.length > 0);
  } catch (error) {
    console.error('Error fetching Strapi content:', error);
  }

  // If we don't have valid content from Strapi, use fallback content
  if (!hasValidContent) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid="diensten-fallback-content">
        <section className="py-16 md:py-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
              <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
              <div className="p-8 md:p-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
                  MaasISO Diensten
                </h2>
                <p className="text-gray-600 mb-4">
                  De inhoud van deze pagina wordt momenteel bijgewerkt. Probeer het later opnieuw.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <DienstenContent pageData={pageData} />;
}
