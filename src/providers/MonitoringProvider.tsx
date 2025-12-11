'use client';

import React, { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/monitoring/performance';
import { errorMonitor } from '@/lib/monitoring/error';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Initialize error monitoring
    errorMonitor.init();

    // No cleanup needed as the monitoring will be cleaned up
    // automatically on page unload
  }, []);

  return <>{children}</>;
}

// Export error monitor for use in error boundaries
export { errorMonitor };