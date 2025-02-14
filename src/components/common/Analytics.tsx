'use client';

import { useEffect, useState } from 'react';
import { initGA } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsState {
  initialized: boolean;
  error: Error | null;
}

export default function Analytics() {
  const [state, setState] = useState<AnalyticsState>({
    initialized: false,
    error: null
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    }
  }, [pathname, searchParams, state.initialized]);

  return null;
}