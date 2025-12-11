'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Metric } from 'web-vitals';
import { monitoringService } from './monitoring/service';

// Analytics Event Types (Using GA4 recommended event names)
export type AnalyticsEvent = {
  name: string;
  params?: Record<string, string | number | boolean>;
};

// GTM Configuration
const GTM_CONTAINER_ID = 'GTM-556J8S8K';
const GA_TRACKING_ID = 'G-QHY9D9XR7G';

// Enhanced Analytics with GTM + GA4 Enhanced Measurement support
// GTM Container: GTM-556J8S8K
// GA4 Property: G-QHY9D9XR7G

declare global {
  interface Window {
    dataLayer: any[];
    pushToDataLayer: (event: string, data: any) => void;
    trackPageView: (pagePath: string, pageTitle?: string) => void;
    trackEvent: (eventName: string, parameters: any) => void;
  }
}

// Helper function to ensure dataLayer exists and push events
const pushToGTM = (eventData: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
    console.log('[GTM Analytics] Event pushed:', eventData);
  }
};

// Core pageview tracking via GTM
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined') {
    console.log('[Analytics] Tracking pageview:', url);
    
    pushToGTM({
      event: 'page_view',
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
      page_referrer: document.referrer || 'direct'
    });
  }
};

// Enhanced event tracking through GTM
export const trackEvent = (event: { name: string; params?: Record<string, any> }) => {
  if (typeof window !== 'undefined') {
    pushToGTM({
      event: event.name,
      ...event.params
    });
    console.log('[Analytics] Custom event tracked:', event.name, event.params);
  }
};

// File download tracking
export const trackFileDownload = (fileName: string, fileType: string, fileSize?: number) => {
  pushToGTM({
    event: 'file_download',
    file_name: fileName,
    file_extension: fileType,
    file_size: fileSize,
    event_category: 'engagement'
  });
  console.log('[Analytics] File download tracked:', fileName);
};

// External link tracking
export const trackExternalLinkClick = (url: string, linkText?: string) => {
  pushToGTM({
    event: 'click',
    link_url: url,
    link_text: linkText,
    link_domain: new URL(url).hostname,
    outbound: true,
    event_category: 'engagement'
  });
  console.log('[Analytics] External link tracked:', url);
};

// Search tracking
export const trackSiteSearch = (searchTerm: string, resultCount?: number, category?: string) => {
  pushToGTM({
    event: 'search',
    search_term: searchTerm,
    search_result_count: resultCount,
    search_category: category,
    event_category: 'search'
  });
  console.log('[Analytics] Search tracked:', searchTerm);
};

// E-commerce events
export const trackEcommerce = {
  // View item (service page view)
  viewItem: (itemId: string, itemName: string, category: string, value?: number) => {
    pushToGTM({
      event: 'view_item',
      currency: 'EUR',
      value: value || 0,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        quantity: 1
      }]
    });
  },

  // Begin checkout (contact form start)
  beginCheckout: (value: number, items: any[]) => {
    pushToGTM({
      event: 'begin_checkout',
      currency: 'EUR',
      value: value,
      items: items
    });
  },

  // Purchase (conversion)
  purchase: (transactionId: string, value: number, items: any[]) => {
    pushToGTM({
      event: 'purchase',
      transaction_id: transactionId,
      currency: 'EUR',
      value: value,
      items: items
    });
  }
};

// Web Vitals tracking for Core Web Vitals via GTM
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
  delta?: number;
}) => {
  pushToGTM({
    event: 'web_vitals',
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_delta: metric.delta,
    event_category: 'web_vitals'
  });
  console.log('[Analytics] Web Vital tracked:', metric.name, metric.value);
};

