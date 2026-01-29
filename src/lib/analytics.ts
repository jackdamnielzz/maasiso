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

// Web Vitals types
export type WebVitalName = 'CLS' | 'FID' | 'LCP' | 'TTFB' | 'FCP';

let isInitialized = false;

/**
 * Send event to Google Analytics via GTM
 * Uses gtag which respects Google Consent Mode v2
 */
const sendToGA = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...params,
    });
  } catch (error) {
    console.error('[Analytics] Error sending event:', error);
  }
};

// Initialize analytics and Google Analytics
export const initGA = () => {
  if (isInitialized) return;
  
  // Initialize monitoring service
  monitoringService.cleanup(); // Clear old metrics
  
  isInitialized = true;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Initialized');
  }
};

// Track page views and user behavior
export const usePageTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isInitialized) return;

    // Track page view
    const params = searchParams?.toString();
    const url = params ? `${pathname}?${params}` : pathname;
    
    // Send page_view to Google Analytics
    sendToGA('page_view', {
      page_path: pathname,
      page_location: typeof window !== 'undefined' ? window.location.href : url,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view:', url);
    }
  }, [pathname, searchParams]);
};

// Track web vitals metrics
export const trackWebVital = (metric: Metric) => {
  if (!isInitialized) {
    return;
  }

  const { name, value, rating, id } = metric;
  
  // Send to internal monitoring
  monitoringService.updateWebVital({
    id: `${name}-${Date.now()}`,
    name,
    value,
    rating,
    timestamp: Date.now()
  });

  // Send to Google Analytics (as recommended by Google)
  sendToGA(name.toLowerCase(), {
    value: Math.round(name === 'CLS' ? value * 1000 : value), // CLS needs multiplication
    metric_id: id,
    metric_value: value,
    metric_rating: rating,
    non_interaction: true, // Don't affect bounce rate
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Web Vital: ${name}`, {
      value: Math.round(value * 100) / 100,
      rating
    });
  }
};

// Track custom events and interactions
export const trackEvent = (event: AnalyticsEvent) => {
  if (!isInitialized) {
    return;
  }

  // Send to Google Analytics
  sendToGA(event.name, event.params);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Event:', event);
  }
};

/**
 * Track file downloads (for blog post documents)
 */
export const trackDownload = (fileName: string, fileType: string, blogPostTitle?: string) => {
  trackEvent({
    name: 'file_download',
    params: {
      file_name: fileName,
      file_extension: fileType,
      link_text: blogPostTitle || fileName,
      content_type: 'document',
    }
  });
};

/**
 * Track outbound link clicks
 */
export const trackOutboundLink = (url: string, linkText?: string) => {
  trackEvent({
    name: 'click',
    params: {
      link_url: url,
      link_text: linkText || url,
      outbound: true,
    }
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent({
    name: 'form_submit',
    params: {
      form_name: formName,
      success,
    }
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (percentage: number, pagePath: string) => {
  trackEvent({
    name: 'scroll',
    params: {
      percent_scrolled: percentage,
      page_path: pagePath,
    }
  });
};

/**
 * Track search queries
 */
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent({
    name: 'search',
    params: {
      search_term: searchTerm,
      results_count: resultsCount,
    }
  });
};

/**
 * Track content engagement (time on page, interactions)
 */
export const trackEngagement = (pagePath: string, timeOnPage: number, scrollDepth: number) => {
  trackEvent({
    name: 'user_engagement',
    params: {
      page_path: pagePath,
      engagement_time_msec: timeOnPage,
      scroll_depth: scrollDepth,
    }
  });
};

// Export monitoring service methods for direct access
export const getPerformanceMetrics = () => {
  return {
    webVitals: monitoringService.getMetrics(),
    apiPerformance: {
      averageResponseTime: 0,
      errorRate: 0
    }
  };
};
