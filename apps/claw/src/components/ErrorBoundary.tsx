import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<unknown>,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In the future, send this to an error reporting service
    // eslint-disable-next-line no-console
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleCopy = async () => {
    const details = [this.state.error?.toString() ?? '', this.state.errorInfo?.componentStack ?? '']
      .filter(Boolean)
      .join('\n')

    try {
      await navigator.clipboard.writeText(details)
    } catch {
      // ignore clipboard errors
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-lg w-full rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. You can try again or reload the app.
              </p>
            </div>

            {import.meta.env.DEV && (
              <pre className="text-xs whitespace-pre-wrap rounded-md bg-muted p-3 border border-border/50 overflow-auto max-h-64">
                {this.state.error?.message}
                {'\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-3 py-2 rounded-md border border-border bg-background hover:bg-accent transition"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-3 py-2 rounded-md border border-destructive bg-destructive text-destructive-foreground hover:opacity-90 transition"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={this.handleCopy}
                className="ml-auto px-3 py-2 rounded-md border border-border bg-background hover:bg-accent transition"
              >
                Copy error
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children as React.ReactNode
  }
}
