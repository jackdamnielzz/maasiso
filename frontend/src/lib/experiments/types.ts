import { z } from 'zod';

/**
 * Experiment configuration schema
 */
export const experimentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(100)
  })),
  audience: z.object({
    percentage: z.number().min(0).max(100),
    filters: z.array(z.object({
      type: z.enum(['device', 'browser', 'country', 'custom']),
      value: z.string()
    })).optional()
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional()
});

export type ExperimentConfig = z.infer<typeof experimentConfigSchema>;

/**
 * Feature flag configuration
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  experiment?: ExperimentConfig;
}

/**
 * User segment definition
 */
export interface UserSegment {
  id: string;
  experimentId: string;
  variantId: string;
  timestamp: string;
}

/**
 * Experiment result tracking
 */
export interface ExperimentEvent {
  experimentId: string;
  variantId: string;
  eventName: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Experiment assignment result
 */
export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  isNewAssignment: boolean;
}
