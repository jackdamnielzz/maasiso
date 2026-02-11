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
  visualVariant?: 'default' | 'iso-premium';
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
        <CoreBreadcrumbBar items={props.breadcrumbs} showVisual={false} />
        <div data-topic={props.dataTopic}>{props.children}</div>
      </>
    );
  }

  const {
    visualVariant = 'default',
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
  const isIsoPremium = visualVariant === 'iso-premium';

  const getCardIcon = (cardTitle: string): ReactNode => {
    const lowTitle = cardTitle.toLowerCase();

    if (lowTitle.includes('9001')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4.5h7.5L19 9v10.5H7V4.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M14.5 4.5V9H19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path
            d="m9.5 13.5 1.8 1.8 3.2-3.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (lowTitle.includes('14001')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18.5 5.5C13 5 9 8.3 7.5 13.5m0 0C7 15.3 7 17 7.5 18.5m0-5c2.5.3 4.2 2 4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 21c4.9 0 9-4.1 9-9S16.9 3 12 3 3 7.1 3 12s4.1 9 9 9Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    }

    if (lowTitle.includes('45001')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 5.5 6v5.5c0 4.3 2.8 8.3 6.5 9.5 3.7-1.2 6.5-5.2 6.5-9.5V6L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m9.2 12 1.9 1.9 3.7-3.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (lowTitle.includes('27001')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 10V7.5A5.5 5.5 0 0 1 12 2a5.5 5.5 0 0 1 5.5 5.5V10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="4.5" y="10" width="15" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 14.5v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (lowTitle.includes('bio')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 5.5 6v5.5c0 4.3 2.8 8.3 6.5 9.5 3.7-1.2 6.5-5.2 6.5-9.5V6L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 12h5.6M9.2 15h3.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    if (lowTitle.includes('avg') || lowTitle.includes('gdpr') || lowTitle.includes('privacy') || lowTitle.includes('wetgeving')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4v16m0-16-6 3v4.5c0 3 2.1 5.7 5 6.4m1-14 6 3v4.5c0 3-2.1 5.7-5 6.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8.2 10.5h7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (lowTitle.includes('blog')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 5.5c0-.8.7-1.5 1.5-1.5h9A2.5 2.5 0 0 1 18 6.5V18a2 2 0 0 0-2-2H6.5A1.5 1.5 0 0 1 5 14.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 8.5h6M8 11.5h6M8 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (lowTitle.includes('whitepaper')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4.5h7.5L19 9v10.5H7V4.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M14.5 4.5V9H19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (lowTitle.includes('nieuws') || lowTitle.includes('news')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4.5" y="5" width="15" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9.5h8M8 12.5h8M8 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (lowTitle.includes('16175')) {
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 5.5c0-.8.7-1.5 1.5-1.5h9A2.5 2.5 0 0 1 18 6.5V18a2 2 0 0 0-2-2H6.5A1.5 1.5 0 0 1 5 14.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 8.5h6M8 11.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21c4.9 0 9-4.1 9-9S16.9 3 12 3 3 7.1 3 12s4.1 9 9 9Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="m9.5 12 2 2 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <main
      className={isIsoPremium ? 'flex-1 bg-white' : 'flex-1 bg-gradient-to-b from-blue-50 to-white'}
      data-topic={dataTopic}
    >
      <CoreBreadcrumbBar items={breadcrumbs} showVisual={false} />

      <section
        className={
          isIsoPremium
            ? 'hero-section relative overflow-hidden bg-[#091E42] !py-12 lg:!py-20'
            : 'hero-section relative overflow-hidden bg-[#091E42]'
        }
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300" />
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2" />
          {isIsoPremium ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,139,0,0.15),transparent_32%),radial-gradient(circle_at_84%_78%,rgba(0,135,90,0.16),transparent_36%)]" />
          ) : null}
        </div>
        <div
          className={
            isIsoPremium
              ? 'container-custom relative z-10 text-center px-4 sm:px-6 lg:px-8'
              : 'container-custom relative z-10 text-center'
          }
        >
          <span
            className={
              isIsoPremium
                ? 'inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/85'
                : 'inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80'
            }
          >
            Overzicht
          </span>
          <h1
            className={
              isIsoPremium
                ? 'mt-5 text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg'
                : 'mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg'
            }
          >
            {title}
          </h1>
          {intro ? (
            <p
              className={
                isIsoPremium
                  ? 'mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-[40rem] mx-auto'
                  : 'mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto'
              }
            >
              {intro}
            </p>
          ) : null}
          {ctas.length ? (
            <div
              className={
                isIsoPremium
                  ? 'mt-8 mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:justify-center'
                  : 'mt-8 flex flex-col sm:flex-row items-center justify-center gap-4'
              }
            >
              {ctas.slice(0, 2).map((cta) => {
                const isPrimary = (cta.variant ?? 'primary') === 'primary';
                const external = cta.href.startsWith('http');
                const baseClass = isPrimary
                  ? isIsoPremium
                    ? 'primary-button w-full sm:w-auto sm:min-w-[220px] text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
                    : 'primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
                  : isIsoPremium
                    ? 'primary-button w-full sm:w-auto sm:min-w-[220px] text-center border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#091E42] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
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
        <section className={isIsoPremium ? '!py-12 lg:!py-20 bg-white' : 'py-12 md:py-16 bg-white'}>
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            {isIsoPremium ? (
              <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42]">Wat is {title}?</h2>
                    <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">{definition}</p>
                  </article>
                  {scope ? (
                    <article className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 md:p-8 shadow-sm">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42]">
                        Hoe verhoudt {title} zich tot andere domeinen?
                      </h2>
                      <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">{scope}</p>
                    </article>
                  ) : null}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </section>
      ) : null}

      <section className={isIsoPremium ? '!py-12 lg:!py-20 bg-[#f8f9fa]' : 'py-12 md:py-20 bg-white'}>
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">{cardsHeading}</h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">{cardsDescription}</p>
          </div>
          <div
            className={
              isIsoPremium
                ? 'mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'
                : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            }
          >
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={
                  isIsoPremium
                    ? 'group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl'
                    : 'rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-6 shadow-sm hover:shadow-md transition-all duration-300'
                }
              >
                {isIsoPremium ? (
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF4E6] text-[#FF8B00]">
                    {getCardIcon(card.title)}
                  </div>
                ) : null}
                <h3 className="text-lg md:text-xl font-semibold text-[#091E42] mb-3">{card.title}</h3>
                {card.description ? <p className="text-gray-600 mb-5">{card.description}</p> : null}
                <span
                  className={
                    isIsoPremium
                      ? 'mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#00875A] group-hover:text-[#0057B8] transition-colors duration-300'
                      : 'text-sm font-semibold text-[#00875A] underline'
                  }
                >
                  Bekijk {card.linkLabel}
                  {isIsoPremium ? (
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {afterCards ? afterCards : null}
    </main>
  );
}
