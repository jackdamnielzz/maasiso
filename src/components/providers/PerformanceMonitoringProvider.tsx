"use client";

import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface Props {
  children: React.ReactNode;
}

export function PerformanceMonitoringProvider({ children }: Props) {
  const { updateWebVital } = usePerformanceMonitoring();

  useEffect(() => {
    // Core Web Vitals
    onCLS(metric => updateWebVital('CLS', metric.value, metric.delta));
    onFID(metric => updateWebVital('FID', metric.value, metric.delta));
    onLCP(metric => updateWebVital('LCP', metric.value, metric.delta));
    
    // Additional Web Vitals
    onFCP(metric => updateWebVital('FCP', metric.value, metric.delta));
    onTTFB(metric => updateWebVital('TTFB', metric.value, metric.delta));

    // Report initial page load time
    const loadTime = performance.now();
    updateWebVital('PageLoad', loadTime);

    // Set up performance observer for long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        updateWebVital('LongTask', entry.duration, entry.startTime);
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('LongTask observation not supported');
    }

    return () => {
      try {
        longTaskObserver.disconnect();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [updateWebVital]);

  return <>{children}</>;
}
