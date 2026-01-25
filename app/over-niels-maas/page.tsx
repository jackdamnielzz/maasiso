import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Over Niels Maas | Lead Consultant MaasISO',
  description: 'Niels Maas is expert in ISO-normen (9001, 27001), AVG/GDPR en BIO. Oprichter en lead consultant bij MaasISO.',
  alternates: {
    canonical: "/over-niels-maas",
  },
};

export default function OverNielsMaasPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Niels Maas',
    url: 'https://maasiso.nl/over-niels-maas',
    '@id': 'https://maasiso.nl/over-niels-maas#author',
    jobTitle: 'Lead Consultant & Oprichter',
    worksFor: { '@id': 'https://maasiso.nl/#professionalservice' },
  };

  const expertise = [
    { title: 'ISO 9001', description: 'Kwaliteitsmanagement' },
    { title: 'ISO 27001', description: 'Informatiebeveiliging' },
    { title: 'AVG / GDPR', description: 'Privacywetgeving' },
    { title: 'BIO', description: 'Baseline Informatiebeveiliging Overheid' },
  ];

  const publications = [
    {
      title: 'Risicogebaseerd denken: succesfactor voor kwaliteitsmanagement en ISO-certificering',
      link: '/blog/risicogebaseerd-denken-succesfactor-iso',
    },
    {
      title: 'ISO 9001 handboek: alles wat je moet weten voor een effectief kwaliteitsmanagementsysteem',
      link: '/blog/iso-9001-handboek-gids',
    },
    {
      title: 'De Ultieme Checklist ISO 14001',
      link: '/blog/checklist-iso-14001',
    },
    {
      title: 'ISMS Betekenis - Complete Gids voor ISO 27001',
      link: '/blog/isms-betekenis',
    },
    {
      title: 'De overstap naar de BIO voor overheidsinstanties',
      link: '/blog/bio-overheid',
    },
    {
      title: 'Kosten certificering ISO 9001 – hoe opgebouwd',
      link: '/blog/kosten-certificering-iso-9001-hoe-opgebouwd',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[#091E42] py-20 text-white">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Over Niels Maas</h1>
          <p className="text-xl max-w-2xl opacity-90 leading-relaxed">
            Niels Maas is een doorgewinterde expert in ISO-normen (9001, 27001), AVG/GDPR en de BIO. 
            Als oprichter en lead consultant bij MaasISO helpt hij organisaties met het professionaliseren 
            en beveiligen van hun bedrijfsvoering.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#091E42] mb-6">Mijn Rol</h2>
              <p className="text-[#091E42]/80 text-lg mb-6 leading-relaxed">
                Als Oprichter en Lead Consultant bij MaasISO is Niels de drijvende kracht achter de strategische 
                begeleiding van onze cliënten. Met jarenlange ervaring in diverse sectoren vertaalt hij 
                complexe normenkaders naar praktische, werkbare oplossingen die echt waarde toevoegen aan een organisatie.
              </p>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-bold text-[#091E42] mb-4">Expertise</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {expertise.map((item) => (
                    <div key={item.title} className="flex flex-col">
                      <span className="font-semibold text-blue-600">{item.title}</span>
                      <span className="text-sm text-gray-600">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-[#091E42] mb-6">Publicaties</h2>
              <p className="text-[#091E42]/80 mb-6">
                Lees meer over de visie en praktische tips van Niels in zijn meest recente publicaties:
              </p>
              <ul className="space-y-4">
                {publications.map((pub) => (
                  <li key={pub.link}>
                    <Link 
                      href={pub.link}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[#091E42] font-medium group-hover:text-blue-700 transition-colors">
                        {pub.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-[#091E42] mb-6">Wilt u kennismaken?</h2>
          <p className="text-[#091E42]/80 text-lg mb-8 max-w-2xl mx-auto">
            Heeft u vragen over ISO-certificering, informatiebeveiliging of privacy? 
            Niels denkt graag met u mee over een passende oplossing voor uw organisatie.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Neem contact op met Niels
          </Link>
        </div>
      </section>
    </div>
  );
}
