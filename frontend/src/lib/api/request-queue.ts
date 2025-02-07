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

export class RequestQueue extends TypedEventEmitter<RequestQueueEvents> {
  private queue: QueuedRequest[] = [];
  private processingTimeout?: NodeJS.Timeout;
  private config: Required<BatchConfig>;
  private failedRequests: QueuedRequest[] = [];

  constructor(config?: BatchConfig) {
    super();
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
  }

  async enqueue<T>(request: Request): Promise<T> {
    return new Promise<T>((resolve, reject) => {
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
    
    if (!responseData.data) {
      throw new BatchProcessingError(
        'Invalid response format: missing data property',
        'batch'
      );
    }

    if (!Array.isArray(responseData.data)) {
      throw new BatchProcessingError(
        'Invalid response format: data must be an array',
        'batch'
      );
    }

    return responseData.data.map((item: any) => ({
      data: item
    }));
  }

  private async processBatch(): Promise<void> {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = undefined;
    }

    if (this.queue.length === 0) return;

    let batch = this.queue.splice(0, this.config.maxBatchSize);

    // Deduplicate requests if enabled
    if (this.config.deduplicate) {
      const seen = new Set<string>();
      batch = batch.filter(item => {
        const key = `${item.request.method}:${item.request.url}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    const startTime = Date.now();

    try {
      // Create batch request payload
      const payload = await this.createBatchPayload(batch.map(item => item.request));

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

      const response = await fetch(batch[0].request.url, {
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

      results.forEach((result: any, index: number) => {
        const queueItem = batch[index];
        if (result.error) {
          errorCount++;
          queueItem.reject(new Error(result.error));
        } else {
          successCount++;
          queueItem.resolve(result.data);
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
      batch.forEach(item => {
        item.reject(error as Error);
      });

      // Emit metrics
      this.emit('batch-processed', {
        duration: Date.now() - startTime,
        successCount: 0,
        errorCount: batch.length,
        queueSize: this.queue.length
      });
    }
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
