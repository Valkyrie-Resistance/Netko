import * as Sentry from '@sentry/react'
import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error?: Error
    errorInfo?: React.ErrorInfo
    resetError: () => void
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          <p className="mt-1 text-sm text-gray-500">
            We apologize for the inconvenience. The error has been reported.
          </p>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <div className="mt-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-100 p-2 text-xs">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-6 flex space-x-3">
        <button
          type="button"
          onClick={resetError}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
)

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('🔴 React Error Boundary caught an error:', error, errorInfo)

    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
      },
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    const { hasError } = this.state
    const { children } = this.props

    // Reset error state when children change (e.g., navigation)
    if (prevState.hasError && !hasError) {
      return
    }

    if (prevState.hasError && hasError && prevProps.children !== children) {
      this.resetError()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetError = () => {
    // Add a small delay to prevent immediate re-rendering causing the same error
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      })
    }, 100)
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback: CustomFallback } = this.props

    if (hasError) {
      const FallbackComponent = CustomFallback || DefaultErrorFallback
      return <FallbackComponent error={error} errorInfo={errorInfo} resetError={this.resetError} />
    }

    return children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Hook for manual error reporting
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, errorInfo?: Record<string, unknown>) => {
    console.error('🔴 Manual error report:', error)

    Sentry.captureException(error, {
      extra: errorInfo,
      tags: {
        manualReport: true,
      },
    })
  }, [])

  return { reportError }
}
