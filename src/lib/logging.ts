// Comprehensive logging and monitoring system
import { ApplicationError } from './errors';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  tags?: string[];
}

export interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  avgDuration: number;
  topErrors: Array<{ error: string; count: number }>;
}

class Logger {
  private logs: LogEntry[] = [];
  private metrics: LogMetrics = {
    totalLogs: 0,
    errorCount: 0,
    warnCount: 0,
    avgDuration: 0,
    topErrors: [],
  };
  private maxLogSize: number = 10000;

  private formatLogEntry(entry: LogEntry): string {
    const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
    const durationStr = entry.duration ? ` | ${entry.duration}ms` : '';
    const tagsStr = entry.tags ? ` | [${entry.tags.join(', ')}]` : '';
    
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}${tagsStr} ${entry.message}${contextStr}${durationStr}`;
  }

  private updateMetrics(entry: LogEntry): void {
    this.metrics.totalLogs++;
    
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
      this.metrics.errorCount++;
    }
    
    if (entry.level === LogLevel.WARN) {
      this.metrics.warnCount++;
    }
    
    if (entry.duration) {
      this.metrics.avgDuration = 
        (this.metrics.avgDuration * (this.metrics.totalLogs - 1) + entry.duration) / this.metrics.totalLogs;
    }
    
    // Track top errors
    if (entry.error) {
      const errorKey = entry.error.message;
      const existingError = this.metrics.topErrors.find(e => e.error === errorKey);
      if (existingError) {
        existingError.count++;
      } else {
        this.metrics.topErrors.push({ error: errorKey, count: 1 });
      }
    }
  }

  private writeLog(entry: LogEntry): void {
    // Add to internal storage
    this.logs.push(entry);
    
    // Maintain max size
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }
    
    // Update metrics
    this.updateMetrics(entry);
    
    // Console output with colors
    const formatted = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted, entry.context);
        break;
      case LogLevel.ERROR:
        console.error(formatted, entry.error, entry.context);
        break;
      case LogLevel.FATAL:
        console.error('🚨 FATAL:', formatted, entry.error, entry.context);
        break;
    }
    
    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // Placeholder for external logging service (Datadog, LogRocket, etc.)
    try {
      // await fetch('https://logging-service.com/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  debug(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
      tags,
    });
  }

  info(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
      tags,
    });
  }

  warn(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
      tags,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>, tags?: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      error,
      context,
      tags,
    });
  }

  fatal(message: string, error?: Error, context?: Record<string, any>, tags?: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.FATAL,
      message,
      error,
      context,
      tags,
    });
  }

  // Performance logging
  performance<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>,
    tags?: string[]
  ): Promise<T> {
    const startTime = Date.now();
    
    return fn()
      .then(result => {
        const duration = Date.now() - startTime;
        this.info(`Performance: ${operation} completed`, {
          ...context,
          duration,
          operation,
        }, [...(tags || []), 'performance', 'success']);
        return result;
      })
      .catch(error => {
        const duration = Date.now() - startTime;
        this.error(`Performance: ${operation} failed`, error, {
          ...context,
          duration,
          operation,
        }, [...(tags || []), 'performance', 'error']);
        throw error;
      });
  }

  // API request logging
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Record<string, any>
  ): void {
    const tags = ['api', method.toLowerCase()];
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - ${statusCode}`;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...context, method, url, statusCode },
      duration,
      tags,
    });
  }

  // Database operation logging
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    context?: Record<string, any>
  ): void {
    const tags = ['database', operation];
    const level = success ? LogLevel.DEBUG : LogLevel.ERROR;
    const message = `Database ${operation} on ${table}`;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...context, operation, table, success },
      duration,
      tags,
    });
  }

  // Security event logging
  logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, any>
  ): void {
    const tags = ['security', event.toLowerCase()];
    const level = severity === 'critical' ? LogLevel.FATAL : 
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level,
      message: `Security: ${event}`,
      context,
      tags,
    });
  }

  // Utility methods
  getMetrics(): LogMetrics {
    return { ...this.metrics };
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByTag(tag: string): LogEntry[] {
    return this.logs.filter(log => log.tags?.includes(tag));
  }

  clearLogs(): void {
    this.logs = [];
    this.metrics = {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      avgDuration: 0,
      topErrors: [],
    };
  }

  // Request context helper
  withContext(context: Partial<LogEntry>): Logger {
    const contextLogger = new Logger();
    contextLogger.logs = this.logs;
    contextLogger.metrics = this.metrics;
    
    // Override methods to include context
    const originalWriteLog = contextLogger.writeLog.bind(contextLogger);
    contextLogger.writeLog = (entry: LogEntry) => {
      return originalWriteLog({ ...entry, ...context });
    };
    
    return contextLogger;
  }
}

// Create singleton instance
export const logger = new Logger();

// Request ID middleware
export const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Performance decorator for methods
export function logPerformance(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return logger.performance(operation, () => originalMethod.apply(this, args));
    };
    
    return descriptor;
  };
}

// Error boundary logging helper
export const logErrorBoundary = (error: Error, errorInfo: React.ErrorInfo, componentStack?: string): void => {
  logger.fatal('React Error Boundary caught an error', error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
    timestamp: new Date().toISOString(),
  }, ['error-boundary']);
};