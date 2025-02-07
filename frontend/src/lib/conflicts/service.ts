import { monitoringService } from '../monitoring/service';
import { MonitoringEventTypes, MonitoringEventData } from '../monitoring/types';
import {
  ConflictDetails,
  ConflictHandler,
  ConflictMetadata,
  ConflictResolution,
  OfflineChange,
  ResolutionStrategy,
  ConflictEventData
} from './types';

class ConflictResolutionService {
  private deviceId: string;
  private customHandlers: Map<string, ConflictHandler>;
  private pendingConflicts: Map<string, ConflictDetails<any>>;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.customHandlers = new Map();
    this.pendingConflicts = new Map();
  }

  private generateDeviceId(): string {
    const stored = localStorage.getItem('device_id');
    if (stored) return stored;

    const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', newId);
    return newId;
  }

  private createMetadata(version: number = 1): ConflictMetadata {
    return {
      timestamp: Date.now(),
      userId: 'current-user', // TODO: Get from auth service
      deviceId: this.deviceId,
      version
    };
  }

  private async detectConflicts<T extends Record<string, unknown>>(
    localChange: OfflineChange<T>,
    serverState: T
  ): Promise<string[] | null> {
    if (!serverState) return null;

    const conflictFields: string[] = [];
    
    if (localChange.type === 'update') {
      // Process entries directly to avoid type conversion issues
      Object.entries(localChange.data).forEach(([field, localValue]) => {
        if (field in serverState) {
          const serverValue = serverState[field];
          if (
            serverValue !== undefined &&
            JSON.stringify(localValue) !== JSON.stringify(serverValue)
          ) {
            // field is guaranteed to be a string from Object.entries
            conflictFields.push(field);
          }
        }
      });
    }

    return conflictFields.length > 0 ? conflictFields : null;
  }

  public async registerChange<T extends Record<string, unknown>>(change: OfflineChange<T>): Promise<void> {
    try {
      const request = await fetch(`/api/${change.resourceType}/${change.id}`);
      const serverState = await request.json();

      const conflictFields = await this.detectConflicts(change, serverState);
      
      if (conflictFields) {
        const conflict: ConflictDetails<T> = {
          id: change.id,
          resourceType: change.resourceType,
          localChange: change,
          serverState,
          conflictType: 'update',
          conflictFields
        };

        this.pendingConflicts.set(change.id, conflict);
        
        monitoringService.trackEvent(MonitoringEventTypes.CONFLICT, {
          type: 'client-wins',
          entityType: change.resourceType,
          entityId: change.id,
          resolution: 'detect',
          conflictDetails: {
            fields: conflictFields,
            changeType: change.type
          }
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      monitoringService.trackError(err, {
        componentName: 'ConflictResolution',
        operation: 'registerChange',
        context: {
          resourceType: change.resourceType,
          changeId: change.id
        }
      });
      throw err;
    }
  }

  public async resolveConflict<T extends Record<string, unknown>>(
    conflictId: string,
    strategy: ResolutionStrategy
  ): Promise<ConflictResolution<T>> {
    const conflict = this.pendingConflicts.get(conflictId) as ConflictDetails<T>;
    if (!conflict) {
      throw new Error(`No conflict found with id: ${conflictId}`);
    }

    try {
      let resolvedData: T | undefined;

      switch (strategy.type) {
        case 'client-wins':
          resolvedData = { ...conflict.localChange.data } as T;
          break;
        
        case 'server-wins':
          resolvedData = { ...conflict.serverState } as T;
          break;
        
        case 'merge':
          resolvedData = { ...conflict.serverState } as T;
          if (strategy.mergeFields) {
            Object.entries(strategy.mergeFields).forEach(([field, preference]) => {
              if (preference === 'client') {
                const value = conflict.localChange.data[field];
                if (value !== undefined) {
                  resolvedData = { ...resolvedData, [field]: value } as T;
                }
              }
            });
          }
          break;
        
        case 'manual':
          break;
      }

      if (!resolvedData) {
        throw new Error('Failed to resolve conflict: No resolved data available');
      }

      const resolution: ConflictResolution<T> = {
        conflictId,
        strategy,
        resolvedData,
        metadata: this.createMetadata()
      };

      this.pendingConflicts.delete(conflictId);

      monitoringService.trackEvent(MonitoringEventTypes.CONFLICT, {
        type: strategy.type === 'manual' ? 'client-wins' : strategy.type,
        entityType: conflict.resourceType,
        entityId: conflict.id,
        resolution: 'resolved',
        conflictDetails: {
          fields: conflict.conflictFields,
          changeType: conflict.localChange.type,
          originalStrategy: strategy.type
        }
      });

      return resolution;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      monitoringService.trackError(err, {
        componentName: 'ConflictResolution',
        operation: 'resolveConflict',
        context: {
          conflictId,
          strategyType: strategy.type
        }
      });
      throw err;
    }
  }

  public registerCustomHandler(
    resourceType: string,
    handler: ConflictHandler
  ): void {
    this.customHandlers.set(resourceType, handler);
  }

  public async getPendingConflicts(): Promise<ConflictDetails<any>[]> {
    return Array.from(this.pendingConflicts.values());
  }

  public hasPendingConflicts(): boolean {
    return this.pendingConflicts.size > 0;
  }
}

export const conflictResolutionService = new ConflictResolutionService();
