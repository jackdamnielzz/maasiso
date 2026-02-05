import type { ReactNode } from 'react';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import Link from 'next/link';

export type HubCard = {
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
};

export type HubCta = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type TopicHubProps = {
  variant?: 'topic';
  title: string;
  intro?: string;
  definition?: string;
  scope?: string;
  breadcrumbs: BreadcrumbItem[];
  cards: HubCard[];
  ctas?: HubCta[];
  cardsHeading?: string;
  cardsDescription?: string;
  afterCards?: ReactNode;
  dataTopic?: string;
};

type CustomHubProps = {
  variant: 'custom';
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  dataTopic?: string;
};

type CoreHubPageTemplateProps = TopicHubProps | CustomHubProps;

export default function CoreHubPageTemplate(props: CoreHubPageTemplateProps) {
  if (props.variant === 'custom') {
    return (
      <>
        <CoreBreadcrumbBar items={props.breadcrumbs} />
        <div data-topic={props.dataTopic}>{props.children}</div>
      </>
    );
  }

  const {
    title,
    intro,
    definition,
    scope,
    breadcrumbs,
    cards,
    ctas = [{ label: 'Plan een kennismaking', href: '/contact', variant: 'secondary' }],
    cardsHeading = 'Onderliggende pagina’s',
    cardsDescription = 'Klik door naar een detailpagina voor de definitie, kosten, stappen en veelgestelde vragen.',
    afterCards,
    dataTopic,
  } = props;

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
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Overzicht
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{title}</h1>
          {intro ? (
            <p className="mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">{intro}</p>
          ) : null}
          {ctas.length ? (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {ctas.slice(0, 2).map((cta) => {
                const isPrimary = (cta.variant ?? 'primary') === 'primary';
                const external = cta.href.startsWith('http');
                const baseClass = isPrimary
                  ? 'primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
                  : 'w-full sm:w-auto text-center rounded-lg border border-white/40 px-6 py-3 text-white font-semibold hover:bg-white/10 transition-all duration-300';

                return external ? (
                  <a
                    key={cta.href}
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={baseClass}
                  >
                    {cta.label}
                  </a>
                ) : (
                  <Link key={cta.href} href={cta.href} className={baseClass}>
                    {cta.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {definition ? (
        <section className="py-12 md:py-16 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">
                Wat is {title}?
              </h2>
              <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">{definition}</p>
              {scope ? (
                <>
                  <h2 className="mt-10 text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">
                    Hoe verhoudt {title} zich tot andere domeinen?
                  </h2>
                  <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">{scope}</p>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">{cardsHeading}</h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              {cardsDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.href}
                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg md:text-xl font-semibold text-[#091E42] mb-3">{card.title}</h3>
                {card.description ? <p className="text-gray-600 mb-5">{card.description}</p> : null}
                <Link href={card.href} className="text-sm font-semibold text-[#00875A] underline">
                  Bekijk {card.linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {afterCards ? afterCards : null}
    </main>
  );
}
