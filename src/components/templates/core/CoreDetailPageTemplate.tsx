import { getPage } from '@/lib/api';
import { assertGovernance, extractCoreDetailContent } from '@/lib/governance/coreContent';
import { getIconForFeature } from '@/lib/utils/iconMapper';
import { FaqSection } from '@/components/features/FaqSection';
import FactBlock from '@/components/features/FactBlock';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import CoreMarkdown from '@/components/templates/core/CoreMarkdown';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import RelatedServices from '@/components/ui/RelatedServices';
import { getRelatedServices } from '@/lib/utils/serviceRelations';

type CoreDetailPageTemplateProps = {
  title: string;
  strapiSlug: string;
  hub: {
    title: string;
    href: string;
  };
  dataTopic?: string;
};

export default async function CoreDetailPageTemplate({
  title,
  strapiSlug,
  hub,
  dataTopic,
}: CoreDetailPageTemplateProps) {
  const pageData = await getPage(strapiSlug);
  const { content, issues } = extractCoreDetailContent(pageData);
  const hardErrors = issues.filter((i) => i.level === 'error');
  const fatalErrors = hardErrors.filter((i) => i.code === 'disallowed_component');
  if (fatalErrors.length) {
    assertGovernance(issues, `core detail: ${strapiSlug}`);
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: hub.title, href: hub.href },
    { label: title, href: `${hub.href}/${strapiSlug}`.replace(/\/{2,}/g, '/') },
  ];

  if (!content || hardErrors.length) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-topic={dataTopic}>
        <CoreBreadcrumbBar items={breadcrumbs} />
        <section className="py-16 md:py-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
              <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
              <div className="p-8 md:p-10 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">{title}</h1>
                <p className="text-gray-600">
                  De inhoud voor deze pagina is niet beschikbaar. Controleer de Strapi configuratie.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-topic={dataTopic}>
      <CoreBreadcrumbBar items={breadcrumbs} />

      <section className="hero-section relative overflow-hidden bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {title}
          </h1>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Onderdeel van{' '}
            <Link href={hub.href} className="underline underline-offset-4 hover:text-white">
              {hub.title}
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Plan een kennismaking
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-6">Key Takeaways</h2>
            {content.highlights.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.highlights.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-4 shadow-sm"
                  >
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {item.title}
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#091E42]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Key takeaways volgen.</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-4">Definitie</h2>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed">{content.definition}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-[#F8FAFC]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-6">Context</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                Deze pagina is onderdeel van{' '}
                <Link href={hub.href} className="underline underline-offset-4 hover:text-[#091E42]">
                  {hub.title}
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-[#F8FAFC]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-6">Voor wie en waarom</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <CoreMarkdown markdown={content.explanationMarkdown} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-6">Kosten</h2>
            {content.costFacts.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {content.costFacts.map((fact) => (
                  <FactBlock key={fact.id || fact.label} data={fact as any} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Kosteninformatie volgt.</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-[#F8FAFC]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 md:mb-4">
                Stappenplan
              </h2>
              <div className="w-16 md:w-20 h-1 bg-[#00875A] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
              {content.steps.length ? content.steps.map((step, index) => {
                const iconUrl = step.icon?.url || getIconForFeature(step.title || '');
                const iconAlt = step.icon?.alternativeText || step.title || 'Stap icoon';
                const isFiveSteps = content.steps.length === 5;
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
                          {step.title || 'Stap'}
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
                    {step.description ? (
                      <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                );

                return step.link ? (
                  <a
                    key={step.id}
                    href={step.link}
                    className={`lg:col-span-2 ${offsetClass}`}
                    target={step.link.startsWith('http') ? '_blank' : undefined}
                    rel={step.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {card}
                  </a>
                ) : (
                  <div key={step.id} className={`lg:col-span-2 ${offsetClass}`}>
                    {card}
                  </div>
                );
              }) : (
                <div className="col-span-full text-center text-gray-600">
                  Stappenplan volgt.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {content.faqItems.length ? (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: content.faqItems.map((item) => ({
                      '@type': 'Question',
                      name: item.question,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                      },
                    })),
                  }),
                }}
              />
            ) : null}
            <FaqSection items={content.faqItems as any} />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-[#F8FAFC]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-4">Gerelateerd</h2>
            <p className="text-gray-600 mb-6">
              Bekijk alle onderwerpen binnen{' '}
              <Link href={hub.href} className="underline underline-offset-4 hover:text-[#091E42]">
                {hub.title}
              </Link>
              .
            </p>
          </div>
        </div>
        <RelatedServices services={getRelatedServices(strapiSlug)} />
      </section>

      <section className="bg-[#091E42] text-white py-14 md:py-20">
        <div className="container-custom text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Klaar om te starten?
          </h2>
          <Link
            href="/contact"
            className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Plan een kennismaking
          </Link>
        </div>
      </section>
    </main>
  );
}
