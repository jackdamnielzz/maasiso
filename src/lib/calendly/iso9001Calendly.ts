import { trackEvent } from '@/lib/analytics';

type CalendlySource = 'hero' | 'cost_section' | 'sticky_bar';

type CalendlyOpenResult = {
  opened: boolean;
  fallbackUrl?: string;
};

const CALENDLY_SCRIPT_ID = 'calendly-widget-script';
const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_STYLE_ID = 'calendly-widget-style';
const CALENDLY_STYLE_HREF = 'https://assets.calendly.com/assets/external/widget.css';
const CALENDLY_BOOKING_REDIRECT_PATH = '/bedankt?source=calendly&norm=iso9001';

const ISO9001_CALENDLY_FALLBACK_URL = '/contact?source=iso9001-calendly-fallback';
const ISO9001_CALENDLY_FALLBACK_HINT = '(of laat je gegevens achter, dan plannen we samen)';

let calendlyScriptPromise: Promise<void> | null = null;
let calendlyMessageListenerAttached = false;
let calendlyEscapeListenerAttached = false;
let calendlyPopupOpen = false;

function appendIso9001UtmParams(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', 'maasiso');
    parsed.searchParams.set('utm_medium', 'iso9001-page');
    parsed.searchParams.set('utm_campaign', 'leadgen');
    return parsed.toString();
  } catch {
    return url;
  }
}

function getRawCalendlyUrl(): string {
  return String(process.env.NEXT_PUBLIC_CALENDLY_15MIN_URL || '').trim();
}

function loadCalendlyScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.Calendly?.initPopupWidget) {
    return Promise.resolve();
  }

  if (calendlyScriptPromise) {
    return calendlyScriptPromise;
  }

  calendlyScriptPromise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById(CALENDLY_STYLE_ID)) {
      const stylesheet = document.createElement('link');
      stylesheet.id = CALENDLY_STYLE_ID;
      stylesheet.rel = 'stylesheet';
      stylesheet.href = CALENDLY_STYLE_HREF;
      document.head.appendChild(stylesheet);
    }

    const existingScript = document.getElementById(CALENDLY_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.Calendly?.initPopupWidget) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Calendly script kon niet worden geladen.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = CALENDLY_SCRIPT_ID;
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Calendly script kon niet worden geladen.'));
    document.body.appendChild(script);
  }).catch((error) => {
    calendlyScriptPromise = null;
    throw error;
  });

  return calendlyScriptPromise;
}

function handleCalendlyMessage(event: MessageEvent) {
  if (typeof window === 'undefined') {
    return;
  }

  const data = event.data as { event?: string } | undefined;
  const eventName = typeof data?.event === 'string' ? data.event : '';
  if (!eventName.startsWith('calendly.')) {
    return;
  }

  if (eventName === 'calendly.event_scheduled') {
    calendlyPopupOpen = false;
    trackEvent({
      name: 'calendly_booking_iso9001',
      params: {
        source: 'calendly_popup',
      },
    });
    window.location.assign(CALENDLY_BOOKING_REDIRECT_PATH);
  }
}

function handleCalendlyEscapeKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !calendlyPopupOpen) {
    return;
  }

  if (typeof window === 'undefined' || !window.Calendly?.closePopupWidget) {
    return;
  }

  window.Calendly.closePopupWidget();
  calendlyPopupOpen = false;
}

function attachCalendlyListeners() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!calendlyMessageListenerAttached) {
    window.addEventListener('message', handleCalendlyMessage);
    calendlyMessageListenerAttached = true;
  }

  if (!calendlyEscapeListenerAttached) {
    document.addEventListener('keydown', handleCalendlyEscapeKey);
    calendlyEscapeListenerAttached = true;
  }
}

export function getIso9001CalendlyConfig() {
  const calendlyBaseUrl = getRawCalendlyUrl();
  const hasCalendlyUrl = Boolean(calendlyBaseUrl);

  return {
    hasCalendlyUrl,
    calendlyUrl: hasCalendlyUrl ? appendIso9001UtmParams(calendlyBaseUrl) : '',
    fallbackUrl: ISO9001_CALENDLY_FALLBACK_URL,
    fallbackHint: ISO9001_CALENDLY_FALLBACK_HINT,
  };
}

export function preloadIso9001Calendly(): void {
  const config = getIso9001CalendlyConfig();
  if (!config.hasCalendlyUrl || typeof window === 'undefined') {
    return;
  }

  void loadCalendlyScript()
    .then(() => {
      attachCalendlyListeners();
    })
    .catch((error) => {
      console.error('[Calendly] Preload mislukt:', error);
    });
}

export async function openIso9001Calendly(source: CalendlySource): Promise<CalendlyOpenResult> {
  const config = getIso9001CalendlyConfig();
  if (!config.hasCalendlyUrl || typeof window === 'undefined') {
    return {
      opened: false,
      fallbackUrl: config.fallbackUrl,
    };
  }

  try {
    await loadCalendlyScript();
    attachCalendlyListeners();

    if (!window.Calendly?.initPopupWidget) {
      throw new Error('Calendly popup widget niet beschikbaar.');
    }

    trackEvent({
      name: 'click_calendly_open_iso9001',
      params: {
        source,
      },
    });

    window.Calendly.initPopupWidget({
      url: config.calendlyUrl,
    });

    calendlyPopupOpen = true;
    return { opened: true };
  } catch (error) {
    console.error('[Calendly] Popup openen mislukt:', error);
    return {
      opened: false,
      fallbackUrl: config.fallbackUrl,
    };
  }
}
