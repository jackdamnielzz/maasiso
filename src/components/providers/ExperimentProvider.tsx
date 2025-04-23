'use client';

import { ReactNode, useEffect } from 'react';
import { initializeExperiments } from '../../lib/experiments/core';
import { usePathname } from 'next/navigation';

interface ExperimentProviderProps {
  children: ReactNode;
}

export function ExperimentProvider({ children }: ExperimentProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize experiments with current path and user info
    initializeExperiments({
      userId: 'anonymous', // Use anonymous ID for non-authenticated users
      userAttributes: {
        path: pathname ?? '/',
        language: navigator.language,
        platform: navigator.platform,
      }
    });
  }, [pathname]); // Re-run when path changes

  return <>{children}</>;
}
