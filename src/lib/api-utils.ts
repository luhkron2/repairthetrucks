// Optimized API response wrapper and utilities
import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId } from './logging';
import { ApplicationError, ErrorCode, ErrorSeverity } from './errors';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    requestId: string;
    timestamp: string;
    version: string;
  };
}

export class ApiResponseBuilder {
  private response: Partial<ApiResponse> = {
    success: true,
    meta: {
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  static error(error: ApplicationError | Error): ApiResponse {
    const isAppError = error instanceof ApplicationError;
    
    return {
      success: false,
      error: {
        code: isAppError ? error.code : 'INTERNAL_SERVER_ERROR',
        message: isAppError ? error.userMessage : 'An unexpected error occurred',
        details: isAppError && process.env.NODE_ENV === 'development' ? error.context : undefined,
      },
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  static validationError(message: string, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details,
      },
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }
}

// Enhanced API route handler with logging and error handling
export function apiHandler<T>(
  handler: (req: NextRequest, context?: any) => Promise<ApiResponse<T>>,
  options: {
    requireAuth?: boolean;
    rateLimit?: {
      maxRequests: number;
      windowMs: number;
    };
    cache?: {
      ttl: number;
    };
  } = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse<ApiResponse<T>>> => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    logger.info('API request started', {
      method: req.method,
      url: req.url,
      requestId,
    }, ['api', 'request']);

    try {
      // Rate limiting
      if (options.rateLimit) {
        // Implement rate limiting logic here
      }

      // Execute handler
      const result = await handler(req, context);
      const duration = Date.now() - startTime;

      logger.logRequest(
        req.method,
        req.url,
        result.success ? 200 : 500,
        duration,
        { requestId }
      );

      return NextResponse.json(result, {
        status: result.success ? 200 : 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': `${duration}ms`,
        },
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API request failed', error as Error, {
        method: req.method,
        url: req.url,
        requestId,
        duration,
      }, ['api', 'error']);

      const errorResponse = error instanceof ApplicationError 
        ? ApiResponseBuilder.error(error)
        : ApiResponseBuilder.error(error as Error);

      return NextResponse.json(errorResponse, {
        status: error instanceof ApplicationError && error.code === 'VALIDATION_ERROR' ? 400 : 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': `${duration}ms`,
        },
      });
    }
  };
}

// Query parameter utilities
export class QueryParser {
  static parsePagination(req: NextRequest, defaultLimit: number = 50, maxLimit: number = 100) {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(url.searchParams.get('limit') || defaultLimit.toString()))
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  static parseSort(req: NextRequest, allowedFields: string[]) {
    const url = new URL(req.url);
    const sortBy = url.searchParams.get('sortBy');
    const order = url.searchParams.get('order') || 'asc';

    if (sortBy && !allowedFields.includes(sortBy)) {
      return { sortBy: 'createdAt', order: 'desc' };
    }

    return {
      sortBy: sortBy || 'createdAt',
      order: order === 'desc' ? 'desc' : 'asc',
    };
  }

  static parseFilters(req: NextRequest, allowedFilters: string[]) {
    const url = new URL(req.url);
    const filters: Record<string, any> = {};

    for (const filter of allowedFilters) {
      const value = url.searchParams.get(filter);
      if (value !== null) {
        filters[filter] = value;
      }
    }

    return filters;
  }

  static parseSearch(req: NextRequest) {
    const url = new URL(req.url);
    return url.searchParams.get('search') || '';
  }

  static parseDateRange(req: NextRequest, field: string = 'date') {
    const url = new URL(req.url);
    const fromDate = url.searchParams.get(`${field}From`);
    const toDate = url.searchParams.get(`${field}To`);

    return {
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    };
  }
}

// Response caching utilities
export class ResponseCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  get(key: string): any | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;

    if (cached.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.data;
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Streamlined error responses
export const errorResponses = {
  badRequest: (message: string = 'Bad request') => NextResponse.json(
    ApiResponseBuilder.validationError(message),
    { status: 400 }
  ),

  unauthorized: (message: string = 'Unauthorized') => NextResponse.json(
    ApiResponseBuilder.error(new ApplicationError(ErrorCode.AUTHENTICATION_ERROR, message, ErrorSeverity.MEDIUM, { userMessage: message })),
    { status: 401 }
  ),

  forbidden: (message: string = 'Forbidden') => NextResponse.json(
    ApiResponseBuilder.error(new ApplicationError(ErrorCode.AUTHORIZATION_ERROR, message, ErrorSeverity.MEDIUM, { userMessage: message })),
    { status: 403 }
  ),

  notFound: (message: string = 'Resource not found') => NextResponse.json(
    ApiResponseBuilder.error(new ApplicationError(ErrorCode.INTERNAL_SERVER_ERROR, message, ErrorSeverity.LOW, { userMessage: message })),
    { status: 404 }
  ),

  conflict: (message: string = 'Resource already exists') => NextResponse.json(
    ApiResponseBuilder.error(new ApplicationError(ErrorCode.VALIDATION_ERROR, message, ErrorSeverity.MEDIUM, { userMessage: message })),
    { status: 409 }
  ),

  rateLimited: (message: string = 'Too many requests') => NextResponse.json(
    ApiResponseBuilder.error(new ApplicationError(ErrorCode.RATE_LIMIT_ERROR, message, ErrorSeverity.MEDIUM, { userMessage: message })),
    { status: 429 }
  ),

  serverError: (message: string = 'Internal server error') => NextResponse.json(
    ApiResponseBuilder.error(new ApplicationError(ErrorCode.INTERNAL_SERVER_ERROR, message, ErrorSeverity.HIGH, { userMessage: 'An unexpected error occurred. Please try again.' })),
    { status: 500 }
  ),
};

// Request validation helper
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: {
    parse: (data: any) => T;
  }
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    throw error;
  }
}