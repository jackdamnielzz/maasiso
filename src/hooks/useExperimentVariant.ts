import { useEffect, useState } from 'react';
import { ExperimentConfig } from '../lib/experiments/types';
import { getExperimentManager } from '../lib/experiments/core';

interface UseExperimentVariantOptions {
  trackExposure?: boolean;
}

/**
 * React hook for experiment variant assignment and tracking
 */
export function useExperimentVariant(
  experiment: ExperimentConfig,
  options: UseExperimentVariantOptions = {}
): string {
  const [variantId, setVariantId] = useState<string>('');

  useEffect(() => {
    const manager = getExperimentManager();
    const variant = manager.getVariant(experiment);
    setVariantId(variant);

    // Track exposure if enabled
    if (options.trackExposure) {
      const variantConfig = experiment.variants.find((v: { id: string; name: string; weight: number }) => v.id === variant);
      manager.trackExperimentEvent(
        experiment.id,
        experiment.name,
        variant,
        variantConfig?.name || 'unknown',
        false
      );
    }
  }, [experiment, options.trackExposure]);

  return variantId;
}

/**
 * Example usage:
 * 
 * const MyComponent = () => {
 *   const experiment = {
 *     id: 'new-search-ui',
 *     name: 'New Search UI Test',
 *     description: 'Testing new search interface',
 *     variants: [
 *       { id: 'control', name: 'Control', weight: 50 },
 *       { id: 'variant-a', name: 'New UI', weight: 50 }
 *     ],
 *     audience: { percentage: 100 },
 *     startDate: '2025-01-22T00:00:00Z'
 *   };
 * 
 *   const variant = useExperimentVariant(experiment, { trackExposure: true });
 * 
 *   return variant === 'variant-a' ? <NewSearchUI /> : <CurrentSearchUI />;
 * };
 */
