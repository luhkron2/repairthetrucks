import React from 'react';
import { NextResponse } from 'next/server';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error', error instanceof Error ? error : new Error(String(error)));

  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        ...(error instanceof ValidationError && error.field ? { field: error.field } : {})
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Unknown error occurred' },
    { status: 500 }
  );
}

// Global error boundary for React components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function ErrorBoundaryWrapper(props: P) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      logger.error('Component Error', error instanceof Error ? error : new Error(String(error)));
      return React.createElement('div', {
        className: 'p-4 border border-red-200 rounded-lg bg-red-50'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-red-800 font-medium'
        }, 'Something went wrong'),
        React.createElement('p', {
          key: 'message',
          className: 'text-red-600 text-sm mt-1'
        }, 'Please refresh the page or contact support if the problem persists.')
      ]);
    }
  };
}