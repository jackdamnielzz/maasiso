/**
 * Types for offline conflict resolution system
 */

// Resource type validation
export const ResourceTypes = {
  PAGE: 'page',
  POST: 'post',
  ARTICLE: 'article',
  MEDIA: 'media',
  USER: 'user',
  SETTINGS: 'settings'
} as const;

export type ResourceType = typeof ResourceTypes[keyof typeof ResourceTypes];

// Change type validation
export const ChangeTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
} as const;

export type ChangeType = typeof ChangeTypes[keyof typeof ChangeTypes];

// Resolution strategy validation
export const ResolutionTypes = {
  CLIENT_WINS: 'client-wins',
  SERVER_WINS: 'server-wins',
  MANUAL: 'manual',
  MERGE: 'merge'
} as const;

export type ResolutionType = typeof ResolutionTypes[keyof typeof ResolutionTypes];

// Field resolution validation
export const FieldResolutionTypes = {
  CLIENT: 'client',
  SERVER: 'server',
  NEWEST: 'newest',
  MANUAL: 'manual'
} as const;

export type FieldResolutionType = typeof FieldResolutionTypes[keyof typeof FieldResolutionTypes];

export interface ConflictMetadata {
  timestamp: number;
  userId: string;
  deviceId: string;
  version: number;
}

export interface OfflineChange<T extends Record<string, unknown>> {
  id: string;
  type: ChangeType;
  resourceType: ResourceType;
  data: T;
  metadata: ConflictMetadata;
}

export interface ConflictDetails<T extends Record<string, unknown>> {
  id: string;
  resourceType: ResourceType;
  localChange: OfflineChange<T>;
  serverState: T;
  conflictType: Extract<ChangeType, 'update' | 'delete'>;
  conflictFields?: Array<keyof T>;
}

export interface ResolutionStrategy {
  type: ResolutionType;
  mergeFields?: {
    [field: string]: FieldResolutionType;
  };
}

export interface ConflictResolution<T extends Record<string, unknown>> {
  conflictId: string;
  strategy: ResolutionStrategy;
  resolvedData?: T;
  metadata: ConflictMetadata;
}

export type ConflictHandler = <T extends Record<string, unknown>>(
  conflict: ConflictDetails<T>
) => Promise<ConflictResolution<T>>;

// Event data types for monitoring integration
export interface ConflictEventData {
  resourceType: ResourceType;
  conflictFields?: string[];
  changeType: ChangeType;
  action: string;
  strategy: ResolutionType;
  success: boolean;
  error?: {
    message: string;
    stack?: string;
  };
}
