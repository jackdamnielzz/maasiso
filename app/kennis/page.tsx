import type { Metadata } from 'next';
import CoreHubPageTemplate from '@/components/templates/core/CoreHubPageTemplate';

export const metadata: Metadata = {
  title: 'Kennis & Resources | MaasISO',
  description:
    'Verdiep je in ISO-certificering, informatiebeveiliging en privacy via onze artikelen, whitepapers en trainingen.',
  alternates: {
    canonical: '/kennis',
  },
};

const knowledgeCards = [
  {
    title: 'Blog',
    description: 'Artikelen over actuele onderwerpen en praktische inzichten.',
    href: '/kennis/blog',
    linkLabel: 'Blog',
  },
];

export default function KennisHubPage() {
  return (
    <CoreHubPageTemplate
      visualVariant="iso-premium"
      title="Kennis & Resources"
      intro="Verdiep je in ISO-certificering, informatiebeveiliging en compliance via onze artikelen, whitepapers en trainingen."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Kennis', href: '/kennis' },
      ]}
      cards={knowledgeCards}
      ctas={[
        { label: 'Bekijk de blog', href: '/kennis/blog', variant: 'primary' },
        { label: 'Plan een kennismaking', href: '/contact', variant: 'secondary' },
      ]}
      cardsHeading="Start met onze blog"
      cardsDescription="Hier publiceren we actuele artikelen en praktische inzichten."
      afterCards={
        <section className="!py-12 lg:!py-20 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">
                Binnenkort meer kennis
              </h2>
              <p className="mt-4 text-gray-600 text-base sm:text-lg">
                Whitepapers en nieuws worden aangevuld. Tot die tijd vindt u alle updates in onze
                blog.
              </p>
            </div>
            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <article className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 md:p-7 shadow-sm">
                <span className="inline-flex items-center rounded-full bg-[#FFF4E6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FF8B00]">
                  Binnenkort
                </span>
                <h3 className="mt-4 text-lg md:text-xl font-semibold text-[#091E42]">Whitepapers</h3>
                <p className="mt-3 text-gray-600">
                  Diepgaande gidsen en downloads om keuzes te onderbouwen.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 md:p-7 shadow-sm">
                <span className="inline-flex items-center rounded-full bg-[#FFF4E6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FF8B00]">
                  Binnenkort
                </span>
                <h3 className="mt-4 text-lg md:text-xl font-semibold text-[#091E42]">Nieuws</h3>
                <p className="mt-3 text-gray-600">
                  Updates en relevante ontwikkelingen rondom normen, audits en compliance.
                </p>
              </article>
            </div>
          </div>
        </section>
      }
      dataTopic="kennis"
    />
  );
}
