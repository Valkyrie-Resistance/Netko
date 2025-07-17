import '@netko/ui/styles/globals.css'
import './instrument'
import * as Sentry from '@sentry/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import reactDom from 'react-dom/client'
import { AuthProvider } from '@/providers/auth-provider'
import { queryClient } from './lib/trpc'
import { RouterProviderWithContext } from './providers/router-provider'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

reactDom
  .createRoot(root, {
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
      console.warn('Uncaught error', error, errorInfo.componentStack)
    }),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  })
  .render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProviderWithContext />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
