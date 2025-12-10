'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enhanced error logging for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'
    });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // In a real app, you'd send this to your error tracking service
      console.log('Logging error to service:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  resetError = () => {
    const { maxRetries = 3 } = this.props;
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= maxRetries) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorId: undefined,
        retryCount: newRetryCount 
      });
    } else {
      // Max retries reached, redirect to home
      window.location.href = '/';
    }
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-red-900 dark:text-red-100">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>
              {this.state.errorId && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Error ID: {this.state.errorId}
                </p>
              )}
              {this.state.retryCount > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  Retry attempt: {this.state.retryCount} / {this.props.maxRetries || 3}
                </p>
              )}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs text-slate-500 dark:text-slate-400">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap bg-slate-100 dark:bg-slate-800 p-2 rounded">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                {this.state.retryCount < (this.props.maxRetries || 3) ? (
                  <Button
                    onClick={this.resetError}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again ({(this.props.maxRetries || 3) - this.state.retryCount} left)
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="flex-1"
                    variant="destructive"
                  >
                    Go Home (Max retries reached)
                  </Button>
                )}
                <Button
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

