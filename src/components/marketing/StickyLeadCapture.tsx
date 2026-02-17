'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import {
  getIso9001CalendlyConfig,
  openIso9001Calendly,
  preloadIso9001Calendly,
} from '@/lib/calendly/iso9001Calendly';

type ExitIntentFormStatus = 'idle' | 'success' | 'error';

const PAGE_PATH = '/iso-certificering/iso-9001/';
const PHONE_LINK = 'tel:+31623578344';
const EXIT_INTENT_STORAGE_KEY = 'iso9001_exit_intent_last_shown_at';
const EXIT_INTENT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const HERO_SELECTOR = '.hero-section';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isExitIntentRateLimited(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const rawTimestamp = window.localStorage.getItem(EXIT_INTENT_STORAGE_KEY);
    if (!rawTimestamp) {
      return false;
    }

    const timestamp = Number(rawTimestamp);
    if (!Number.isFinite(timestamp)) {
      return false;
    }

    return Date.now() - timestamp < EXIT_INTENT_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markExitIntentShown(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(EXIT_INTENT_STORAGE_KEY, String(Date.now()));
  } catch {
    // noop
  }
}

export default function StickyLeadCapture() {
  const pathname = usePathname();
  const isIso9001Page = pathname === '/iso-certificering/iso-9001' || pathname === PAGE_PATH;
  const calendlyConfig = getIso9001CalendlyConfig();

  const [isDesktop, setIsDesktop] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [cookieBannerOffset, setCookieBannerOffset] = useState(0);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<ExitIntentFormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  const exitModalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const hasTriggeredExitIntentRef = useRef(false);
  const successCloseTimeoutRef = useRef<number | null>(null);

  const openStickyCalendly = useCallback(() => {
    void openIso9001Calendly('sticky_bar').then((result) => {
      if (!result.opened && result.fallbackUrl && typeof window !== 'undefined') {
        window.location.href = result.fallbackUrl;
      }
    });
  }, []);

  const handleStickyCallClick = useCallback(() => {
    trackEvent({
      name: 'click_call_iso9001',
      params: {
        location: 'sticky',
      },
    });
  }, []);

  const openExitIntentModal = useCallback(() => {
    if (!isDesktop || hasTriggeredExitIntentRef.current || isExitIntentRateLimited()) {
      return;
    }

    hasTriggeredExitIntentRef.current = true;
    markExitIntentShown();
    setIsExitModalOpen(true);
    setFormStatus('idle');
    setErrorMessage('');
    setEmail('');
    setCompanyName('');
  }, [isDesktop]);

  const closeExitIntentModal = useCallback(() => {
    setIsExitModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isIso9001Page) {
      return;
    }

    const preloadOnInteraction = () => {
      preloadIso9001Calendly();
    };

    document.addEventListener('pointerdown', preloadOnInteraction, {
      once: true,
      passive: true,
    });
    document.addEventListener('keydown', preloadOnInteraction, { once: true });

    return () => {
      document.removeEventListener('pointerdown', preloadOnInteraction);
      document.removeEventListener('keydown', preloadOnInteraction);
    };
  }, [isIso9001Page]);

  useEffect(() => {
    if (!isIso9001Page || typeof window === 'undefined') {
      return;
    }

    const updateViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, [isIso9001Page]);

  useEffect(() => {
    if (!isIso9001Page || typeof window === 'undefined') {
      return;
    }

    const updateCookieOffset = () => {
      const cookieBanner = document.getElementById('cookie-banner');
      if (!cookieBanner) {
        setCookieBannerOffset(0);
        return;
      }

      const rect = cookieBanner.getBoundingClientRect();
      const style = window.getComputedStyle(cookieBanner);
      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.height > 0 &&
        rect.bottom > 0;

      setCookieBannerOffset(isVisible ? rect.height : 0);
    };

    updateCookieOffset();
    window.addEventListener('resize', updateCookieOffset);
    const mutationObserver = new MutationObserver(updateCookieOffset);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      window.removeEventListener('resize', updateCookieOffset);
      mutationObserver.disconnect();
    };
  }, [isIso9001Page]);

  useEffect(() => {
    if (!isIso9001Page || typeof window === 'undefined') {
      return;
    }

    const heroElement = document.querySelector(HERO_SELECTOR);
    if (!heroElement) {
      setIsStickyVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const hasPassedHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        setIsStickyVisible(hasPassedHero);
      },
      { threshold: 0 }
    );

    observer.observe(heroElement);

    return () => {
      observer.disconnect();
    };
  }, [isIso9001Page]);

  useEffect(() => {
    if (!isIso9001Page || !isDesktop) {
      return;
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 12 || !isStickyVisible || isExitModalOpen) {
        return;
      }

      openExitIntentModal();
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDesktop, isExitModalOpen, isIso9001Page, isStickyVisible, openExitIntentModal]);

  useEffect(() => {
    if (!isExitModalOpen) {
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeExitIntentModal();
        return;
      }

      if (event.key !== 'Tab' || !exitModalRef.current) {
        return;
      }

      const focusable = Array.from(
        exitModalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElementRef.current?.focus();
    };
  }, [closeExitIntentModal, isExitModalOpen]);

  useEffect(() => {
    return () => {
      if (successCloseTimeoutRef.current) {
        window.clearTimeout(successCloseTimeoutRef.current);
      }
    };
  }, []);

  const handleExitIntentSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setFormStatus('idle');
      setErrorMessage('');

      try {
        const response = await fetch('/api/lead-submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            company_name: companyName.trim() || undefined,
            source: 'iso9001-exit-intent',
            page: PAGE_PATH,
            timestamp: new Date().toISOString(),
          }),
        });

        const body = await response.json();
        if (!response.ok) {
          throw new Error(body?.error || 'Verzenden mislukt. Probeer het opnieuw.');
        }

        setFormStatus('success');
        trackEvent({
          name: 'quickscan_submit_iso9001',
          params: {
            source: 'iso9001-exit-intent',
          },
        });

        if (successCloseTimeoutRef.current) {
          window.clearTimeout(successCloseTimeoutRef.current);
        }

        successCloseTimeoutRef.current = window.setTimeout(() => {
          setIsExitModalOpen(false);
          successCloseTimeoutRef.current = null;
        }, 2200);
      } catch (error) {
        setFormStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Verzenden mislukt. Probeer het opnieuw.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyName, email]
  );

  if (!isIso9001Page) {
    return null;
  }

  return (
    <>
      {isStickyVisible ? (
        <div
          className="fixed inset-x-0 z-[45] px-3 pb-3 sm:px-4"
          style={{ bottom: `calc(${cookieBannerOffset}px + env(safe-area-inset-bottom))` }}
          aria-label="Sticky ISO 9001 call-to-action"
        >
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_12px_34px_rgba(9,30,66,0.17)] backdrop-blur-sm sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-semibold text-[#091E42] md:pr-4">
                Snel schakelen over ISO 9001?
              </p>
              <div className="grid grid-cols-2 gap-2 md:min-w-[440px]">
                {calendlyConfig.hasCalendlyUrl ? (
                  <button
                    type="button"
                    onClick={openStickyCalendly}
                    className="primary-button h-11 w-full bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center text-sm shadow-[0_10px_22px_rgba(255,139,0,0.31)] hover:from-[#FF9B20] hover:to-[#FF7A00]"
                  >
                    Plan 15 min gesprek
                  </button>
                ) : (
                  <a
                    href={calendlyConfig.fallbackUrl}
                    className="primary-button inline-flex h-11 w-full items-center justify-center bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] text-center text-sm shadow-[0_10px_22px_rgba(255,139,0,0.31)] hover:from-[#FF9B20] hover:to-[#FF7A00]"
                  >
                    Plan 15 min gesprek
                  </a>
                )}
                <a
                  href={PHONE_LINK}
                  onClick={handleStickyCallClick}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[#091E42]/40 bg-white px-4 py-3 text-sm font-semibold text-[#091E42] transition hover:bg-slate-50"
                >
                  Bel direct
                </a>
              </div>
            </div>
            {!calendlyConfig.hasCalendlyUrl ? (
              <p className="mt-2 text-xs text-slate-600">{calendlyConfig.fallbackHint}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isExitModalOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8"
          role="presentation"
          onClick={closeExitIntentModal}
        >
          <div
            ref={exitModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="iso9001-exit-intent-title"
            aria-describedby="iso9001-exit-intent-description"
            className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00875A] via-[#14a271] to-[#FF8B00]"></div>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="iso9001-exit-intent-title" className="text-xl font-bold text-[#091E42] sm:text-2xl">
                  Gratis ISO 9001 quickscan (PDF) binnen 24 uur
                </h2>
                <p id="iso9001-exit-intent-description" className="mt-2 text-sm text-slate-700">
                  Laat je e-mailadres achter, dan ontvang je een praktische quickscan voor jouw situatie.
                </p>
              </div>
              <button
                type="button"
                onClick={closeExitIntentModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            {formStatus === 'success' ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Bedankt. We sturen je quickscan binnen 24 uur.
              </p>
            ) : (
              <form onSubmit={handleExitIntentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="iso9001-exit-email" className="mb-1 block text-sm font-semibold text-[#091E42]">
                    E-mail *
                  </label>
                  <input
                    ref={firstInputRef}
                    id="iso9001-exit-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="email"
                    className="w-full rounded-lg border border-[#d8e2f0] bg-white px-3 py-2 text-[#091E42] transition focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                  />
                </div>
                <div>
                  <label htmlFor="iso9001-exit-company" className="mb-1 block text-sm font-semibold text-[#091E42]">
                    Bedrijfsnaam (optioneel)
                  </label>
                  <input
                    id="iso9001-exit-company"
                    name="company"
                    type="text"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="organization"
                    className="w-full rounded-lg border border-[#d8e2f0] bg-white px-3 py-2 text-[#091E42] transition focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,139,0,0.32)] transition hover:from-[#FF9B20] hover:to-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Bezig met verzenden...' : 'Stuur mijn quickscan'}
                </button>
                {formStatus === 'error' ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
