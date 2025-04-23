import { monitoringService } from './monitoring/service';

export type RetryErrorType =
  | 'network'    // Network-related errors (timeout, connection issues)
  | 'server'     // Server errors (500, 502, etc.)
  | 'throttle'   // Rate limiting (429)
  | 'timeout'    // Request timeout (408)
  | 'auth'       // Authentication errors (401, 403)
  | 'unknown';   // Other errors

export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableStatuses?: number[];
}

interface RetryState {
  attempt: number;
  error: Error | null;
  errorType: RetryErrorType;
  lastAttemptTime?: number;
  retryHistory?: Array<{
    timestamp: number;
    errorType: RetryErrorType;
    delay: number;
    error: Error | null;
  }>;
}

const defaultConfig: Required<RetryConfig> = {
  maxAttempts: process.env.RETRY_MAX_ATTEMPTS ? parseInt(process.env.RETRY_MAX_ATTEMPTS) : 3,
  initialDelay: process.env.RETRY_INITIAL_DELAY ? parseInt(process.env.RETRY_INITIAL_DELAY) : 1000, // 1 second
  maxDelay: process.env.RETRY_MAX_DELAY ? parseInt(process.env.RETRY_MAX_DELAY) : 10000, // 10 seconds
  backoffFactor: 2,
  retryableStatuses: [401, 408, 429, 500, 502, 503, 504]
};

function calculateDelay(attempt: number, config: Required<RetryConfig>, errorType: RetryErrorType): number {
  let delay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1);

  // Add jitter to avoid thundering herd problem
  const jitter = Math.random() * 0.1 * delay; // up to 10% jitter
  delay += jitter;
  
  // Adjust delay based on error type
  switch (errorType) {
    case 'throttle':
      delay *= 1.5; // Longer delay for rate limiting
      break;
    case 'auth':
      delay *= 0.25; // Very short delay for auth retries
      break;
    case 'server':
      delay *= 0.75; // Shorter delay for server errors
      break;
    case 'timeout':
      delay *= 0.5; // Even shorter delay for timeouts
      break;
  }

  return Math.min(delay, config.maxDelay);
}

function categorizeError(error: Error | Response): RetryErrorType {
  if (error instanceof Response) {
    switch (error.status) {
      case 401:
      case 403:
        return 'auth';
      case 429:
        return 'throttle';
      case 408:
        return 'timeout';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'server';
      default:
        return 'unknown';
    }
  }

  if (error instanceof Error) {
    if (
      error.name === 'TypeError' ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed')
    ) {
      return 'network';
    }
  }

  return 'unknown';
}

function isRetryableError(error: Error): boolean {
  const errorType = categorizeError(error);
  // For auth errors, retry only if token refresh is handled externally
  if (errorType === 'auth') {
    // Consider not retrying auth errors here to avoid unnecessary retries
    // or integrate token refresh logic before retrying
    return false;
  }
  const isRetryableType = ['network', 'server', 'throttle', 'timeout'].includes(errorType);
  const isRetryableMessage = error.message && (
    error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
    error.message.includes('Failed to fetch')
  );
  return isRetryableType || Boolean(isRetryableMessage);
}

