import { TypedEventEmitter, RequestQueueEvents } from './events';
import { apiLogger } from './logger';

export class BatchProcessingError extends Error {
  constructor(
    message: string,
    public readonly batchId: string
  ) {
    super(message);
    this.name = 'BatchProcessingError';
  }
}

export class QueueFullError extends Error {
  constructor() {
    super('Request queue is full');
    this.name = 'QueueFullError';
  }
}

export interface BatchConfig {
  /** Maximum number of requests to batch together */
  maxBatchSize?: number;
  /** Maximum time to wait before processing batch (ms) */
  maxDelay?: number;
  /** Whether to deduplicate identical requests in the batch */
  deduplicate?: boolean;
}

const DEFAULT_BATCH_CONFIG: Required<BatchConfig> = {
  maxBatchSize: 5,
  maxDelay: 50,
  deduplicate: true
};

interface QueuedRequest {
  request: Request;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface DedupeGroup {
  primary: QueuedRequest;
  duplicates: QueuedRequest[];
}

export interface RequestQueueStats {
  totalRequests: number;
  batchCount: number;
  oldestRequest: number;
  failedRequests: number;
  inFlightRequests: number;
}

export class RequestQueue extends TypedEventEmitter<RequestQueueEvents> {
  private queue: QueuedRequest[] = [];
  private processingTimeout?: NodeJS.Timeout;
  private config: Required<BatchConfig>;
  private failedRequests: QueuedRequest[] = [];
  private inFlightCount = 0;
  private isProcessing = false;

  constructor(config?: BatchConfig) {
    super();
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
  }

  async enqueue<T>(request: Request): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queuedAndInFlight = this.queue.length + this.inFlightCount;
      if (queuedAndInFlight >= this.config.maxBatchSize) {
        reject(new QueueFullError());
        return;
      }

      this.queue.push({
        request,
        resolve,
        reject,
        timestamp: Date.now()
      });

