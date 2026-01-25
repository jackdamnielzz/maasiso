import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import Iso14001Wrapper from './Iso14001Wrapper';
import { Block } from './Iso14001Client';

export const metadata: Metadata = {
  title: 'ISO 14001 Certificering | MaasISO',
  description: 'ISO 14001 certificering en milieumanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 14001 certificering.',
  alternates: {
    canonical: "/iso-14001",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FallbackContent = () => (
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
);

export default async function Iso14001Page() {
  try {
    const pageData = await getPage('iso-14001');
    
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

    return <Iso14001Wrapper layout={transformedLayout} />;
  } catch (error) {
    console.error('Error loading ISO 14001 page:', error);
    return <FallbackContent />;
  }
}