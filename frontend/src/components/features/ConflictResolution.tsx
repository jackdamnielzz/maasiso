'use client';

import React, { useState } from 'react';
import { ConflictDetails, ResolutionStrategy } from '@/lib/conflicts/types';
import { conflictResolutionService } from '@/lib/conflicts/service';
import { monitoringService } from '@/lib/monitoring/service';
import { MonitoringEventTypes, MonitoringEventData } from '@/lib/monitoring/types';

interface ConflictResolutionProps {
  conflict: ConflictDetails<Record<string, unknown>>;
  onResolved: () => void;
  onCancel: () => void;
}

export function ConflictResolution({ conflict, onResolved, onCancel }: ConflictResolutionProps) {
  const [strategy, setStrategy] = useState<ResolutionStrategy['type']>('manual');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      
      const resolution = await conflictResolutionService.resolveConflict(conflict.id, {
        type: strategy,
        mergeFields: strategy === 'merge' ? 
          // Default to client values for merge strategy
          Object.fromEntries(
            (conflict.conflictFields ?? []).map((field: string) => [field, 'client'])
          ) : undefined
      });

      monitoringService.trackEvent(MonitoringEventTypes.CONFLICT, {
        type: strategy === 'manual' ? 'client-wins' : strategy,
        entityType: conflict.resourceType,
        entityId: conflict.id,
        resolution: 'resolved',
        conflictDetails: {
          fields: conflict.conflictFields,
          success: true,
          originalStrategy: strategy
        }
      });

      onResolved();
    } catch (error) {
      if (error instanceof Error) {
        monitoringService.trackError(error, {
          componentName: 'ConflictResolution',
          operation: 'resolve',
          context: {
            strategy,
            resourceType: conflict.resourceType
          }
        });
      }
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Resolve Conflict</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Changes were made to this {conflict.resourceType} both locally and on the server.
            How would you like to resolve this conflict?
          </p>
          
          {conflict.conflictFields && conflict.conflictFields.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-500 mb-1">Conflicting fields:</p>
              <ul className="list-disc list-inside">
                {conflict.conflictFields.map((field: string) => (
                  <li key={field} className="text-sm text-gray-700">{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="client-wins"
              checked={strategy === 'client-wins'}
              onChange={(e) => setStrategy(e.target.value as ResolutionStrategy['type'])}
              className="text-blue-600"
            />
            <span>Keep my changes</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="server-wins"
              checked={strategy === 'server-wins'}
              onChange={(e) => setStrategy(e.target.value as ResolutionStrategy['type'])}
              className="text-blue-600"
            />
            <span>Use server version</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="merge"
              checked={strategy === 'merge'}
              onChange={(e) => setStrategy(e.target.value as ResolutionStrategy['type'])}
              className="text-blue-600"
            />
            <span>Merge changes</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="manual"
              checked={strategy === 'manual'}
              onChange={(e) => setStrategy(e.target.value as ResolutionStrategy['type'])}
              className="text-blue-600"
            />
            <span>Resolve manually</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isResolving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isResolving ? 'Resolving...' : 'Resolve Conflict'}
          </button>
        </div>
      </div>
    </div>
  );
}
