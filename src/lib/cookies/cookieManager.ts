import { CookieCategories } from './types';

const isClient = typeof window !== 'undefined';

/**
 * Update Google Consent Mode v2 based on user preferences
 */
function updateGoogleConsent(categories: CookieCategories): void {
  if (!isClient || !window.gtag) {
    return;
  }

  try {
    window.gtag('consent', 'update', {
      'ad_storage': categories.marketing ? 'granted' : 'denied',
      'ad_user_data': categories.marketing ? 'granted' : 'denied',
      'ad_personalization': categories.marketing ? 'granted' : 'denied',
      'analytics_storage': categories.analytical ? 'granted' : 'denied',
    });

    console.log('[Cookie Consent] Google Consent Mode updated:', {
      ad_storage: categories.marketing ? 'granted' : 'denied',
      analytics_storage: categories.analytical ? 'granted' : 'denied',
    });
  } catch (error) {
    console.error('[Cookie Consent] Error updating Google consent:', error);
  }
}

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

      // Update Google Consent Mode v2
      updateGoogleConsent(categories);

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

      // Reset Google Consent Mode to denied
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied',
        });
      }
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
  },
};
