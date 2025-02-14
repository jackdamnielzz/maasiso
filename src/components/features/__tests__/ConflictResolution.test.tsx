import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConflictResolution } from '../ConflictResolution';
import { conflictResolutionService } from '@/lib/conflicts/service';
import { monitoringService } from '@/lib/monitoring/service';
import { 
  ConflictDetails, 
  ResourceTypes, 
  ChangeTypes,
  ResolutionTypes,
  FieldResolutionTypes
} from '@/lib/conflicts/types';
import { MonitoringEventTypes } from '@/lib/monitoring/types';

// Mock services
jest.mock('@/lib/conflicts/service', () => ({
  conflictResolutionService: {
    resolveConflict: jest.fn()
  }
}));

jest.mock('@/lib/monitoring/service', () => ({
  monitoringService: {
    trackEvent: jest.fn(),
    trackError: jest.fn()
  }
}));

describe('ConflictResolution', () => {
  // Mock props
  const mockConflict: ConflictDetails<Record<string, unknown>> = {
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
  };

  const mockProps = {
    conflict: mockConflict,
    onResolved: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (conflictResolutionService.resolveConflict as jest.Mock).mockResolvedValue({});
  });

  it('should render conflict details', () => {
    render(<ConflictResolution {...mockProps} />);

    // Check for main elements
    expect(screen.getByRole('heading', { name: 'Resolve Conflict' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve Conflict' })).toBeInTheDocument();
    expect(screen.getByText(/Changes were made to this article/)).toBeInTheDocument();
    expect(screen.getByText('Conflicting fields:')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();

    // Check for resolution options
    expect(screen.getByLabelText('Keep my changes')).toBeInTheDocument();
    expect(screen.getByLabelText('Use server version')).toBeInTheDocument();
    expect(screen.getByLabelText('Merge changes')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolve manually')).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve Conflict' })).toBeInTheDocument();
  });

  it('should handle strategy selection', () => {
    render(<ConflictResolution {...mockProps} />);

    // Default strategy should be 'manual'
    expect(screen.getByLabelText('Resolve manually')).toBeChecked();

    // Change strategy to 'client-wins'
    fireEvent.click(screen.getByLabelText('Keep my changes'));
    expect(screen.getByLabelText('Keep my changes')).toBeChecked();
    expect(screen.getByLabelText('Resolve manually')).not.toBeChecked();
  });

  it('should handle successful conflict resolution', async () => {
    render(<ConflictResolution {...mockProps} />);

    // Select client-wins strategy
    fireEvent.click(screen.getByLabelText('Keep my changes'));

    // Click resolve button
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Conflict' }));

    // Check loading state
    expect(screen.getByText('Resolving...')).toBeInTheDocument();
    expect(screen.getByText('Resolving...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    await waitFor(() => {
      // Verify service calls
      expect(conflictResolutionService.resolveConflict).toHaveBeenCalledWith(
        mockConflict.id,
        { type: ResolutionTypes.CLIENT_WINS, mergeFields: undefined }
      );

      expect(monitoringService.trackEvent).toHaveBeenCalledWith(
        MonitoringEventTypes.CONFLICT,
        {
          type: ResolutionTypes.CLIENT_WINS,
          entityType: mockConflict.resourceType,
          entityId: mockConflict.id,
          resolution: 'resolved',
          conflictDetails: {
            fields: mockConflict.conflictFields,
            success: true,
            originalStrategy: ResolutionTypes.CLIENT_WINS
          }
        }
      );

      expect(mockProps.onResolved).toHaveBeenCalled();
    });
  });

  it('should handle resolution error', async () => {
    const error = new Error('Resolution failed');
    (conflictResolutionService.resolveConflict as jest.Mock).mockRejectedValue(error);

    render(<ConflictResolution {...mockProps} />);

    // Click resolve button
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Conflict' }));

    await waitFor(() => {
      expect(monitoringService.trackError).toHaveBeenCalledWith(error, {
        componentName: 'ConflictResolution',
        operation: 'resolve',
        context: {
          strategy: ResolutionTypes.MANUAL,
          resourceType: mockConflict.resourceType
        }
      });

      // Button should be enabled again
      expect(screen.getByRole('button', { name: 'Resolve Conflict' })).toBeEnabled();
    });
  });

  it('should handle merge strategy with default field values', async () => {
    render(<ConflictResolution {...mockProps} />);

    // Select merge strategy
    fireEvent.click(screen.getByLabelText('Merge changes'));

    // Click resolve button
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Conflict' }));

    await waitFor(() => {
      expect(conflictResolutionService.resolveConflict).toHaveBeenCalledWith(
        mockConflict.id,
        {
          type: ResolutionTypes.MERGE,
          mergeFields: {
            title: FieldResolutionTypes.CLIENT // Default to client values for merge strategy
          }
        }
      );
    });
  });

  it('should handle cancel', () => {
    render(<ConflictResolution {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('should disable buttons while resolving', async () => {
    // Make resolution take some time
    (conflictResolutionService.resolveConflict as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<ConflictResolution {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Resolve Conflict' }));

    // Buttons should be disabled during resolution
    expect(screen.getByText('Resolving...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    // Wait for resolution to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Resolve Conflict' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });
  });
});
