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

// Initialize analytics and Google Analytics
export const initGA = () => {
  if (isInitialized) return;
  
  // Initialize monitoring service
  monitoringService.cleanup(); // Clear old metrics
  
  // Initialize Google Analytics (if needed)
  if (process.env.NEXT_PUBLIC_GA_ID) {
    // Add GA initialization here if needed
    console.log('GA initialized with ID:', process.env.NEXT_PUBLIC_GA_ID);
  }
  
  isInitialized = true;
  console.log('Analytics initialized');
};

// Track page views and user behavior
export const usePageTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    
    console.log('Page view:', url);
    // Add your analytics tracking code here
  }, [pathname, searchParams]);
};

// Track web vitals metrics
export const trackWebVital = (metric: Metric) => {
  if (!isInitialized) {
    console.warn('Analytics not initialized');
    return;
  }

  const { name, value, rating } = metric;
  monitoringService.updateWebVital(name as WebVitalName, value);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${name}`, {
      value: Math.round(value * 100) / 100,
      rating
    });
  }

  // Send to GA if configured
  if (process.env.NEXT_PUBLIC_GA_ID) {
    // Add GA tracking here if needed
  }
};

// Track custom events and interactions
export const trackEvent = (event: AnalyticsEvent) => {
  if (!isInitialized) {
    console.warn('Analytics not initialized');
    return;
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Event:', event);
  }

  // Send to GA if configured
  if (process.env.NEXT_PUBLIC_GA_ID) {
    // Add GA tracking here if needed
  }
};

// Export monitoring service methods for direct access
export const getPerformanceMetrics = () => {
  return {
    webVitals: monitoringService.getMetrics(),
    apiPerformance: {
      averageResponseTime: monitoringService.getAverageResponseTime(),
      errorRate: monitoringService.getErrorRate()
    }
  };
};