// Business Events - SINGLE DECLARATION - Updated for GTM
export const trackBusinessEvent = {
  // Contact form tracking
  contactForm: (action: 'submit' | 'error', subject?: string) => {
    pushToGTM({
      event: `contact_form_${action}`,
      form_subject: subject,
      event_category: 'contact'
    });
    console.log('[Analytics] Contact form event tracked:', action, subject);
  },

  // Service page tracking
  servicePage: (service: string, action: 'view' | 'interest') => {
    pushToGTM({
      event: `service_${action}`,
      service_type: service,
      event_category: 'services'
    });
    console.log('[Analytics] Service event tracked:', service, action);
  },

  // Blog post tracking
  blogPost: (action: 'view' | 'read_complete' | 'share', slug?: string) => {
    pushToGTM({
      event: `blog_${action}`,
      blog_slug: slug,
      event_category: 'content'
    });
    console.log('[Analytics] Blog event tracked:', action, slug);
  },

  // Search tracking
  search: (query: string, source: 'blog' | 'site' | 'general', resultCount?: number) => {
    pushToGTM({
      event: 'search',
      search_term: query,
      search_source: source,
      result_count: resultCount,
      event_category: 'search'
    });
    console.log('[Analytics] Search event tracked:', query, source);
  }
};

// User engagement tracking via GTM
export const trackUserEngagement = {
  // Track time spent on important sections
  timeOnSection: (sectionName: string, timeSeconds: number) => {
    pushToGTM({
      event: 'timing_complete',
      timing_category: 'user_timing',
      timing_var: sectionName,
      timing_value: Math.round(timeSeconds * 1000), // Convert to milliseconds
      event_category: 'user_timing'
    });
    console.log('[Analytics] Time on section tracked:', sectionName, timeSeconds + 's');
  },

  // Track form field interactions
  formInteraction: (formName: string, fieldName: string, action: 'focus' | 'blur' | 'change') => {
    pushToGTM({
      event: 'form_interaction',
      form_name: formName,
      field_name: fieldName,
      interaction_type: action,
      event_category: 'form_engagement'
    });
    console.log('[Analytics] Form interaction tracked:', formName, fieldName, action);
  },

  // Track button clicks
  buttonClick: (buttonText: string, buttonLocation: string, action: string = 'click') => {
    pushToGTM({
      event: 'button_click',
      button_text: buttonText,
      button_location: buttonLocation,
      click_action: action,
      event_category: 'ui_interaction'
    });
    console.log('[Analytics] Button click tracked:', buttonText, buttonLocation);
  }
};

// Conversion tracking
export const trackConversion = (conversionName: string, value?: number, currency: string = 'EUR') => {
  pushToGTM({
    event: 'conversion',
    conversion_name: conversionName,
    conversion_value: value,
    currency: currency,
    event_category: 'conversion'
  });
  console.log('[Analytics] Conversion tracked:', conversionName, value);
};

