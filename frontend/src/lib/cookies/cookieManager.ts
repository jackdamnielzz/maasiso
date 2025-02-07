import { CookieCategories } from './types';

const isClient = typeof window !== 'undefined';

export const cookieManager = {
  applyConsent(categories: CookieCategories): void {
    if (!isClient) {
      return;
    }

    try {
      // Functional cookies are always enabled
      if (categories.functional) {
        // Set functional cookies
      }

      // Analytics cookies (e.g., Google Analytics)
      if (categories.analytical) {
        // Enable analytics
        window.localStorage.setItem('analytics_enabled', 'true');
      } else {
        // Disable analytics
        window.localStorage.removeItem('analytics_enabled');
      }

      // Marketing cookies
      if (categories.marketing) {
        // Enable marketing cookies
        window.localStorage.setItem('marketing_enabled', 'true');
      } else {
        // Disable marketing cookies
        window.localStorage.removeItem('marketing_enabled');
      }

      // Third-party cookies
      if (categories.thirdParty) {
        // Enable third-party cookies
        window.localStorage.setItem('third_party_enabled', 'true');
      } else {
        // Disable third-party cookies
        window.localStorage.removeItem('third_party_enabled');
      }

      // Log the applied preferences
      console.log('[Cookie Consent Log]', {
        functional: categories.functional,
        analytical: categories.analytical,
        marketing: categories.marketing,
        thirdParty: categories.thirdParty,
      });
    } catch (error) {
      console.error('Error applying cookie consent:', error);
    }
  },

  clearAllCookies(): void {
    if (!isClient) {
      return;
    }

    try {
      // Clear all non-functional cookies
      window.localStorage.removeItem('analytics_enabled');
      window.localStorage.removeItem('marketing_enabled');
      window.localStorage.removeItem('third_party_enabled');
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
  },
};