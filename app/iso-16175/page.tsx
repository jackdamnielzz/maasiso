import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import Iso16175Wrapper from './Iso16175Wrapper';
import { Block } from './Iso16175Client';

export const metadata: Metadata = {
  title: 'ISO 16175 Certificering | MaasISO',
  description: 'ISO 16175 certificering en documentbeheer met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 16175 certificering.',
  alternates: {
    canonical: "/iso-16175",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FallbackContent = () => (
  <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid="iso16175-fallback-content">
    <section className="py-16 md:py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
          <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
          <div className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
              ISO 16175 Certificering
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

export default async function Iso16175Page() {
  try {
    const pageData = await getPage('iso-16175');
    
    if (!pageData?.layout?.length) {
      return <FallbackContent />;
    }

    // Transform the layout data to match the Block interface
    const transformedLayout = pageData.layout.map((block: any) => ({
      id: typeof block.id === 'string' ? parseInt(block.id, 10) : block.id,
      __component: block.__component,
      title: block.title,
      subtitle: block.subtitle,
      content: block.content,
      alignment: block.alignment,
      features: block.features,
      ctaButton: block.ctaButton,
      description: block.description,
      link: block.link,
      text: block.text
    })) as Block[];

    return <Iso16175Wrapper layout={transformedLayout} />;
  } catch (error) {
    console.error('Error loading ISO 16175 page:', error);
    return <FallbackContent />;
  }
}