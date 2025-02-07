'use client';

import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTimes: {
    firstLoad: number[];
    subsequent: number[];
  };
  webVitals: Record<string, {
    average: number;
    p75: number;
    latest: {
      value: number;
      rating: string;
      timestamp: number;
    };
  }>;
}

export function PerformanceMonitor() {
  const { updateWebVital, updateLoadTime } = usePerformanceMonitoring();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Update metrics every second in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        import('@/lib/monitoring/service').then(({ monitoringService }) => {
          const webVitals = monitoringService.getMetrics();
          const currentMetrics = {
            loadTimes: {
              firstLoad: [],
              subsequent: []
            },
            webVitals: Object.entries(webVitals).reduce((acc, [name, value]) => ({
              ...acc,
              [name]: {
                average: value,
                p75: value,
                latest: {
                  value,
                  rating: monitoringService.getRating(name, value),
                  timestamp: Date.now()
                }
              }
            }), {})
          };
          setMetrics(currentMetrics);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // Only show in development and when not disabled
  if (process.env.NODE_ENV !== 'development' || !metrics || process.env.NEXT_PUBLIC_DISABLE_PERFORMANCE_MONITORING === 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white/90 backdrop-blur shadow-lg rounded-lg max-w-md text-sm">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      
      {/* Web Vitals */}
      <div className="mb-4">
        <h4 className="font-semibold mb-1">Web Vitals</h4>
        {Object.entries(metrics.webVitals).map(([name, data]) => (
          <div key={name} className="grid grid-cols-4 gap-2 mb-1">
            <span className="font-mono">{name}</span>
            <span className={`${getRatingColor(data.latest?.rating || 'good')}`}>
              {data.latest?.value?.toFixed(2) || '0.00'}
            </span>
            <span>avg: {data.average?.toFixed(2) || '0.00'}</span>
            <span>p75: {data.p75?.toFixed(2) || '0.00'}</span>
          </div>
        ))}
      </div>

      {/* Load Times */}
      <div>
        <h4 className="font-semibold mb-1">Load Times</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-gray-600">First Load</span>
            {metrics.loadTimes.firstLoad.length > 0 ? (
              <span>{metrics.loadTimes.firstLoad.at(-1)?.toFixed(2)}ms</span>
            ) : (
              <span className="text-gray-400">No data</span>
            )}
          </div>
          <div>
            <span className="block text-xs text-gray-600">Subsequent</span>
            {metrics.loadTimes.subsequent.length > 0 ? (
              <span>{metrics.loadTimes.subsequent.at(-1)?.toFixed(2)}ms</span>
            ) : (
              <span className="text-gray-400">No data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'text-green-600';
    case 'needs-improvement':
      return 'text-yellow-600';
    case 'poor':
      return 'text-red-600';
    default:
      return '';
  }
}
