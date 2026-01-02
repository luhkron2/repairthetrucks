// Enhanced error handling with structured logging and recovery
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  context?: Record<string, any>;
  stack?: string;
  retryable: boolean;
  userMessage: string;
}

export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly context?: Record<string, any>;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      requestId?: string;
      userId?: string;
      context?: Record<string, any>;
      retryable?: boolean;
      userMessage?: string;
    } = {}
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.severity = severity;
    this.timestamp = new Date();
    this.requestId = options.requestId;
    this.userId = options.userId;
    this.context = options.context;
    this.retryable = options.retryable ?? false;
    this.userMessage = options.userMessage || 'An unexpected error occurred. Please try again.';
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ApplicationError);
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId,
      context: this.context,
      stack: this.stack,
      retryable: this.retryable,
      userMessage: this.userMessage,
    };
  }
}

// Error factory functions
export const createValidationError = (message: string, context?: Record<string, any>) =>
  new ApplicationError(
    ErrorCode.VALIDATION_ERROR,
    message,
    ErrorSeverity.LOW,
    { context, userMessage: message, retryable: false }
  );

export const createAuthError = (message: string = 'Authentication failed') =>
  new ApplicationError(
    ErrorCode.AUTHENTICATION_ERROR,
    message,
    ErrorSeverity.HIGH,
    { userMessage: 'Invalid credentials. Please check your access code and try again.', retryable: false }
  );

export const createDatabaseError = (originalError: Error, context?: Record<string, any>) =>
  new ApplicationError(
    ErrorCode.DATABASE_ERROR,
    'Database operation failed',
    ErrorSeverity.HIGH,
    { 
      context: { ...context, originalError: originalError.message }, 
      userMessage: 'System temporarily unavailable. Please try again in a few moments.',
      retryable: true 
    }
  );

export const createRateLimitError = () =>
  new ApplicationError(
    ErrorCode.RATE_LIMIT_ERROR,
    'Rate limit exceeded',
    ErrorSeverity.MEDIUM,
    { userMessage: 'Too many requests. Please wait a moment before trying again.', retryable: false }
  );

// Error boundary for async operations
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: ApplicationError) => T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApplicationError) {
      if (errorHandler) {
        return errorHandler(error);
      }
      throw error;
    }
    
    // Convert unknown errors to ApplicationError
    const appError = new ApplicationError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Unknown error occurred',
      ErrorSeverity.HIGH,
      { 
        context: { originalError: error instanceof Error ? error.stack : String(error) },
        userMessage: 'An unexpected error occurred. Please try again.',
        retryable: true
      }
    );
    
    if (errorHandler) {
      return errorHandler(appError);
    }
    throw appError;
  }
};