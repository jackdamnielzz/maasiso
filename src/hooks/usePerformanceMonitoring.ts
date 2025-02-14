"use client";

import { useCallback, useEffect, useRef } from 'react';
import { monitoringService } from '@/lib/monitoring/service';
import { WebVitalMetric, NavigationTiming, ResourceTiming } from '@/lib/monitoring/types';

const WEB_VITAL_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
} as const;

type WebVitalName = keyof typeof WEB_VITAL_THRESHOLDS;

const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const metric = WEB_VITAL_THRESHOLDS[name as WebVitalName];
  if (!metric) return 'good';

  if (value <= metric.good) return 'good';
  if (value >= metric.poor) return 'poor';
  return 'needs-improvement';
};

export function usePerformanceMonitoring() {
  const isFirstLoad = useRef(true);

  const collectNavigationTiming = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const timing: NavigationTiming = {
      name: 'navigation',
      value: navigation.duration,
      timestamp: Date.now(),
      type: navigation.type as 'navigate' | 'reload' | 'back_forward' | 'prerender',
      unloadEventStart: navigation.unloadEventStart,
      unloadEventEnd: navigation.unloadEventEnd,
      domInteractive: navigation.domInteractive,
      domContentLoadedEventStart: navigation.domContentLoadedEventStart,
      domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
      domComplete: navigation.domComplete,
      loadEventStart: navigation.loadEventStart,
      loadEventEnd: navigation.loadEventEnd,
      duration: navigation.duration
    };

    monitoringService.trackNavigationTiming(timing);
  }, []);

  const collectResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
      const timing: ResourceTiming = {
        name: resource.name,
        value: resource.duration,
        timestamp: Date.now(),
        initiatorType: resource.initiatorType,
        duration: resource.duration,
        startTime: resource.startTime,
        responseEnd: resource.responseEnd,
        transferSize: (resource as PerformanceResourceTiming).transferSize,
        decodedBodySize: (resource as PerformanceResourceTiming).decodedBodySize,
        encodedBodySize: (resource as PerformanceResourceTiming).encodedBodySize
      };

      monitoringService.trackResourceTiming(timing);
    });

    // Clear the buffer after collecting
    performance.clearResourceTimings();
  }, []);

  const updateWebVital = useCallback((name: string, value: number, delta?: number) => {
    const metric: WebVitalMetric = {
      id: `${name}-${Date.now()}`,
      name,
      value,
      delta,
      rating: getRating(name, value),
      entries: performance.getEntriesByName(name)
    };

    monitoringService.updateWebVital(metric);
  }, []);

  const updateLoadTime = useCallback((time: number) => {
    monitoringService.trackPerformanceMetric({
      name: isFirstLoad.current ? 'firstLoad' : 'subsequentLoad',
      value: time,
      timestamp: Date.now(),
      context: {
        isFirstLoad: isFirstLoad.current
      }
    });
    isFirstLoad.current = false;
  }, []);

  useEffect(() => {
    // Collect initial metrics
    collectNavigationTiming();
    collectResourceTiming();

    // Set up observers for ongoing collection
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          const timing: ResourceTiming = {
            name: resourceEntry.name,
            value: resourceEntry.duration,
            timestamp: Date.now(),
            initiatorType: resourceEntry.initiatorType,
            duration: resourceEntry.duration,
            startTime: resourceEntry.startTime,
            responseEnd: resourceEntry.responseEnd,
            transferSize: resourceEntry.transferSize,
            decodedBodySize: resourceEntry.decodedBodySize,
            encodedBodySize: resourceEntry.encodedBodySize
          };
          monitoringService.trackResourceTiming(timing);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    return () => {
      resourceObserver.disconnect();
    };
  }, [collectNavigationTiming, collectResourceTiming]);

  return {
    updateWebVital,
    updateLoadTime,
  };
}