// Google Ads specific tracking functions
export const trackGoogleAds = {
  // Track conversion for Google Ads campaign AW-640419421
  conversion: (conversionLabel?: string, value?: number, currency: string = 'EUR') => {
    if (typeof window !== 'undefined' && window.gtag) {
      const eventData: any = {
        send_to: 'AW-640419421',
        currency: currency
      };
      
      if (value !== undefined) {
        eventData.value = value;
      }
      
      if (conversionLabel) {
        eventData.send_to = `AW-640419421/${conversionLabel}`;
      }
      
      window.gtag('event', 'conversion', eventData);
      console.log('[Google Ads] Conversion tracked:', eventData);
      
      // Also track via GTM for unified reporting
      pushToGTM({
        event: 'google_ads_conversion',
        ads_conversion_id: 'AW-640419421',
        ads_conversion_label: conversionLabel,
        conversion_value: value,
        currency: currency,
        event_category: 'google_ads'
      });
    }
  },

  // Specific conversion types with predefined labels
  conversions: {
    // Page view conversion - main conversion goal
    pageView: (value: number = 1.0) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-640419421/HvHSCK3yqMgaEN2MsLgEC',
          'value': value,
          'currency': 'EUR'
        });
        console.log('[Google Ads] Page view conversion tracked:', value);
        
        // Also track via GTM
        pushToGTM({
          event: 'google_ads_page_conversion',
          ads_conversion_id: 'AW-640419421',
          ads_conversion_label: 'HvHSCK3yqMgaEN2MsLgEC',
          conversion_value: value,
          currency: 'EUR',
          event_category: 'google_ads'
        });
      }
    },

    // Contact form conversion
    contactForm: (value?: number) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-640419421/HvHSCK3yqMgaEN2MsLgEC',
          'value': value || 1.0,
          'currency': 'EUR'
        });
        console.log('[Google Ads] Contact form conversion tracked:', value || 1.0);
        
        // Also track via GTM
        pushToGTM({
          event: 'google_ads_contact_conversion',
          ads_conversion_id: 'AW-640419421',
          ads_conversion_label: 'HvHSCK3yqMgaEN2MsLgEC',
          conversion_value: value || 1.0,
          currency: 'EUR',
          event_category: 'google_ads'
        });
      }
    },

    // Service page engagement conversion
    serviceEngagement: (serviceName: string, value: number = 1.0) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-640419421/HvHSCK3yqMgaEN2MsLgEC',
          'value': value,
          'currency': 'EUR'
        });
        console.log('[Google Ads] Service engagement conversion tracked:', serviceName, value);
        
        // Also track via GTM
        pushToGTM({
          event: 'google_ads_service_conversion',
          ads_conversion_id: 'AW-640419421',
          ads_conversion_label: 'HvHSCK3yqMgaEN2MsLgEC',
          service_name: serviceName,
          conversion_value: value,
          currency: 'EUR',
          event_category: 'google_ads'
        });
      }
    }
  },

  // Track page view for Google Ads
  pageView: (pagePath?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        send_to: 'AW-640419421',
        page_location: window.location.href,
        page_path: pagePath || window.location.pathname
      });
      console.log('[Google Ads] Page view tracked for AW-640419421');
    }
  },

  // Track custom events for Google Ads
  customEvent: (eventName: string, parameters: any = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        send_to: 'AW-640419421',
        ...parameters
      });
      console.log('[Google Ads] Custom event tracked:', eventName, parameters);
    }
  }
};

// Enhanced scroll tracking
export const trackScrollDepth = (percentage: number, page: string) => {
  // Only track meaningful milestones
  if ([25, 50, 75, 90].includes(percentage)) {
    pushToGTM({
      event: 'scroll',
      scroll_depth: percentage,
      page_path: page,
      event_category: 'engagement'
    });
    console.log('[Analytics] Scroll depth tracked:', percentage + '%', page);
  }
};

// Debug function to check GTM status
export const debugGoogleAnalytics = () => {
  if (typeof window === 'undefined') {
    console.log('[GTM Debug] Running on server side');
    return false;
  }

  console.log('[GTM Debug] === Google Tag Manager Status ===');
  console.log('[GTM Debug] dataLayer exists:', !!window.dataLayer);
  console.log('[GTM Debug] dataLayer length:', window.dataLayer?.length || 0);
  console.log('[GTM Debug] Helper functions available:', {
    pushToDataLayer: typeof window.pushToDataLayer === 'function',
    trackPageView: typeof window.trackPageView === 'function',
    trackEvent: typeof window.trackEvent === 'function'
  });
  
  // Check Google Ads gtag availability
  console.log('[Google Ads Debug] === Google Ads gtag Status ===');
  console.log('[Google Ads Debug] gtag function exists:', typeof window.gtag === 'function');
  console.log('[Google Ads Debug] Google Ads ID: AW-640419421');
  
  if (window.dataLayer) {
    console.log('[GTM Debug] dataLayer contents:', window.dataLayer);
  }
  
  // Test event via GTM
  try {
    pushToGTM({
      event: 'debug_test',
      debug_timestamp: new Date().toISOString(),
      event_category: 'debug'
    });
    console.log('[GTM Debug] ✅ Test event sent successfully via GTM');
    
    // Test Google Ads event if gtag is available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'debug_test', {
        send_to: 'AW-640419421',
        debug_timestamp: new Date().toISOString(),
        event_category: 'debug'
      });
      console.log('[Google Ads Debug] ✅ Test event sent successfully via gtag');
    }
    
    return true;
  } catch (error) {
    console.error('[GTM Debug] ❌ Error sending test event:', error);
    return false;
  }
};
