import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { getIconForFeature } from '@/lib/utils/iconMapper';
import { KeyTakeaways } from '@/components/features/KeyTakeaways';
import { FactBlock } from '@/components/features/FactBlock';
import { FaqSection } from '@/components/features/FaqSection';
import type { Page } from '@/lib/types';

type AuthorityPageContentProps = {
  layout?: NonNullable<Page['layout']>;
  testId?: string;
  featureGridTitleFallback?: string;
  featureGridTestId?: string;
};

const groupFactBlocks = (layout: NonNullable<Page['layout']> = []) => {
  const grouped: Array<NonNullable<Page['layout']>[number] | { __component: 'page-blocks.fact-block-group'; id: string; items: any[] }> = [];
  let factGroup: any[] = [];

  layout.forEach((block) => {
    if (block?.__component === 'page-blocks.fact-block') {
      factGroup.push(block);
      return;
    }

    if (factGroup.length) {
      grouped.push({
        __component: 'page-blocks.fact-block-group',
        id: `fact-block-group-${factGroup[0]?.id ?? grouped.length}`,
        items: factGroup
      });
      factGroup = [];
    }

    grouped.push(block);
  });

  if (factGroup.length) {
    grouped.push({
      __component: 'page-blocks.fact-block-group',
      id: `fact-block-group-${factGroup[0]?.id ?? grouped.length}`,
      items: factGroup
    });
  }

  return grouped;
};

