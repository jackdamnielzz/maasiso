import { trackEvent } from '../analytics';
import { ExperimentConfig, ExperimentAssignment, UserSegment } from './types';
import { 
  assignToVariant, 
  getStoredAssignments, 
  isExperimentActive, 
  matchesAudience, 
  storeAssignment 
} from './utils';

interface ExperimentManagerConfig {
  userId: string;
  userAttributes: Record<string, string>;
}

class ExperimentManager {
  private userId: string;
  private userAttributes: Record<string, string>;
  private assignments: UserSegment[];

  constructor(config: ExperimentManagerConfig) {
    this.userId = config.userId;
    this.userAttributes = config.userAttributes;
    this.assignments = getStoredAssignments(config.userId);
  }

  /**
   * Get variant for an experiment
   */
  public getVariant(experiment: ExperimentConfig): string {
    // Check if experiment is active
    if (!isExperimentActive(experiment)) {
      return experiment.variants[0].id; // Return control variant
    }

    // Check audience targeting
    if (!matchesAudience(experiment, this.userAttributes)) {
      return experiment.variants[0].id; // Return control variant
    }

    // Get or create assignment
    const assignment = assignToVariant(
      experiment.id,
      this.userId,
      experiment,
      this.assignments
    );

    // Store new assignments
    if (assignment.isNewAssignment) {
      storeAssignment(this.userId, assignment);
      this.trackExperimentAssignment(experiment, assignment);
    }

    return assignment.variantId;
  }

  /**
   * Track experiment-related events
   */
  public trackExperimentEvent(
    experimentId: string,
    experimentName: string,
    variantId: string,
    variantName: string,
    isConversion = false,
    conversionData?: { type: string; value?: number }
  ): void {
    trackEvent({
      category: 'experiment',
      action: isConversion ? 'experiment_conversion' : 'experiment_exposure',
      experiment_id: experimentId,
      experiment_name: experimentName,
      variant_id: variantId,
      variant_name: variantName,
      label: `${experimentId}:${variantId}`,
      ...(isConversion && conversionData ? {
        conversion_type: conversionData.type,
        conversion_value: conversionData.value
      } : {})
    });
  }

  /**
   * Track experiment assignment
   */
  private trackExperimentAssignment(
    experiment: ExperimentConfig,
    assignment: ExperimentAssignment
  ): void {
    const variant = experiment.variants.find((v: { id: string; name: string }) => v.id === assignment.variantId);
    trackEvent({
      category: 'experiment',
      action: 'experiment_exposure',
      experiment_id: experiment.id,
      experiment_name: experiment.name,
      variant_id: assignment.variantId,
      variant_name: variant?.name || 'unknown',
      label: `${experiment.id}:${assignment.variantId}`
    });
  }
}

// Create and export singleton instance
let experimentManager: ExperimentManager | null = null;

export function initializeExperiments(config: ExperimentManagerConfig): void {
  experimentManager = new ExperimentManager(config);
}

export function getExperimentManager(): ExperimentManager {
  if (!experimentManager) {
    throw new Error('Experiment manager not initialized. Call initializeExperiments first.');
  }
  return experimentManager;
}

/**
 * React hook for experiment variant assignment
 */
export function useExperiment(experiment: ExperimentConfig): string {
  const manager = getExperimentManager();
  return manager.getVariant(experiment);
}