      if (this.queue.length >= this.config.maxBatchSize) {
        this.processBatch();
      } else if (!this.processingTimeout) {
        this.processingTimeout = setTimeout(() => {
          this.processBatch();
        }, this.config.maxDelay);
      }
    });
  }

  /**
   * Create batch request payload from a list of requests
   */
  private async createBatchPayload(requests: Request[]): Promise<string> {
    const payloadItems = await Promise.all(requests.map(async (request, index) => {
      const url = request.url;
      // Extract relative path from URL
      const relativePath = url.startsWith('http')
        ? url.slice(new URL(url).origin.length)
        : url;

      const payload: any = {
        id: index + 1,
        url: relativePath,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      };

      // Only include body if present
      if (request.body) {
        const contentType = request.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          const text = await request.clone().text();
          payload.body = JSON.parse(text);
        } else {
          payload.body = await request.clone().text();
        }
      }

      return payload;
    }));

    return JSON.stringify(payloadItems);
  }

  private async splitBatchResponse(response: Response): Promise<any[]> {
    const responseData = await response.json();
    
    if (!responseData || typeof responseData !== 'object' || !('data' in responseData)) {
      throw new BatchProcessingError(
        'Invalid batch response format: missing data property',
        'batch'
      );
    }

    if (!Array.isArray(responseData.data)) {
      throw new BatchProcessingError(
        'Invalid batch response format: data must be an array',
        'batch'
      );
    }

    return responseData.data.map((item: any) => {
      if (item && typeof item === 'object') {
        if ('error' in item) {
          return { error: item.error };
        }

        if ('data' in item) {
          return { data: item.data };
        }
      }

      return { data: item };
    });
  }

  private async processBatch(): Promise<void> {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = undefined;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.config.maxBatchSize);
    this.isProcessing = true;
    this.inFlightCount += batch.length;
    const groups = this.groupBatch(batch);
    const batchId = `batch-${Date.now()}`;
    const startTime = Date.now();

    try {
      // Create batch request payload
      const payload = await this.createBatchPayload(groups.map(group => group.primary.request));

      // Log batch request
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      
      const parsedPayload = JSON.parse(payload);
      const batchLog = apiLogger.logRequest(
        'BATCH',
        'batch',
        headers,
        parsedPayload
      );

      // Execute batch request
      const requestHeaders = new Headers();
      requestHeaders.set('Content-Type', 'application/json');
      requestHeaders.set('X-Batch-Request', 'true');

      const firstUrl = groups[0].primary.request.url;
      const baseUrl = firstUrl.startsWith('http') ? new URL(firstUrl).origin : '';
      const batchUrl = baseUrl ? `${baseUrl}/api/batch` : '/api/batch';

      const response = await fetch(batchUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: payload
      });

      if (!response.ok) {
        throw new Error(`Batch request failed: ${response.status} ${response.statusText}`);
      }

      const results = await this.splitBatchResponse(response);

      // Log batch response
      apiLogger.logResponse(batchLog, response, results, startTime);

      // Process results
      let successCount = 0;
      let errorCount = 0;

      if (results.length !== groups.length) {
        throw new BatchProcessingError(
          `Batch response size mismatch: expected ${groups.length}, received ${results.length}`,
          batchId
        );
      }

      results.forEach((result: any, index: number) => {
        const group = groups[index];
        const queueItems = [group.primary, ...group.duplicates];
        if (result.error) {
          errorCount += queueItems.length;
          queueItems.forEach(item => item.reject(new Error(result.error)));
        } else {
          successCount += queueItems.length;
          queueItems.forEach(item => item.resolve(result.data));
        }
      });

      // Emit metrics
      this.emit('batch-processed', {
        duration: Date.now() - startTime,
        successCount,
        errorCount,
        queueSize: this.queue.length
      });

    } catch (error) {
      // On batch failure, move requests to failed queue
      this.failedRequests.push(...batch);
      const batchError = error instanceof BatchProcessingError
        ? error
        : new BatchProcessingError(
            (error as Error).message || 'Batch processing failed',
            batchId
          );

      batch.forEach(item => {
        item.reject(batchError);
      });

      // Emit metrics
      this.emit('batch-processed', {
        duration: Date.now() - startTime,
        successCount: 0,
        errorCount: batch.length,
        queueSize: this.queue.length
      });
    } finally {
      this.inFlightCount = Math.max(0, this.inFlightCount - batch.length);
      this.isProcessing = false;
      if (this.queue.length > 0 && !this.processingTimeout) {
        this.processingTimeout = setTimeout(() => {
          this.processBatch();
        }, this.config.maxDelay);
      }
    }
  }

  /**
   * Returns queue health and sizing metrics for observability and tests.
   */
  getStats(): RequestQueueStats {
    const oldestRequest = this.queue.length > 0
      ? Math.min(...this.queue.map(item => item.timestamp))
      : 0;

    return {
      totalRequests: this.queue.length,
      batchCount: this.queue.length > 0 ? 1 : 0,
      oldestRequest,
      failedRequests: this.failedRequests.length,
      inFlightRequests: this.inFlightCount
    };
  }

  private groupBatch(batch: QueuedRequest[]): DedupeGroup[] {
    if (!this.config.deduplicate) {
      return batch.map(item => ({ primary: item, duplicates: [] }));
    }

    const groupMap = new Map<string, DedupeGroup>();
    for (const item of batch) {
      const key = `${item.request.method}:${item.request.url}`;
      const existing = groupMap.get(key);
      if (!existing) {
        groupMap.set(key, { primary: item, duplicates: [] });
        continue;
      }

      existing.duplicates.push(item);
    }

    return Array.from(groupMap.values());
  }

  /**
   * Process any remaining requests in the queue
   */
  flush(): void {
    if (this.queue.length > 0) {
      this.processBatch();
    }
  }

  /**
   * Retry failed requests
   */
  retryFailed(): void {
    if (this.failedRequests.length === 0) return;

    const requests = this.failedRequests.splice(0);
    requests.forEach(item => {
      this.enqueue(item.request)
        .then(item.resolve)
        .catch(item.reject);
    });
  }
}
