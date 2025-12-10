// Simple structured logging utility
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (this.isDev) {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDev) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  // Audit logging for sensitive operations
  audit(action: string, userId: string, details?: Record<string, unknown>): void {
    this.log('info', `AUDIT: ${action}`, {
      userId,
      audit: true,
      ...details,
    });
  }
}

export const logger = new Logger();
export { Logger };
