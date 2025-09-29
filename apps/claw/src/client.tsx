import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'

hydrateRoot(
  document,
  <StrictMode>
    <ErrorBoundary>
      <StartClient />
    </ErrorBoundary>
  </StrictMode>,
)
