'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Extend Window interface for GTM functions
declare global {
  interface Window {
    dataLayer: any[];
    pushToDataLayer: (event: string, data: any) => void;
    trackPageView: (pagePath: string, pageTitle?: string) => void;
    trackEvent: (eventName: string, parameters: any) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Debug: Check if GTM is loaded
    const checkGoogleTagManager = () => {
      console.log('[GTM Debug] Checking Google Tag Manager status...');
      
      if (typeof window !== 'undefined') {
        console.log('[GTM Debug] Window available');
        
        // Check if dataLayer exists
        if (window.dataLayer) {
          console.log('[GTM Debug] ✅ dataLayer exists with', window.dataLayer.length, 'items');
          
          // Check if our helper functions exist
          if (typeof window.pushToDataLayer === 'function') {
            console.log('[GTM Debug] ✅ pushToDataLayer function is available');
          }
          
          if (typeof window.trackPageView === 'function') {
            console.log('[GTM Debug] ✅ trackPageView function is available');
          }
          
          if (typeof window.trackEvent === 'function') {
            console.log('[GTM Debug] ✅ trackEvent function is available');
          }
          
          // Test GTM event
          try {
            window.pushToDataLayer('gtm_debug_test', {
              debug_info: 'Analytics component loaded via GTM',
              page_path: pathname,
              event_category: 'debug'
            });
            console.log('[GTM Debug] ✅ Test event sent successfully');
          } catch (error) {
            console.error('[GTM Debug] ❌ Error sending test event:', error);
          }
        } else {
          console.log('[GTM Debug] ❌ dataLayer not found');
          
          // Check if GTM script is loaded
          const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
          console.log('[GTM Debug] GTM script element:', gtmScript ? 'Found' : 'Not found');
        }
      }
    };

    // Check immediately and after a delay
    checkGoogleTagManager();
    
    const timer = setTimeout(() => {
      console.log('[GTM Debug] Rechecking after 2 seconds...');
      checkGoogleTagManager();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    console.log('[Analytics] Route change detected:', pathname);
    
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Send pageview to Google Tag Manager
    if (typeof window !== 'undefined' && window.dataLayer && window.trackPageView) {
      try {
        // Use our custom trackPageView function
        window.trackPageView(url);
        
        // Also push additional page data
        window.pushToDataLayer('page_navigation', {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href,
          navigation_type: 'route_change',
          referrer: document.referrer || 'direct'
        });
        
        console.log('[Analytics] ✅ Pageview sent to Google Tag Manager');
      } catch (error) {
        console.error('[Analytics] ❌ Error sending pageview to GTM:', error);
      }
    } else {
      console.warn('[Analytics] ❌ Google Tag Manager not available for pageview tracking');
    }
    
  }, [pathname, searchParams]);

  return null;
}