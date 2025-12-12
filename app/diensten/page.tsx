import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import type { HeroComponent, Page, TextBlockComponent } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { CheckCircleIcon, LightBulbIcon } from '@heroicons/react/24/solid';
import { BriefcaseIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PageViewConversion from '@/components/common/PageViewConversion';

export const metadata: Metadata = {
  title: 'Diensten | MaasISO - ISO-certificering & Informatiebeveiliging',
  description: 'Ontdek de diensten van MaasISO op het gebied van ISO-certificering, informatiebeveiliging, AVG-compliance en meer. Professionele begeleiding voor uw organisatie.',
  keywords: 'ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO',
  alternates: {
    canonical: 'https://maasiso.nl/diensten',
  },
  openGraph: {
    type: 'website',
    url: 'https://maasiso.nl/diensten',
    title: 'Diensten | MaasISO - ISO-certificering & Informatiebeveiliging',
    description:
      'Ontdek de diensten van MaasISO op het gebied van ISO-certificering, informatiebeveiliging, AVG-compliance en meer. Professionele begeleiding voor uw organisatie.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diensten | MaasISO - ISO-certificering & Informatiebeveiliging',
    description:
      'Ontdek de diensten van MaasISO op het gebied van ISO-certificering, informatiebeveiliging, AVG-compliance en meer. Professionele begeleiding voor uw organisatie.',
  },
};

type ExpertiseItem = { title: string; description: string; link: string };

function parseExpertiseBlocks(content: string): ExpertiseItem[] {
  // Parseert de markdown van het "Onze Expertisegebieden" blok naar een array van diensten
  // Verwacht: ### Titel\n\nOmschrijving\n\n[**Lees meer** →](link)
  const regex = /### (.*?)\n+([\s\S]*?)(?:\[\*\*.*?\*\* →\]\((.*?)\))/g;
  const matches: ExpertiseItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    matches.push({
      title: match[1]?.trim() || '',
      description: (match[2] || '')
        .replace(/\n/g, ' ')
        .replace(/\[\*\*.*?\*\* →\]\(.*?\)/g, '')
        .trim(),
      link: match[3] || '#',
    });
  }
  return matches;
}