function isRetryableStatus(status: number, retryableStatuses: number[]): boolean {
  return retryableStatuses.includes(status);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const fullConfig = { ...defaultConfig, ...config };
  let state: RetryState = { 
    attempt: 1, 
    error: null,
    errorType: 'unknown',
    lastAttemptTime: Date.now()
  };

  while (state.attempt <= fullConfig.maxAttempts) {
    try {
      const result = await operation();
      
      if (state.attempt > 1) {
        monitoringService.trackError(state.error!, {
          context: {
            attempts: state.attempt,
            errorType: state.errorType,
            recoveryTime: Date.now() - (state.lastAttemptTime || 0)
          },
          severity: 'info',
          handled: true
        });
      }

      return result;
    } catch (error) {
      const errorType = categorizeError(error as Error | Response);
      const isRetryable = error instanceof Error && (
        isRetryableError(error) ||
        (error instanceof Response && isRetryableStatus(error.status, fullConfig.retryableStatuses))
      );

      if (!isRetryable || state.attempt === fullConfig.maxAttempts) {
        const finalError = {
          timestamp: new Date().toISOString(),
          error: error instanceof Response ? {
            type: 'ResponseError',
            status: error.status,
            statusText: error.statusText,
            headers: Object.fromEntries(error.headers.entries()),
            url: error.url,
            body: await error.clone().text().catch(() => 'Failed to read response body')
          } : error instanceof Error ? {
            type: 'JavaScriptError',
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').map(line => line.trim())
          } : {
            type: 'UnknownError',
            value: String(error)
          },
          retryInfo: {
            attempts: state.attempt,
            maxAttempts: fullConfig.maxAttempts,
            errorType,
            isRetryable,
            totalDuration: Date.now() - (state.retryHistory?.[0]?.timestamp || Date.now()),
            retryHistory: state.retryHistory || []
          },
          config: {
            initialDelay: fullConfig.initialDelay,
            maxDelay: fullConfig.maxDelay,
            backoffFactor: fullConfig.backoffFactor,
            retryableStatuses: fullConfig.retryableStatuses
          }
        };

        console.group('%cAPI Request Failed After Maximum Retries', 'color: #ff5555; font-weight: bold;');
        console.log('%cTimestamp:', 'font-weight: bold;', finalError.timestamp);
        console.log('%cTotal Duration:', 'font-weight: bold;', `${finalError.retryInfo.totalDuration}ms`);
        
        console.group('%cError Details', 'color: #ff5555;');
        console.dir(finalError.error, { depth: null });
        console.groupEnd();
        
        console.group('%cRetry Information', 'color: #ff79c6;');
        console.table({
          attempts: finalError.retryInfo.attempts,
          maxAttempts: finalError.retryInfo.maxAttempts,
          errorType: finalError.retryInfo.errorType,
          isRetryable: finalError.retryInfo.isRetryable
        });
        console.groupEnd();
        
        if (finalError.retryInfo.retryHistory.length > 0) {
          console.group('%cRetry History', 'color: #8be9fd;');
          console.table(finalError.retryInfo.retryHistory.map(entry => ({
            timestamp: new Date(entry.timestamp).toISOString(),
            errorType: entry.errorType,
            delay: `${entry.delay}ms`
          })));
          console.groupEnd();
        }
        
        console.group('%cConfiguration', 'color: #50fa7b;');
        console.table(finalError.config);
        console.groupEnd();
        
        console.groupEnd();

        monitoringService.trackError(error as Error, {
          context: {
            attempts: state.attempt,
            errorType,
            maxAttemptsReached: state.attempt === fullConfig.maxAttempts,
            retryHistory: state.retryHistory || []
          },
          severity: 'error',
          handled: false
        });
        throw error;
      }

      const delay = calculateDelay(state.attempt, fullConfig, errorType);
      
      const retryInfo = {
        attempt: state.attempt,
        maxAttempts: fullConfig.maxAttempts,
        delay,
        errorType,
        error: error instanceof Response ? {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          type: 'ResponseError'
        } : error instanceof Error ? {
          name: error.name,
          message: error.message,
          type: 'JavaScriptError'
        } : {
          type: 'UnknownError',
          value: String(error)
        },
        history: state.retryHistory || []
      };

      if (process.env.NODE_ENV === 'development') {
        console.group(`%cRetry Attempt ${state.attempt}/${fullConfig.maxAttempts}`, 'color: #ff79c6; font-weight: bold;');
        console.log('%cTimestamp:', 'font-weight: bold;', new Date().toISOString());
        console.log('%cDelay:', 'font-weight: bold;', `${delay}ms`);
        console.log('%cError Type:', 'font-weight: bold;', errorType);
        
        console.group('%cError Details', 'color: #ff5555;');
        console.dir(retryInfo.error, { depth: null });
        console.groupEnd();
        
        if (retryInfo.history.length > 0) {
          console.group('%cRetry History', 'color: #8be9fd;');
          console.table(retryInfo.history.map(entry => ({
            timestamp: new Date(entry.timestamp).toISOString(),
            errorType: entry.errorType,
            delay: `${entry.delay}ms`
          })));
          console.groupEnd();
        }
        
        console.groupEnd();
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      const timestamp = Date.now();
      state = {
        ...state,
        attempt: state.attempt + 1,
        error: error as Error,
        errorType,
        lastAttemptTime: timestamp,
        retryHistory: [
          ...(state.retryHistory || []),
          {
            timestamp,
            errorType,
            delay,
            error: error as Error
          }
        ]
      };

      if (process.env.NODE_ENV === 'development') {
        console.group(`[Retry Attempt ${state.attempt}/${fullConfig.maxAttempts}]`);
        console.log('Error:', {
          type: errorType,
          status: error instanceof Response ? error.status : undefined,
          message: error instanceof Error ? error.message : undefined
        });
        console.log('Delay:', `${delay}ms`);
        console.log('History:', state.retryHistory);
        console.groupEnd();
      }
    }
  }

  throw state.error || new Error('Max retry attempts reached');
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  const fullConfig = { ...defaultConfig, ...retryConfig };

  return withRetry(async () => {
    const response = await fetch(url, {
      ...options,
      mode: 'cors'
    });
    
    if (!response.ok && isRetryableStatus(response.status, fullConfig.retryableStatuses)) {
      console.group('API Request Failed');
      console.error('Request Details:', {
        url,
        method: options?.method || 'GET',
        headers: options?.headers ? Object.fromEntries(Object.entries(options.headers)) : {},
        mode: options?.mode,
        credentials: options?.credentials
      });
      console.error('Response Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.clone().text().catch(() => 'Failed to read response body')
      });
      console.groupEnd();
      throw response;
    }

    return response;
  }, fullConfig);
}
