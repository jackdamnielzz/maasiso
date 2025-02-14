import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useConflictResolution } from '../useConflictResolution';
import { conflictResolutionService } from '@/lib/conflicts/service';
import { monitoringService } from '@/lib/monitoring/service';
import { MonitoringEventTypes } from '@/lib/monitoring/types';
import { 
  ConflictDetails, 
  ResourceTypes, 
  ChangeTypes 
} from '@/lib/conflicts/types';

// Mock services
jest.mock('@/lib/conflicts/service', () => ({
  conflictResolutionService: {
    getPendingConflicts: jest.fn()
  }
}));

jest.mock('@/lib/monitoring/service', () => ({
  monitoringService: {
    trackEvent: jest.fn(),
    trackError: jest.fn()
  }
}));

describe('useConflictResolution', () => {
  // Mock conflict data
  const mockConflicts: ConflictDetails<Record<string, unknown>>[] = [
    {
      id: '1',
      resourceType: ResourceTypes.ARTICLE,
      localChange: {
        id: '1',
        type: ChangeTypes.UPDATE,
        resourceType: ResourceTypes.ARTICLE,
        data: { title: 'Client Title' },
        metadata: {
          timestamp: Date.now(),
          userId: 'test-user',
          deviceId: 'test-device',
          version: 1
        }
      },
      serverState: { title: 'Server Title' },
      conflictType: ChangeTypes.UPDATE,
      conflictFields: ['title']
    },
    {
      id: '2',
      resourceType: ResourceTypes.PAGE,
      localChange: {
        id: '2',
        type: ChangeTypes.UPDATE,
        resourceType: ResourceTypes.PAGE,
        data: { content: 'Client Content' },
        metadata: {
          timestamp: Date.now(),
          userId: 'test-user',
          deviceId: 'test-device',
          version: 1
        }
      },
      serverState: { content: 'Server Content' },
      conflictType: ChangeTypes.UPDATE,
      conflictFields: ['content']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (conflictResolutionService.getPendingConflicts as jest.Mock).mockResolvedValue([]);
  });

  it('should initialize with empty conflicts', async () => {
    const { result } = renderHook(() => useConflictResolution());

    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // Wait for initial load to complete
    await act(async () => {
      await Promise.resolve();
    });

    // After loading completes
    expect(result.current.conflicts).toEqual([]);
    expect(result.current.activeConflict).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasConflicts).toBe(false);
  });

  it('should load pending conflicts on mount', async () => {
    (conflictResolutionService.getPendingConflicts as jest.Mock).mockResolvedValue(mockConflicts);

    const { result } = renderHook(() => useConflictResolution());

    // Initial state
    expect(result.current.isLoading).toBe(true);

    // Wait for conflicts to load
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.conflicts).toEqual(mockConflicts);
    expect(result.current.hasConflicts).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(monitoringService.trackEvent).toHaveBeenCalledWith(MonitoringEventTypes.SYNC, {
      operation: 'complete',
      changesCount: mockConflicts.length
    });
  });

  it('should handle conflict resolution service error', async () => {
    const error = new Error('Failed to fetch conflicts');
    (conflictResolutionService.getPendingConflicts as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useConflictResolution());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(monitoringService.trackError).toHaveBeenCalledWith(error, {
      context: {
        component: 'ConflictResolution',
        operation: 'refreshConflicts'
      }
    });
  });

  it('should show next conflict', async () => {
    (conflictResolutionService.getPendingConflicts as jest.Mock).mockResolvedValue(mockConflicts);

    const { result } = renderHook(() => useConflictResolution());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.showNextConflict();
    });

    expect(result.current.activeConflict).toEqual(mockConflicts[0]);
    expect(monitoringService.trackEvent).toHaveBeenCalledWith(MonitoringEventTypes.CONFLICT, {
      type: 'client-wins',
      entityType: mockConflicts[0].resourceType,
      entityId: mockConflicts[0].id,
      resolution: 'show',
      conflictDetails: {}
    });
  });

  it('should dismiss active conflict', async () => {
    (conflictResolutionService.getPendingConflicts as jest.Mock).mockResolvedValue(mockConflicts);

    const { result } = renderHook(() => useConflictResolution());

    await act(async () => {
      await Promise.resolve();
    });

    // Show a conflict first
    act(() => {
      result.current.showNextConflict();
    });

    expect(result.current.activeConflict).toBeTruthy();

    // Dismiss the conflict
    act(() => {
      result.current.dismissConflict();
    });

    expect(result.current.activeConflict).toBeNull();
    expect(monitoringService.trackEvent).toHaveBeenCalledWith(MonitoringEventTypes.CONFLICT, {
      type: 'client-wins',
      entityType: mockConflicts[0].resourceType,
      entityId: mockConflicts[0].id,
      resolution: 'dismiss',
      conflictDetails: {}
    });
  });

  it('should handle conflict resolution', async () => {
    (conflictResolutionService.getPendingConflicts as jest.Mock)
      .mockResolvedValueOnce(mockConflicts)
      .mockResolvedValueOnce([mockConflicts[1]]); // Second call returns one less conflict

    const { result } = renderHook(() => useConflictResolution());

    await act(async () => {
      await Promise.resolve();
    });

    // Show a conflict
    act(() => {
      result.current.showNextConflict();
    });

    expect(result.current.activeConflict).toEqual(mockConflicts[0]);

    // Resolve the conflict
    await act(async () => {
      await result.current.handleConflictResolved();
    });

    expect(result.current.activeConflict).toBeNull();
    expect(result.current.conflicts).toEqual([mockConflicts[1]]);
    expect(conflictResolutionService.getPendingConflicts).toHaveBeenCalledTimes(2);
  });

  it('should refresh conflicts', async () => {
    (conflictResolutionService.getPendingConflicts as jest.Mock)
      .mockResolvedValueOnce(mockConflicts)
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() => useConflictResolution());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.conflicts).toEqual(mockConflicts);

    // Refresh conflicts
    await act(async () => {
      await result.current.refreshConflicts();
    });

    expect(result.current.conflicts).toEqual([]);
    expect(conflictResolutionService.getPendingConflicts).toHaveBeenCalledTimes(2);
  });
});
