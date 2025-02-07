import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { monitoringService } from '../lib/monitoring/service';
import { ConflictResolution } from '@/components/features/ConflictResolution';
import { useConflictResolution } from './useConflictResolution';
import { ErrorContext } from '@/lib/monitoring/types';

// Type definitions for Service Worker and Sync Manager
interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

// Type definitions for component props and state
interface OfflineStatus {
  isOffline: boolean;
  hasPendingSync: boolean;
}

type ServiceWorkerMessage = {
  type: 'CONNECTION_STATUS' | 'SYNC_STATUS' | 'CONFIG';
  status?: 'online' | 'offline';
  hasPending?: boolean;
  config?: {
    apiUrl: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://153.92.223.23';

export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>({
    isOffline: !navigator.onLine,
    hasPendingSync: false
  });

  useEffect(() => {
    // Register service worker with scope
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', {
          scope: '/',
          // Add API URL to service worker for proper caching
          updateViaCache: 'none'
        })
        .then(registration => {
          console.debug('Service Worker registered:', registration);
          
          // Pass API URL to service worker
          registration.active?.postMessage({
            type: 'CONFIG',
            config: {
              apiUrl: API_URL
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          const errorContext: ErrorContext = {
            component: 'ServiceWorker',
            operation: 'registration',
            apiUrl: API_URL,
            severity: 'error',
            handled: true
          };
          monitoringService.trackError(error, errorContext);
        });
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOffline: true }));
    };

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CONNECTION_STATUS') {
        setStatus(prev => ({
          ...prev,
          isOffline: event.data.status === 'offline'
        }));
      } else if (event.data?.type === 'SYNC_STATUS') {
        setStatus(prev => ({
          ...prev,
          hasPendingSync: event.data.hasPending
        }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Check for pending sync on mount
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          (registration.sync as SyncManager).getTags().then(tags => {
            setStatus(prev => ({
              ...prev,
              hasPendingSync: tags.includes('offline-mutations')
            }));
          }).catch(error => {
            console.warn('Failed to get sync tags:', error);
          });
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return status;
}

interface OfflineStatusProviderProps {
  children: React.ReactNode;
}

export function OfflineStatusProvider({ children }: OfflineStatusProviderProps): React.ReactElement {
  const status = useOfflineStatus();
  const {
    activeConflict,
    hasConflicts,
    handleConflictResolved,
    dismissConflict,
    showNextConflict
  } = useConflictResolution();

  // Show conflict resolution dialog when back online
  useEffect(() => {
    if (!status.isOffline && hasConflicts && !activeConflict) {
      showNextConflict();
    }
  }, [status.isOffline, hasConflicts, activeConflict, showNextConflict]);

  return (
    <React.Fragment>
      {/* Offline Status Indicator */}
      {status.isOffline && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm text-yellow-800 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>You&apos;re offline</span>
          {status.hasPendingSync && (
            <span className="ml-2 text-xs">
              (Changes will sync when back online)
            </span>
          )}
        </div>
      )}

      {/* Conflict Resolution Dialog */}
      {activeConflict && (
        <ConflictResolution
          conflict={activeConflict}
          onResolved={handleConflictResolved}
          onCancel={dismissConflict}
        />
      )}

      {children}
    </React.Fragment>
  );
}
