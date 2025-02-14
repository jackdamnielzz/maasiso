import { CookieConsent } from './types';

const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_VERSION = '1.0';

const defaultConsent: CookieConsent = {
  functional: true, // Always true
  analytical: false,
  marketing: false,
  thirdParty: false,
  timestamp: '',
  version: CONSENT_VERSION,
};

const isClient = typeof window !== 'undefined';

export const cookieStorage = {
  getConsent(): CookieConsent {
    if (!isClient) {
      return defaultConsent;
    }

    try {
      const storedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
      if (!storedConsent) {
        return defaultConsent;
      }

      const parsedConsent = JSON.parse(storedConsent) as CookieConsent;

      // Check if stored consent is from an older version
      if (parsedConsent.version !== CONSENT_VERSION) {
        return defaultConsent;
      }

      return {
        ...parsedConsent,
        functional: true, // Always ensure functional cookies are enabled
      };
    } catch (error) {
      console.error('Error reading cookie consent:', error);
      return defaultConsent;
    }
  },

  setConsent(consent: CookieConsent): void {
    if (!isClient) {
      return;
    }

    try {
      const consentToStore = {
        ...consent,
        functional: true, // Always ensure functional cookies are enabled
        version: CONSENT_VERSION,
      };
      localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consentToStore));
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  },

  isConsentGiven(): boolean {
    if (!isClient) {
      return false;
    }

    try {
      const storedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
      return !!storedConsent;
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      return false;
    }
  },

  clearConsent(): void {
    if (!isClient) {
      return;
    }

    try {
      localStorage.removeItem(CONSENT_COOKIE_NAME);
    } catch (error) {
      console.error('Error clearing cookie consent:', error);
    }
  },
};