export default async function DienstenPage() {
  type PageData = Awaited<ReturnType<typeof getPage>>;
  let pageData: PageData = null;
  let hasValidContent = false;

  try {
    pageData = await getPage('diensten');
    hasValidContent = Boolean(pageData?.layout?.length);
  } catch {
    hasValidContent = false;
  }

  if (!hasValidContent) {
    return (
      <main className="flex-1 bg-gradient-to-b from-gray-50 via-white to-gray-50" data-testid="diensten-fallback-content">
        <section className="py-16 md:py-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10 max-w-3xl mx-auto relative transform hover:scale-[1.01] transition-transform duration-300">
              <div className="h-2 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
              <div className="p-10 md:p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00875A] to-[#006C48] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#091E42]">
                  MaasISO Diensten
                </h2>
                <p className="text-gray-600 mb-4 text-lg">
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

  // Zoek het juiste text-block voor de expertise grid
  type LayoutBlock = NonNullable<Page['layout']>[number];

  const expertiseBlock: TextBlockComponent | undefined =
    pageData?.layout?.find((block: LayoutBlock): block is TextBlockComponent => block.__component === 'page-blocks.text-block') ??
    undefined;

  const diensten =
    expertiseBlock?.content && expertiseBlock.content.includes('Onze Expertisegebieden')
      ? parseExpertiseBlocks(expertiseBlock.content)
      : [];

  const heroBlock: HeroComponent | undefined =
    pageData?.layout?.find((block: LayoutBlock): block is HeroComponent => block.__component === 'page-blocks.hero') ?? undefined;

  const heroTitle = heroBlock?.title || 'Diensten';
  const heroSubtitle = heroBlock?.subtitle || '';

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-50 via-white to-gray-50" data-testid="diensten-dynamic-content">
      {/* Hero (ALWAYS render an H1; never depend on Strapi block IDs) */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>

        <div className="container-custom relative z-10 text-center py-20 md:py-28">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">{heroTitle}</h1>

          {heroSubtitle ? (
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">{heroSubtitle}</p>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Plan kennismaking
            </Link>
          </div>
        </div>
      </section>

      {/* Other blocks (skip hero + expertise text-block used for grid) */}
      {pageData?.layout?.map((block: LayoutBlock) => {
        if (block.__component === 'page-blocks.hero') {
          return null;
        }

        // Sla text-blocks over die voor het grid gebruikt worden
        if (block.__component === 'page-blocks.text-block' && block.content.includes('Onze Expertisegebieden')) {
          return null;
        }

        // Custom card voor 'Onze Manier van Werken'
        if (block.__component === 'page-blocks.text-block' && block.content.includes('## Onze Manier van Werken')) {
          return (
            <section key={block.id} className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
              <div className="container-custom px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <div className="relative bg-gradient-to-br from-white to-[#f8fafb] rounded-3xl shadow-2xl overflow-hidden">
                    {/* Decoratief element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF8B00]/10 to-transparent rounded-full blur-3xl"></div>
                    
                    <div className="relative p-10 md:p-16">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gradient-to-br from-[#FF8B00] to-[#FF6B00] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <LightBulbIcon className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <h2 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-4">
                            Onze Manier van Werken
                          </h2>
                          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Meer weten over de pragmatische aanpak van MaasISO? 
                            Wilt u ontdekken hoe onze maatwerk consultancy trajecten eruitzien?
                          </p>
                          <Link href="/over-ons" 
                             className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00875A] to-[#006C48] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                            Ontdek onze aanpak
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }
        
        // Custom card voor 'Onze diensten kunnen bestaan uit'
        if (block.__component === 'page-blocks.text-block' && block.content.includes('## Onze diensten kunnen bestaan uit')) {
          return (
            <section key={block.id} className="py-16 md:py-24 bg-white">
              <div className="container-custom px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00875A] to-[#006C48] rounded-2xl shadow-lg mb-6">
                      <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#091E42]">
                      Onze diensten kunnen bestaan uit:
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group bg-gradient-to-br from-white to-[#f8fafb] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#00875A]/10 rounded-xl flex items-center justify-center group-hover:bg-[#00875A]/20 transition-colors duration-300">
                          <svg className="w-6 h-6 text-[#00875A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#091E42] mb-2">Advies op maat</h3>
                          <p className="text-gray-600">Helder en pragmatisch advies passend bij uw bedrijfssituatie.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-white to-[#f8fafb] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#FF8B00]/10 rounded-xl flex items-center justify-center group-hover:bg-[#FF8B00]/20 transition-colors duration-300">
                          <svg className="w-6 h-6 text-[#FF8B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#091E42] mb-2">Implementatiebegeleiding</h3>
                          <p className="text-gray-600">Concrete ondersteuning bij invoering van normen en systemen.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-white to-[#f8fafb] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#00875A]/10 rounded-xl flex items-center justify-center group-hover:bg-[#00875A]/20 transition-colors duration-300">
                          <svg className="w-6 h-6 text-[#00875A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#091E42] mb-2">Interne Audits</h3>
                          <p className="text-gray-600">Systematisch controleren en verbeteren van uw processen.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-white to-[#f8fafb] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#FF8B00]/10 rounded-xl flex items-center justify-center group-hover:bg-[#FF8B00]/20 transition-colors duration-300">
                          <svg className="w-6 h-6 text-[#FF8B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#091E42] mb-2">Voorbereiding op certificering</h3>
                          <p className="text-gray-600">Praktische hulp bij voorbereiden op een geslaagde certificeringsaudit.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </section>
              );
        }
        
        if (block.__component === 'page-blocks.text-block') {
          // Check voor de specifieke intro sectie
          if (block.content.includes('Praktische consultancy voor betere bedrijfsprocessen')) {
            return (
              <section key={block.id} className="relative py-20 md:py-32 overflow-hidden">
                {/* Achtergrond gradient met pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafb] via-white to-[#e8f4f0]">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                </div>
                
                {/* Decoratieve elementen */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#00875A] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#FF8B00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                
                <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="max-w-5xl mx-auto">
                    {/* Hoofdsectie met icoon */}
                    <div className="text-center mb-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00875A] to-[#006C48] rounded-2xl shadow-lg mb-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <BriefcaseIcon className="w-10 h-10 text-white" />
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-6 leading-tight">
                        Praktische consultancy voor<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00875A] to-[#006C48]">
                          betere bedrijfsprocessen
                        </span>
                      </h2>
                      
                      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Bij MaasISO geloven we in maatwerk en pragmatische oplossingen. Wij helpen MKB-bedrijven 
                        hun bedrijfsvoering structureel te verbeteren op het gebied van kwaliteitsmanagement, 
                        informatiebeveiliging en privacy.
                      </p>
                    </div>
                    
                    {/* Info card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 mb-16 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-[#FF8B00]/10 rounded-xl flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-[#FF8B00]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-[#091E42] mb-2">
                            Ontdek onze expertise
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            Op deze pagina vindt u een overzicht van onze expertisegebieden. 
                            Klik door naar de specifieke pagina’s voor meer uitgebreide informatie over elke dienst.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats/USP sectie */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
                      <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="text-4xl font-bold text-[#00875A] mb-2">10+</div>
                        <div className="text-gray-600">Jaar ervaring</div>
                      </div>
                      <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="text-4xl font-bold text-[#FF8B00] mb-2">100%</div>
                        <div className="text-gray-600">Pragmatisch</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }
          
          // Andere text-blocks blijven ongewijzigd
          return (
            <section key={block.id} className="py-10 md:py-16 bg-white">
              <div className="container-custom px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                  <ReactMarkdown
                    className="prose prose-lg prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-[#00875A] prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:text-gray-600 prose-p:my-6 max-w-none"
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                  >
                    {block.content}
                  </ReactMarkdown>
                </div>
              </div>
            </section>
          );
        }
        return null;
      })}

      {/* Diensten grid */}
      {diensten.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50 scroll-mt-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#091E42]">Onze Expertisegebieden</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {diensten.map((dienst, idx) => (
                <div
                  key={dienst.title + idx}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col justify-between border-t-4"
                  style={{ borderTopColor: idx % 2 === 0 ? '#00875A' : '#FF8B00' }}
                >
                  <h3 className="text-2xl font-bold text-[#091E42] mb-4">{dienst.title}</h3>
                  <p className="text-gray-600 mb-6 flex-1">{dienst.description}</p>
                  <Link
                    href={dienst.link}
                    className="inline-block mt-auto text-[#00875A] font-semibold hover:text-[#006C48] transition-colors"
                  >
                    Lees meer →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <PageViewConversion pageName="Services Overview" conversionValue={1.5} />
      </main>
    );
  }