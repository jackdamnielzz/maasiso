/**
 * API Logger for monitoring and debugging API requests
 */

interface RequestLog {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  timestamp: string;
}

interface ResponseLog extends RequestLog {
  status?: number;
  statusText?: string;
  duration: number;
  data?: any;
}

class ApiLogger {
  private readonly isDebug: boolean;

  constructor() {
    this.isDebug = process.env.NODE_ENV === 'development';
  }

  logRequest(
    method: string,
    url: string,
    headers: Headers | Record<string, string>,
    body?: any
  ): RequestLog {
    const log: RequestLog = {
      method,
      url,
      headers: headers instanceof Headers ? this.headersToObject(headers) : headers,
      body: this.sanitizeBody(body),
      timestamp: new Date().toISOString(),
    };

    if (this.isDebug) {
      console.log('[Request]', log);
    }

    return log;
  }

  logResponse(
    request: RequestLog,
    response: Response,
    data: any,
    startTime: number
  ): ResponseLog {
    const duration = Date.now() - startTime;
    const log: ResponseLog = {
      ...request,
      status: response.status,
      statusText: response.statusText,
      duration,
      data: this.sanitizeBody(data),
    };

    if (this.isDebug) {
      console.log('[Response]', {
        method: log.method,
        url: log.url,
        duration: log.duration,
        status: log.status,
        error: log.status && log.status >= 400 ? log.data : undefined,
      });
    }

    return log;
  }

  logError(request: RequestLog, error: Error): void {
    if (this.isDebug) {
      console.error('[Request]', {
        method: request.method,
        url: request.url,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  private headersToObject(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    // If body is a string, try to parse it as JSON
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }

    // Remove sensitive data
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

export const apiLogger = new ApiLogger();
