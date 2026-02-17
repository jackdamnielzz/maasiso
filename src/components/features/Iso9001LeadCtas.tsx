'use client';

import { trackEvent } from '@/lib/analytics';
import { getIso9001CalendlyConfig, openIso9001Calendly } from '@/lib/calendly/iso9001Calendly';

const PHONE_DISPLAY = '+31 6 23 57 83 44';
const PHONE_LINK = 'tel:+31623578344';

async function openCalendlyOrFallback(source: 'hero' | 'cost_section') {
  const result = await openIso9001Calendly(source);
  if (!result.opened && result.fallbackUrl && typeof window !== 'undefined') {
    window.location.href = result.fallbackUrl;
  }
}

export function Iso9001HeroLeadCta() {
  const calendlyConfig = getIso9001CalendlyConfig();

  const handleCalendlyClick = () => {
    void openCalendlyOrFallback('hero');
  };

  const handleCallClick = () => {
    trackEvent({
      name: 'click_call_iso9001',
      params: {
        location: 'hero',
      },
    });
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/20 bg-[#091E42]/35 px-5 py-5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:px-6">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">
        Plan gratis kennismaking (15 min)
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
        Binnen 30 minuten teruggebeld op werkdagen (09:00-17:00). Buiten kantooruren: volgende werkdag.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {calendlyConfig.hasCalendlyUrl ? (
          <button
            type="button"
            onClick={handleCalendlyClick}
            className="primary-button w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center shadow-[0_10px_24px_rgba(255,139,0,0.34)] hover:from-[#FF9B20] hover:to-[#FF7A00] sm:w-auto sm:min-w-[230px]"
          >
            Plan 15 min gesprek
          </button>
        ) : (
          <a
            href={calendlyConfig.fallbackUrl}
            className="primary-button w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center shadow-[0_10px_24px_rgba(255,139,0,0.34)] hover:from-[#FF9B20] hover:to-[#FF7A00] sm:w-auto sm:min-w-[230px]"
          >
            Plan 15 min gesprek
          </a>
        )}
        <a
          href={PHONE_LINK}
          onClick={handleCallClick}
          className="inline-flex w-full items-center justify-center rounded-lg border border-white/70 bg-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/25 sm:w-auto sm:min-w-[190px]"
        >
          Bel direct
        </a>
      </div>
      {!calendlyConfig.hasCalendlyUrl ? (
        <p className="mt-3 text-xs text-white/80">{calendlyConfig.fallbackHint}</p>
      ) : null}
      <p className="mt-2 text-xs text-white/80">{PHONE_DISPLAY}</p>
    </div>
  );
}

export function Iso9001CostSectionCta() {
  const calendlyConfig = getIso9001CalendlyConfig();

  const handleCalendlyClick = () => {
    trackEvent({
      name: 'lead_cta_click_iso9001_costsection',
      params: {
        action: 'plan_15_min',
      },
    });
    void openCalendlyOrFallback('cost_section');
  };

  const handleCallClick = () => {
    trackEvent({
      name: 'lead_cta_click_iso9001_costsection',
      params: {
        action: 'call_direct',
      },
    });
  };

  return (
    <section className="bg-gradient-to-b from-[#f8fbff] to-white pb-12 md:pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#d8e6f4] bg-white p-6 shadow-[0_16px_38px_rgba(9,30,66,0.08)] md:p-8">
          <h3 className="text-xl font-bold leading-tight text-[#091E42] sm:text-2xl">
            Wil je weten wat ISO 9001 voor jouw organisatie kost en hoe snel je kunt certificeren?
          </h3>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {calendlyConfig.hasCalendlyUrl ? (
              <button
                type="button"
                onClick={handleCalendlyClick}
                className="primary-button w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center shadow-[0_10px_24px_rgba(255,139,0,0.34)] hover:from-[#FF9B20] hover:to-[#FF7A00] sm:w-auto sm:min-w-[230px]"
              >
                Plan 15 min gesprek
              </button>
            ) : (
              <a
                href={calendlyConfig.fallbackUrl}
                onClick={handleCalendlyClick}
                className="primary-button w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center shadow-[0_10px_24px_rgba(255,139,0,0.34)] hover:from-[#FF9B20] hover:to-[#FF7A00] sm:w-auto sm:min-w-[230px]"
              >
                Plan 15 min gesprek
              </a>
            )}
            <a
              href={PHONE_LINK}
              onClick={handleCallClick}
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#091E42]/35 bg-white px-5 py-3 text-sm font-semibold text-[#091E42] transition hover:bg-slate-50 sm:w-auto sm:min-w-[190px]"
            >
              Bel direct
            </a>
          </div>
          {!calendlyConfig.hasCalendlyUrl ? (
            <p className="mt-3 text-xs text-slate-600">{calendlyConfig.fallbackHint}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
