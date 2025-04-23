import { Metadata } from 'next';
import { getPage } from '@/lib/api';
import { Page } from '@/lib/types';
import { Feature } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import { getIconForFeature } from '@/lib/utils/iconMapper';
import FeatureCard from '@/components/ui/FeatureCard';
import FeatureCarousel from '@/components/ui/FeatureCarousel';

export const metadata: Metadata = {
  title: 'Diensten | MaasISO - ISO-certificering & Informatiebeveiliging',
  description: 'Ontdek de diensten van MaasISO op het gebied van ISO-certificering, informatiebeveiliging, AVG-compliance en meer. Professionele begeleiding voor uw organisatie.',
  keywords: 'ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO'
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

    console.log("[Diensten] Page data retrieved:", {
      success: !!pageData,
      hasLayout: !!pageData?.layout,
      layoutCount: pageData?.layout?.length || 0,
      componentTypes: pageData?.layout?.map((item: any) => item.__component)
    });

    // Check if we have valid content to render
    hasValidContent = Boolean(pageData && pageData.layout && pageData.layout.length > 0);

    // Log feature grid components if any
    if (pageData?.layout) {
      const featureGridComponents = pageData.layout.filter(block => block.__component === 'page-blocks.feature-grid');
      console.log(`[Diensten] Found ${featureGridComponents.length} feature-grid components`);

      // Log features count for each feature grid
      featureGridComponents.forEach((grid, index) => {
        console.log(`[Diensten] Feature grid #${index + 1} has ${grid.features?.length || 0} features`);
      });
    }
  } catch (error) {
    console.error('Error fetching Strapi content:', error);
    console.log('[Diensten] Attempting to fetch from simple-diensten-test API endpoint...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/simple-diensten-test`);
      const data = await response.json();
      console.log('[Diensten] simple-diensten-test response:', data);
    } catch (fallbackError) {
      console.error('[Diensten] Fallback API call also failed:', fallbackError);
    }

    // Enhanced error logging
    if (error instanceof Error) {
      console.error(`[Diensten] Error details: ${error.message}`);
      if ('status' in error) {
        const status = (error as any).status;
        console.error(`[Diensten] Error status: ${status}`);
      }
    }
    hasValidContent = false;
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

  // Display dynamic content if available
  if (hasValidContent) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid="diensten-dynamic-content">
        {pageData?.layout?.map((block: any) => {
          switch (block.__component) {
            case 'page-blocks.hero':
              return (
                <section key={block.id} className="hero-section relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                    <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
                  </div>

                  <div className="container-custom relative z-10">
                    <div className="text-center">
                      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        {block.title}
                      </h1>
                      {block.subtitle && (
                        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                          {block.subtitle}
                        </p>
                      )}
                      {block.ctaButton && (
                        <a
                          href={block.ctaButton.link}
                          className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {block.ctaButton.text}
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'page-blocks.text-block':
              return (
                <section key={block.id} className="py-16 md:py-24">
                  <div className="container-custom px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-4xl mx-auto relative hover:shadow-xl transition-all duration-300">
                      <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
                      <div className="p-8 md:p-10">
                        <div className="absolute top-12 right-12 opacity-10">
                          <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <ReactMarkdown
                          className={`prose prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:my-6 max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-[#00875A] prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md text-${block.alignment || 'left'}`}
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                        >
                          {block.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'page-blocks.feature-grid':
              return (
                <section key={block.id} className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-[#00875A] rounded-full opacity-5 -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-5 -ml-20 -mb-20"></div>

                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {block.features && block.features.length > 0 ? (
                      <>
                        <div className="text-center mb-16">
                          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 relative inline-block">
                            {block.title || 'Onze Expertisegebieden'}
                            <span className="absolute -bottom-3 left-1/2 w-20 h-1 bg-[#00875A] transform -translate-x-1/2"></span>
                          </h2>
                          {block.subtitle && (
                            <p className="text-gray-600 text-center max-w-2xl mx-auto mt-6">
                              Klik op een expertisegebied hieronder voor meer informatie over onze dienstverlening op dat gebied.
                            </p>
                          )}
                        </div>
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative" data-testid="service-cards-carousel">
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 flex items-center">
                            <svg className="w-5 h-5 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Scroll voor meer expertisegebieden
                          </div>
                          <FeatureCarousel>
                            {block.features.map((feature: any) => {
                              // Determine the correct internal link based on the service title
                              const getServiceLink = (title: string): string => {
                                const titleLower = title.toLowerCase();
                                if (titleLower.includes('iso 9001')) return '/iso-9001';
                                if (titleLower.includes('iso 27001')) return '/iso-27001';
                                if (titleLower.includes('iso 14001')) return '/iso-14001';
                                if (titleLower.includes('iso 16175')) return '/iso-16175';
                                if (titleLower.includes('avg') || titleLower.includes('privacy')) return '/avg';
                                return feature.link || '#'; // Fallback to CMS link or hash
                              };

                              const icon = feature.icon?.url ? (
                                <div className="w-16 h-16">
                                  <img
                                    src={feature.icon.url}
                                    alt={feature.icon.alternativeText || feature.title || 'Service icon'}
                                    className="w-full h-full object-contain"
                                    data-testid="service-icon"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16">
                                  <img
                                    src={getIconForFeature(feature.title || '')}
                                    alt={feature.title || 'Service icon'}
                                    className="w-full h-full object-contain"
                                    data-testid="service-icon"
                                  />
                                </div>
                              );

                              const content = feature.description?.trim() || `Wij bieden professionele begeleiding en advies voor ${feature.title}.`;

                              return (
                                <FeatureCard
                                  key={feature.id}
                                  title={feature.title || 'Service Title'}
                                  content={content}
                                  icon={icon}
                                  showMoreInfo={true}
                                  link={getServiceLink(feature.title || '')}
                                  className="max-w-[614px] mx-auto w-full px-4"
                                  data-testid={`service-card-${feature.id}`}
                                />
                              );
                            })}
                          </FeatureCarousel>
                        </div>
                      </>
                    ) : (
                      <div className="py-8">
                        <div className="w-20 h-1 bg-[#00875A] mx-auto"></div>
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'page-blocks.button':
              return (
                <section key={block.id} className="bg-[#091E42] text-white py-16 md:py-24 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                    <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
                  </div>
                  <div className="container-custom text-center relative z-10 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
                      {block.title || "Klaar om uw organisatie naar een hoger niveau te tillen?"}
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                      {block.description || "Neem contact op voor een vrijblijvend gesprek over hoe MaasISO u kan helpen met ISO-certificering en informatiebeveiliging."}
                    </p>
                    <a
                      href={block.link}
                      className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {block.text}
                    </a>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>
    );
  }
}