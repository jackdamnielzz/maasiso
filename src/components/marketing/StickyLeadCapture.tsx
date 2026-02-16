'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

type CompanySize = '' | '1-10' | '10-50' | '50+';

type ExitIntentCloseReason = 'overlay_click' | 'close_button' | 'escape_key';

type ExitFormStatus = 'idle' | 'success' | 'error';

const COSTS_SECTION_ID = 'kosten-sectie';
const PHONE_NUMBER = '+31 (0)6 23 57 83 44';
const PHONE_LINK = 'tel:+31623578344';
const PAGE_PATH = '/iso-certificering/iso-9001/';
const STICKY_PANEL_CLOSED_KEY = 'sticky_panel_closed';
const EXIT_INTENT_SHOWN_KEY = 'exit_intent_shown';
const SIDE_PANEL_CTA = '/contact?source=sticky_panel&utm_medium=sticky_cta&utm_campaign=iso9001_ads_test';
const BOTTOM_BAR_CTA = '/contact?source=sticky_bottom&utm_medium=sticky_cta&utm_campaign=iso9001_ads_test';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const companySizeOptions: Array<{ value: CompanySize; label: string }> = [
  { value: '', label: 'Kies een bereik (optioneel)' },
  { value: '1-10', label: '1-10' },
  { value: '10-50', label: '10-50' },
  { value: '50+', label: '50+' },
];

const emitAnalyticsEvent = (name: string, params?: Record<string, string | number | boolean>) => {
  try {
    trackEvent({
      name,
      params,
    });
  } catch (error) {
    console.error('[StickyLeadCapture] analytics event error:', error);
  }
};

