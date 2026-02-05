'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { initGA, trackScrollDepth, trackEngagement } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsState {
  initialized: boolean;
  error: Error | null;
}

/**
 * Send page view to Google Analytics via gtag
 * This respects Google Consent Mode v2 settings
 */
const sendPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: window.location.href,
    page_title: title || document.title,
  });
};

export default function Analytics() {
  const [state, setState] = useState<AnalyticsState>({
    initialized: false,
    error: null
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safePathname = pathname || '/';
  
  // Track scroll depth
  const scrollMilestonesRef = useRef<Set<number>>(new Set());
  const pageEntryTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);

  // Initialize Analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await initGA();
        setState({ initialized: true, error: null });
      } catch (error) {
        setState({
          initialized: false,
          error: error instanceof Error ? error : new Error('Failed to initialize analytics')
        });
        console.error('[Analytics] Initialization failed:', error);
      }
    };

    if (!state.initialized && !state.error) {
      initializeAnalytics();
    }
  }, [state.initialized, state.error]);

  // Track page views
  useEffect(() => {
    if (!state.initialized) return;

    const params = searchParams?.toString();
    const url = params ? `${safePathname}?${params}` : safePathname;

    // Send page view to GA
    sendPageView(url);

    // Reset tracking for new page
    scrollMilestonesRef.current = new Set();
    pageEntryTimeRef.current = Date.now();
    maxScrollDepthRef.current = 0;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view:', url);
    }
  }, [safePathname, searchParams, state.initialized]);

  // Track scroll depth
  const handleScroll = useCallback(() => {
    if (!state.initialized) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    const scrollPercentage = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );

    // Update max scroll depth
    if (scrollPercentage > maxScrollDepthRef.current) {
      maxScrollDepthRef.current = scrollPercentage;
    }

    // Track milestones (25%, 50%, 75%, 90%, 100%)
    const milestones = [25, 50, 75, 90, 100];
    for (const milestone of milestones) {
      if (
        scrollPercentage >= milestone && 
        !scrollMilestonesRef.current.has(milestone)
      ) {
        scrollMilestonesRef.current.add(milestone);
        trackScrollDepth(milestone, safePathname);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Analytics] Scroll depth: ${milestone}%`);
        }
      }
    }
  }, [safePathname, state.initialized]);

  // Track engagement on page leave
  const handlePageLeave = useCallback(() => {
    if (!state.initialized) return;

    const timeOnPage = Date.now() - pageEntryTimeRef.current;
    
    // Only track if user spent meaningful time on page (> 5 seconds)
    if (timeOnPage > 5000) {
      trackEngagement(safePathname, timeOnPage, maxScrollDepthRef.current);
    }
  }, [safePathname, state.initialized]);

  // Set up scroll and visibility listeners
  useEffect(() => {
    if (!state.initialized) return;

    // Throttled scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', handlePageLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handlePageLeave();
      }
    });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('beforeunload', handlePageLeave);
    };
  }, [handleScroll, handlePageLeave, state.initialized]);

  return null;
}
