interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
}

interface ResponseLog {
  timestamp: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data?: any;
  duration: number;
}

interface ApiLog {
  request: RequestLog;
  response?: ResponseLog;
  error?: {
    message: string;
    stack?: string;
  };
}

class ApiLogger {
  private static maxLogs = 1000;
  private logs: ApiLog[] = [];

  logRequest(method: string, url: string, headers: Headers, body?: any): RequestLog {
    const requestLog: RequestLog = {
      timestamp: new Date().toISOString(),
      method,
      url,
      headers: this.headersToObject(headers),
      body,
    };

    // Start a new log entry
    this.logs.push({ request: requestLog });
    
    // Trim logs if they exceed max size
    if (this.logs.length > ApiLogger.maxLogs) {
      this.logs = this.logs.slice(-ApiLogger.maxLogs);
    }

    return requestLog;
  }

  logResponse(
    requestLog: RequestLog,
    response: Response,
    data: any,
    startTime: number
  ): void {
    const logEntry = this.logs.find(log => log.request === requestLog);
    if (!logEntry) return;

    const responseLog: ResponseLog = {
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      headers: this.headersToObject(response.headers),
      data,
      duration: Date.now() - startTime,
    };

    logEntry.response = responseLog;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`API ${requestLog.method} ${requestLog.url}`);
      console.log('Request:', {
        method: requestLog.method,
        url: requestLog.url,
        headers: requestLog.headers,
        body: requestLog.body,
      });
      console.log('Response:', {
        status: responseLog.status,
        statusText: responseLog.statusText,
        duration: `${responseLog.duration}ms`,
        data: responseLog.data,
      });
      console.groupEnd();
    }
  }

  logError(requestLog: RequestLog, error: Error): void {
    const logEntry = this.logs.find(log => log.request === requestLog);
    if (!logEntry) return;

    logEntry.error = {
      message: error.message,
      stack: error.stack,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error for ${requestLog.method} ${requestLog.url}:`, error);
    }
  }

  getLogs(): ApiLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  private headersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

export const apiLogger = new ApiLogger();