export default function AuthorityPageContent({
  layout = [],
  testId,
  featureGridTitleFallback = 'De 5 stappen',
  featureGridTestId
}: AuthorityPageContentProps) {
  const layoutBlocks = groupFactBlocks(layout);

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-testid={testId}>
      {layoutBlocks.map((block: any) => {
        switch (block.__component) {
          case 'page-blocks.hero':
            return (
              <section key={block.id} className="hero-section relative overflow-hidden bg-[#091E42]">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                  <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
                </div>
                <div className="container-custom relative z-10">
                  <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 md:mb-6 text-white drop-shadow-lg">
                      {block.title}
                    </h1>
                    {block.subtitle && (
                      <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                        {block.subtitle}
                      </p>
                    )}
                    {block.ctaButton && (
                      <a
                        href={block.ctaButton.link}
                        className="primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {block.ctaButton.text}
                      </a>
                    )}
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.key-takeaways':
            return (
              <section key={block.id} className="pt-8 pb-4 md:pt-12 md:pb-8 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <KeyTakeaways items={block.items} className="max-w-5xl mx-auto" />
                </div>
              </section>
            );

          case 'page-blocks.fact-block-group': {
            if (!block.items || block.items.length === 0) {
              return null;
            }
            const factCount = block.items.length;
            const isSingle = factCount === 1;
            const remainder = factCount % 4;
            const shouldCenterLast = remainder === 1 && factCount > 4;
            const shouldCenterLastTwo = remainder === 2 && factCount > 4;
            const wrapperClass = isSingle ? 'max-w-3xl mx-auto' : '';
            const gridClass = isSingle
              ? 'relative grid grid-cols-1 place-items-center gap-4 sm:gap-6 md:gap-8'
              : 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8';
            const itemBaseClass = isSingle ? 'w-full max-w-sm' : 'w-full';
            return (
              <section key={block.id} className="py-10 md:py-16 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div
                    className={`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 px-5 py-6 md:px-10 md:py-10 shadow-md ${wrapperClass}`}
                  >
                    <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-[#00875A]/10 blur-3xl"></div>
                    <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-[#FF8B00]/10 blur-3xl"></div>
                    <div className={`${gridClass} min-w-0`}>
                      {block.items.map((fact: any, index: number) => {
                        const isLast = index === factCount - 1;
                        const isSecondLast = index === factCount - 2;
                        const balanceClass = shouldCenterLast && isLast
                          ? 'xl:col-span-2 xl:col-start-2 xl:justify-self-center xl:max-w-[320px]'
                          : shouldCenterLastTwo && isSecondLast
                            ? 'xl:col-start-2'
                            : '';
                        return (
                          <div key={fact.id || index} className={`${itemBaseClass} ${balanceClass} min-w-0`}>
                            <FactBlock data={fact} className="h-full" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'page-blocks.text-block':
            return (
              <section key={block.id} className="py-12 md:py-24">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-4xl mx-auto relative hover:shadow-xl transition-all duration-300">
                    <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
                    <div className="p-6 md:p-10">
                      <div className="absolute top-8 right-8 md:top-12 md:right-12 opacity-10 pointer-events-none">
                        <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="#091E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={`space-y-8 relative z-10 text-${block.alignment || 'left'}`}>
                        <ReactMarkdown
                          className="prose prose-headings:text-[#091E42] prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-a:text-[#00875A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#091E42] prose-strong:font-semibold prose-em:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:my-6 max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-[#00875A] prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md"
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            table: ({ node, ...props }) => (
                              <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] text-sm" {...props} />
                              </div>
                            )
                          }}
                        >
                          {block.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.feature-grid': {
            const features = Array.isArray(block.features) ? block.features : [];
            return (
              <section key={block.id} className="py-12 md:py-24 bg-[#F8FAFC]">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  {features.length > 0 ? (
                    <>
                      <div className="text-center mb-10 md:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 md:mb-4">
                          {block.title || featureGridTitleFallback}
                        </h2>
                        <div className="w-16 md:w-20 h-1 bg-[#00875A] mx-auto rounded-full"></div>
                        {block.subtitle && (
                          <p className="text-gray-600 text-center max-w-2xl mx-auto mt-4 md:mt-6 text-sm sm:text-base">
                            {block.subtitle}
                          </p>
                        )}
                      </div>
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6"
                        data-testid={featureGridTestId}
                      >
                        {features.map((feature: any, index: number) => {
                          const iconUrl = feature.icon?.url || getIconForFeature(feature.title || '');
                          const iconAlt = feature.icon?.alternativeText || feature.title || 'Stap icoon';
                          const content = feature.description?.trim() || `Wij bieden professionele begeleiding en advies voor ${feature.title}.`;
                          const isFiveSteps = features.length === 5;
                          const offsetClass =
                            isFiveSteps && index === 3
                              ? 'lg:col-start-2'
                              : isFiveSteps && index === 4
                                ? 'lg:col-start-4'
                                : '';
                          const card = (
                            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span className="inline-flex items-center rounded-full bg-[#00875A]/10 text-[#00875A] px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                                    Stap {index + 1}
                                  </span>
                                  <h3 className="mt-3 md:mt-4 text-base md:text-lg font-semibold text-[#091E42]">
                                    {feature.title || 'Stap'}
                                  </h3>
                                </div>
                                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                                  <img
                                    src={iconUrl}
                                    alt={iconAlt}
                                    className="h-5 w-5 md:h-6 md:w-6 object-contain"
                                  />
                                </div>
                              </div>
                              <div className="mt-4 text-gray-600">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkBreaks]}
                                  className="prose prose-sm max-w-none text-gray-600"
                                >
                                  {content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          );

                          return (
                            <div
                              key={feature.id || index}
                              className={`lg:col-span-2 ${offsetClass}`}
                            >
                              {feature.link ? (
                                <a href={feature.link} className="block h-full">
                                  {card}
                                </a>
                              ) : (
                                card
                              )}
                            </div>
                          );
                        })}
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
          }

          case 'page-blocks.faq-section':
            return (
              <section key={block.id} className="py-12 md:py-24 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    <FaqSection items={block.items} />
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.button':
            return (
              <section key={block.id} className="relative overflow-hidden bg-[#091E42] text-white py-14 md:py-24">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
                  <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
                </div>
                <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-tight">
                      {block.title || 'Klaar om de volgende stap te zetten?'}
                    </h2>
                    {block.description && (
                      <p className="text-sm sm:text-base md:text-lg text-white/85 mb-6 md:mb-8 leading-relaxed">
                        {block.description}
                      </p>
                    )}
                    <a
                      href={block.link || block.ctaButton?.link || '/contact'}
                      className="primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {block.text || block.ctaButton?.text || 'Neem contact op'}
                    </a>
                  </div>
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
