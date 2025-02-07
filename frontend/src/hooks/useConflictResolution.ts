import { useState, useEffect, useCallback } from 'react';
import { ConflictDetails } from '@/lib/conflicts/types';
import { conflictResolutionService } from '@/lib/conflicts/service';
import { monitoringService } from '@/lib/monitoring/service';
import { MonitoringEventTypes } from '@/lib/monitoring/types';

export function useConflictResolution() {
  const [conflicts, setConflicts] = useState<ConflictDetails<Record<string, unknown>>[]>([]);
  const [activeConflict, setActiveConflict] = useState<ConflictDetails<Record<string, unknown>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending conflicts
  const refreshConflicts = useCallback(async () => {
    try {
      setIsLoading(true);
      const pendingConflicts = await conflictResolutionService.getPendingConflicts();
      setConflicts(pendingConflicts);

      monitoringService.trackEvent(MonitoringEventTypes.SYNC, {
        operation: 'complete',
        changesCount: pendingConflicts.length
      });
    } catch (error) {
      if (error instanceof Error) {
        monitoringService.trackError(error, {
          context: {
            component: 'ConflictResolution',
            operation: 'refreshConflicts'
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshConflicts();
  }, [refreshConflicts]);

  // Handle conflict resolution
  const handleConflictResolved = useCallback(async () => {
    setActiveConflict(null);
    await refreshConflicts();
  }, [refreshConflicts]);

  // Show next conflict
  const showNextConflict = useCallback(() => {
    const nextConflict = conflicts[0];
    if (nextConflict) {
      setActiveConflict(nextConflict);
      monitoringService.trackEvent(MonitoringEventTypes.CONFLICT, {
        type: 'client-wins',
        entityType: nextConflict.resourceType,
        entityId: nextConflict.id,
        resolution: 'show',
        conflictDetails: {}
      });
    }
  }, [conflicts]);

  // Dismiss current conflict
  const dismissConflict = useCallback(() => {
    if (activeConflict) {
      monitoringService.trackEvent(MonitoringEventTypes.CONFLICT, {
        type: 'client-wins',
        entityType: activeConflict.resourceType,
        entityId: activeConflict.id,
        resolution: 'dismiss',
        conflictDetails: {}
      });
    }
    setActiveConflict(null);
  }, [activeConflict]);

  return {
    conflicts,
    activeConflict,
    isLoading,
    hasConflicts: conflicts.length > 0,
    refreshConflicts,
    handleConflictResolved,
    showNextConflict,
    dismissConflict
  };
}