export default function StickyLeadCapture() {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [hasCostSection, setHasCostSection] = useState(true);
  const [hasPassedCostSection, setHasPassedCostSection] = useState(false);
  const [isPanelClosedInSession, setIsPanelClosedInSession] = useState(false);
  const [hasShownSidePanel, setHasShownSidePanel] = useState(false);
  const [hasShownBottomBar, setHasShownBottomBar] = useState(false);
  const [exitFormStatus, setExitFormStatus] = useState<ExitFormStatus>('idle');
  const [isSubmittingExitForm, setIsSubmittingExitForm] = useState(false);
  const [exitErrorMessage, setExitErrorMessage] = useState('');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isExitIntentBlocked, setIsExitIntentBlocked] = useState(false);
  const [hasScrolledPastHalf, setHasScrolledPastHalf] = useState(false);
  const [isExitTriggeredOnce, setIsExitTriggeredOnce] = useState(false);
  const [exitFormData, setExitFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companySize: '' as CompanySize,
  });

  const exitModalRef = useRef<HTMLDivElement>(null);
  const exitFormRef = useRef<HTMLFormElement>(null);
  const firstExitInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const intersectionCleanupRef = useRef<IntersectionObserver | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const exitIntentDelayRef = useRef<number | null>(null);
  const autoCloseTimeoutRef = useRef<number | null>(null);

  const isDesktopPanel = viewportWidth >= 1280;
  const isMobileBottomBar = viewportWidth > 0 && viewportWidth <= 767;
  const isExitIntentDesktop = viewportWidth >= 768;

  const shouldRenderSidePanel =
    isDesktopPanel && hasCostSection && hasPassedCostSection && !isPanelClosedInSession;
  const shouldRenderBottomBar =
    isMobileBottomBar && hasCostSection && hasPassedCostSection;

  const getSessionStorageItem = useCallback((key: string): string | null => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }, []);

  const setSessionStorageItem = useCallback((key: string, value: string) => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // noop
    }
  }, []);

  const getFocusableElements = useCallback(() => {
    if (!exitModalRef.current) return [] as HTMLElement[];
    return Array.from(
      exitModalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((element) => !element.hasAttribute('disabled'));
  }, []);

  const handleResize = useCallback(() => {
    setViewportWidth(window.innerWidth);
  }, []);

  const closeSidePanel = useCallback(() => {
    setIsPanelClosedInSession(true);
    setSessionStorageItem(STICKY_PANEL_CLOSED_KEY, '1');
    emitAnalyticsEvent('sticky_panel_close');
  }, [setSessionStorageItem]);

  const handleSidePanelPhoneClick = useCallback(() => {
    emitAnalyticsEvent('sticky_panel_phone_click', {
      component: 'sticky_panel',
      phone_number: '31302358344',
    });
  }, []);

  const handleSidePanelCtaClick = useCallback(() => {
    emitAnalyticsEvent('sticky_panel_cta_click', {
      component: 'sticky_panel',
      destination: SIDE_PANEL_CTA,
    });
  }, []);

  const handleBottomPlanClick = useCallback(() => {
    emitAnalyticsEvent('sticky_bottom_plan_click', {
      component: 'sticky_bottom_bar',
      destination: BOTTOM_BAR_CTA,
    });
  }, []);

  const handleBottomCallClick = useCallback(() => {
    emitAnalyticsEvent('sticky_bottom_call_click', {
      component: 'sticky_bottom_bar',
      phone_number: '31302358344',
    });
  }, []);

  const openExitIntentModal = useCallback(() => {
    setIsExitModalOpen(true);
    setExitFormStatus('idle');
    setExitErrorMessage('');
    setExitFormData({
      name: '',
      email: '',
      phone: '',
      companySize: '',
    });
    setSessionStorageItem(EXIT_INTENT_SHOWN_KEY, '1');
    setIsExitIntentBlocked(true);
    emitAnalyticsEvent('exit_intent_form_view');
  }, [setSessionStorageItem]);

  const closeExitIntentModal = useCallback(
    (reason: ExitIntentCloseReason) => {
      setIsExitModalOpen(false);
      emitAnalyticsEvent('exit_intent_close', { close_label: reason });
      if (autoCloseTimeoutRef.current) {
        window.clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    },
    []
  );

  const triggerExitIntent = useCallback(() => {
    if (!isExitIntentDesktop || isExitIntentBlocked || isExitModalOpen || isExitTriggeredOnce) {
      return;
    }

    if (!hasScrolledPastHalf || !hasCostSection) {
      return;
    }

    setIsExitTriggeredOnce(true);
    emitAnalyticsEvent('exit_intent_triggered', {
      source: 'exit_intent',
      page: PAGE_PATH,
    });

    if (exitIntentDelayRef.current) {
      window.clearTimeout(exitIntentDelayRef.current);
    }

    exitIntentDelayRef.current = window.setTimeout(() => {
      openExitIntentModal();
      exitIntentDelayRef.current = null;
    }, 300);
  }, [
    hasCostSection,
    hasScrolledPastHalf,
    isExitIntentBlocked,
    isExitIntentDesktop,
    isExitModalOpen,
    isExitTriggeredOnce,
    openExitIntentModal,
  ]);

  const handleMouseLeave = useCallback(
    (event: MouseEvent) => {
      if (event.clientY > 50) {
        return;
      }

      triggerExitIntent();
    },
    [triggerExitIntent]
  );

  const updateScrollProgress = useCallback(() => {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (documentHeight <= 0) {
      setHasScrolledPastHalf(false);
      return;
    }

    const ratio = window.scrollY / documentHeight;
    setHasScrolledPastHalf(ratio > 0.5);
  }, []);

  const initCostSectionObserver = useCallback(() => {
    const costsElement = document.getElementById(COSTS_SECTION_ID);
    if (!costsElement) {
      console.warn('[StickyLeadCapture] #kosten-sectie niet gevonden. Sticky componenten blijven uitgeschakeld.');
      setHasCostSection(false);
      return;
    }

    if (intersectionCleanupRef.current) {
      intersectionCleanupRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        const hasScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setHasPassedCostSection(hasScrolledPast);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(costsElement);
    intersectionCleanupRef.current = observer;
  }, []);

  const updateExitFormField = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setExitFormData((current) => {
        if (name === 'companySize') {
          return { ...current, companySize: value as CompanySize };
        }
        if (name === 'name') {
          return { ...current, name: value };
        }
        if (name === 'email') {
          return { ...current, email: value };
        }
        if (name === 'phone') {
          return { ...current, phone: value };
        }

        return current;
      });
    },
    []
  );

  const handleExitFormSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmittingExitForm(true);
      setExitFormStatus('idle');
      setExitErrorMessage('');

      try {
        const response = await fetch('/api/lead-submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: exitFormData.name.trim(),
            email: exitFormData.email.trim(),
            phone: exitFormData.phone.trim(),
            company_size: exitFormData.companySize || undefined,
            source: 'exit_intent',
            page: PAGE_PATH,
            timestamp: new Date().toISOString(),
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData?.error || 'Er ging iets mis. Probeer het opnieuw of bel ons direct.');
        }

        setExitFormStatus('success');
        emitAnalyticsEvent('exit_intent_form_submit', {
          source: 'exit_intent',
          page: PAGE_PATH,
        });
        emitAnalyticsEvent('generate_lead', {
          source: 'exit_intent',
          value: 5000,
          currency: 'EUR',
        });

        if (autoCloseTimeoutRef.current) {
          window.clearTimeout(autoCloseTimeoutRef.current);
        }

        autoCloseTimeoutRef.current = window.setTimeout(() => {
          closeExitIntentModal('close_button');
          autoCloseTimeoutRef.current = null;
        }, 3000);
      } catch (error) {
        setExitFormStatus('error');
        setExitErrorMessage(
          error instanceof Error
            ? error.message
            : 'Er ging iets mis. Probeer het opnieuw of bel ons direct.'
        );
      } finally {
        setIsSubmittingExitForm(false);
      }
    },
    [closeExitIntentModal, exitFormData]
  );

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    setIsPanelClosedInSession(getSessionStorageItem(STICKY_PANEL_CLOSED_KEY) === '1');
    setIsExitIntentBlocked(getSessionStorageItem(EXIT_INTENT_SHOWN_KEY) === '1');

    const onResize = () => handleResize();
    window.addEventListener('resize', onResize);
    resizeCleanupRef.current = () => {
      window.removeEventListener('resize', onResize);
    };

    initCostSectionObserver();
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
      }
      if (intersectionCleanupRef.current) {
        intersectionCleanupRef.current.disconnect();
      }
      window.removeEventListener('scroll', updateScrollProgress);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (exitIntentDelayRef.current) {
        window.clearTimeout(exitIntentDelayRef.current);
      }
      if (autoCloseTimeoutRef.current) {
        window.clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [
    getSessionStorageItem,
    handleResize,
    handleMouseLeave,
    initCostSectionObserver,
    updateScrollProgress,
  ]);

  useEffect(() => {
    if (!shouldRenderSidePanel) {
      return;
    }

    if (!hasShownSidePanel) {
      setHasShownSidePanel(true);
      emitAnalyticsEvent('sticky_panel_view', {
        source: 'sticky_panel',
        page: PAGE_PATH,
      });
    }
  }, [hasShownSidePanel, shouldRenderSidePanel]);

  useEffect(() => {
    if (!shouldRenderBottomBar) {
      return;
    }

    if (!hasShownBottomBar) {
      setHasShownBottomBar(true);
      emitAnalyticsEvent('sticky_bottom_view', {
        source: 'sticky_bottom',
        page: PAGE_PATH,
      });
    }
  }, [hasShownBottomBar, shouldRenderBottomBar]);

  useEffect(() => {
    if (!isExitModalOpen) {
      return;
    }

    previouslyFocusedElementRef.current =
      (document.activeElement as HTMLElement) || null;

    if (firstExitInputRef.current) {
      firstExitInputRef.current.focus();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeExitIntentModal('escape_key');
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }

      if (exitFormRef.current) {
        exitFormRef.current.reset();
      }
    };
  }, [closeExitIntentModal, getFocusableElements, isExitModalOpen]);

  return (
    <>
      {shouldRenderSidePanel ? (
        <aside
          id="sticky-lead-side-panel"
          className="fixed right-8 top-1/2 z-[100] w-64 -translate-y-1/2 transform overflow-hidden rounded-2xl border border-[#d7e4f2] bg-[linear-gradient(160deg,#ffffff_0%,#f7fbff_58%,#eef8f3_100%)] p-6 shadow-[0_18px_40px_rgba(9,30,66,0.16)] backdrop-blur-sm"
          aria-label="Snelle kennismaking"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00875A] via-[#13a170] to-[#FF8B00]"></div>
          <button
            type="button"
            onClick={closeSidePanel}
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#666] transition hover:bg-white/80 hover:text-[#444]"
            aria-label="Sluit"
          >
            ×
          </button>

          <h2 className="mb-2 mt-2 text-xl font-semibold leading-tight text-[#091E42]">
            Vrijblijvend kennismaken?
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-slate-700">Plan een gesprek of bel:</p>

          <a
            href={PHONE_LINK}
            onClick={handleSidePanelPhoneClick}
            className="mb-4 inline-block text-base font-semibold text-[#0066cc] underline decoration-[#0066cc]/50 underline-offset-4 hover:text-[#0051a3]"
          >
            {PHONE_NUMBER}
          </a>

          <a
            href={SIDE_PANEL_CTA}
            onClick={handleSidePanelCtaClick}
            className="primary-button block w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center shadow-[0_10px_26px_rgba(255,139,0,0.38)] hover:from-[#FF9B20] hover:to-[#FF7A00]"
          >
            Plan gesprek
          </a>
        </aside>
      ) : null}

      {shouldRenderBottomBar ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200/80 bg-white/95 p-4 shadow-[0_-6px_22px_rgba(9,30,66,0.16)] backdrop-blur-sm"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          aria-label="Snelle call-to-action"
        >
          <div className="container-custom">
            <p className="mb-3 text-base font-semibold text-[#091E42]">
              ISO 9001 vanaf €5.000
            </p>

            <div className="grid grid-cols-2 gap-3 max-[359px]:grid-cols-1">
              <a
                href={BOTTOM_BAR_CTA}
                onClick={handleBottomPlanClick}
                className="primary-button w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center shadow-[0_8px_22px_rgba(255,139,0,0.33)] hover:from-[#FF9B20] hover:to-[#FF7A00]"
              >
                Plan gesprek
              </a>
              <a
                href={PHONE_LINK}
                onClick={handleBottomCallClick}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#091E42]/80 bg-white px-4 py-3 text-sm font-semibold text-[#091E42] transition hover:bg-slate-50"
              >
                Bel direct
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {isExitModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => closeExitIntentModal('overlay_click')}
        >
          <div
            ref={exitModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sticky-exit-intent-title"
            aria-describedby="sticky-exit-intent-description"
            className="relative w-[90%] max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00875A] via-[#13a170] to-[#FF8B00]"></div>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="sticky-exit-intent-title" className="text-2xl font-bold text-[#091E42]">
                  Wacht nog even...
                </h2>
                <p id="sticky-exit-intent-description" className="mt-2 text-sm text-slate-700">
                  Wil je weten wat ISO 9001 jouw organisatie kost en hoe lang het duurt?
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeExitIntentModal('close_button')}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#666] transition hover:bg-slate-100 hover:text-[#444]"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            <p className="mb-5 text-sm text-slate-700">
              Laat je gegevens achter voor een vrijblijvend gesprek binnen 1 werkdag.
            </p>

            {exitFormStatus === 'success' ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                ✅ Bedankt! We nemen binnen 1 werkdag contact met je op.
              </p>
            ) : (
              <form
                ref={exitFormRef}
                onSubmit={handleExitFormSubmit}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="sticky-exit-intent-name" className="mb-1 block text-sm font-semibold text-[#091E42]">
                    Naam *
                  </label>
                  <input
                    ref={firstExitInputRef}
                    id="sticky-exit-intent-name"
                    name="name"
                    type="text"
                    required
                    value={exitFormData.name}
                    onChange={updateExitFormField}
                    className="w-full rounded-lg border border-[#d8e2f0] bg-white px-3 py-2 text-[#091E42] transition focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                    disabled={isSubmittingExitForm}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="sticky-exit-intent-email" className="mb-1 block text-sm font-semibold text-[#091E42]">
                    E-mail *
                  </label>
                  <input
                    id="sticky-exit-intent-email"
                    name="email"
                    type="email"
                    required
                    value={exitFormData.email}
                    onChange={updateExitFormField}
                    className="w-full rounded-lg border border-[#d8e2f0] bg-white px-3 py-2 text-[#091E42] transition focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                    disabled={isSubmittingExitForm}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="sticky-exit-intent-phone" className="mb-1 block text-sm font-semibold text-[#091E42]">
                    Telefoon *
                  </label>
                  <input
                    id="sticky-exit-intent-phone"
                    name="phone"
                    type="tel"
                    required
                    value={exitFormData.phone}
                    onChange={updateExitFormField}
                    className="w-full rounded-lg border border-[#d8e2f0] bg-white px-3 py-2 text-[#091E42] transition focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                    disabled={isSubmittingExitForm}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label htmlFor="sticky-exit-intent-company-size" className="mb-1 block text-sm font-semibold text-[#091E42]">
                    Aantal FTE
                  </label>
                  <select
                    id="sticky-exit-intent-company-size"
                    name="companySize"
                    value={exitFormData.companySize}
                    onChange={updateExitFormField}
                    className="w-full rounded-lg border border-[#d8e2f0] bg-white px-3 py-2 text-[#091E42] transition focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                    disabled={isSubmittingExitForm}
                  >
                    {companySizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingExitForm}
                  className="w-full rounded-lg bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,139,0,0.32)] transition hover:from-[#FF9B20] hover:to-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingExitForm ? 'Bezig met verzenden...' : 'Ja, plan gesprek'}
                </button>

                {exitFormStatus === 'error' && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {exitErrorMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
