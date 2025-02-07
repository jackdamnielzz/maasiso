import { ExperimentConfig, UserSegment, ExperimentAssignment } from './types';

/**
 * Generate a consistent hash for user segmentation
 */
export function generateUserHash(userId: string, experimentId: string): number {
  let hash = 0;
  const str = `${userId}:${experimentId}`;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Check if a user matches experiment audience criteria
 */
export function matchesAudience(
  experiment: ExperimentConfig,
  userAttributes: Record<string, string>
): boolean {
  if (!experiment.audience.filters?.length) {
    return true;
  }

  return experiment.audience.filters.every(filter => {
    const userValue = userAttributes[filter.type];
    return userValue === filter.value;
  });
}

/**
 * Assign user to experiment variant
 */
export function assignToVariant(
  experimentId: string,
  userId: string,
  experiment: ExperimentConfig,
  existingAssignments: UserSegment[]
): ExperimentAssignment {
  // Check for existing assignment
  const existing = existingAssignments.find(
    a => a.experimentId === experimentId
  );
  
  if (existing) {
    return {
      experimentId,
      variantId: existing.variantId,
      isNewAssignment: false
    };
  }

  // Generate hash for consistent assignment
  const hash = generateUserHash(userId, experimentId);
  const hashPercentile = (hash % 100) + 1;
  
  // Check audience targeting
  if (hashPercentile > experiment.audience.percentage) {
    return {
      experimentId,
      variantId: experiment.variants[0].id, // Default variant
      isNewAssignment: true
    };
  }

  // Assign to variant based on weights
  let cumulative = 0;
  const roll = (hash % 100) + 1;

  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (roll <= cumulative) {
      return {
        experimentId,
        variantId: variant.id,
        isNewAssignment: true
      };
    }
  }

  // Fallback to first variant
  return {
    experimentId,
    variantId: experiment.variants[0].id,
    isNewAssignment: true
  };
}

/**
 * Store experiment assignment in localStorage
 */
export function storeAssignment(
  userId: string,
  assignment: ExperimentAssignment
): void {
  const key = `exp_${userId}`;
  const stored = localStorage.getItem(key);
  const assignments: UserSegment[] = stored ? JSON.parse(stored) : [];

  assignments.push({
    id: `${assignment.experimentId}_${assignment.variantId}`,
    experimentId: assignment.experimentId,
    variantId: assignment.variantId,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(assignments));
}

/**
 * Get stored assignments for a user
 */
export function getStoredAssignments(userId: string): UserSegment[] {
  const key = `exp_${userId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Check if experiment is active
 */
export function isExperimentActive(experiment: ExperimentConfig): boolean {
  const now = new Date();
  const startDate = new Date(experiment.startDate);
  const endDate = experiment.endDate ? new Date(experiment.endDate) : null;

  return now >= startDate && (!endDate || now <= endDate);
}
