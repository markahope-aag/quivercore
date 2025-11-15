'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * React Error Boundary component to catch and handle React component errors
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to our logging system
    logger.error('React Error Boundary caught an error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      componentStack: errorInfo.componentStack,
    })

    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-4 space-y-4">
              <p>
                An unexpected error occurred. This has been logged and we'll look into it.
              </p>
              {this.state.error && (
                <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" size="sm">
                  Reload Page
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-gray-100 p-3 text-xs dark:bg-gray-800">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to manually trigger error boundary (for testing)
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    throw error // This will be caught by the nearest ErrorBoundary
  }
}

