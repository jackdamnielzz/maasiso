'use client';

import { useEffect, useState } from 'react';
import { initGA, trackWebVital } from '@/lib/analytics';
import { onCLS, onFID, onLCP, onTTFB, onFCP } from 'web-vitals';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsState {
  initialized: boolean;
  error: Error | null;
}

export default function Analytics() {
  const [state, setState] = useState<AnalyticsState>({
    initialized: false,
    error: null,
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize Analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await initGA();
        setState({ initialized: true, error: null });

        // Track Core Web Vitals after initialization
        onCLS(trackWebVital);
        onFID(trackWebVital);
        onLCP(trackWebVital);
        onFCP(trackWebVital);
        // Track additional metrics
        onTTFB(trackWebVital);
      } catch (error) {
        setState({
          initialized: false,
          error: error instanceof Error ? error : new Error('Failed to initialize analytics'),
        });
        console.error('Analytics initialization failed:', error);
      }
    };

    if (!state.initialized && !state.error) {
      initializeAnalytics();
    }
  }, [state.initialized, state.error]);

  // Track page views
  useEffect(() => {
    if (state.initialized) {
      const url = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      
      console.log('Page view:', url);
      // Add your analytics tracking code here
    }
  }, [pathname, searchParams, state.initialized]);

  // Log initialization status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (state.initialized) {
        console.log('Analytics initialized successfully');
      } else if (state.error) {
        console.error('Analytics initialization failed:', state.error);
      }
    }
  }, [state.initialized, state.error]);

  return null; // This component doesn't render anything
}
