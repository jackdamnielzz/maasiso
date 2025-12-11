'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/analytics';

export default function WebVitalsReporter() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Import web-vitals dynamically to reduce bundle size
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Track Core Web Vitals
      onCLS((metric) => {
        trackWebVitals({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta
        });
      });

      onFID((metric) => {
        trackWebVitals({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta
        });
      });

      onFCP((metric) => {
        trackWebVitals({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta
        });
      });

      onLCP((metric) => {
        trackWebVitals({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta
        });
      });

      onTTFB((metric) => {
        trackWebVitals({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta
        });
      });
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }, []);

  return null;
} 