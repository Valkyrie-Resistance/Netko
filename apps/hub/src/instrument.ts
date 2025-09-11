import * as Sentry from '@sentry/react'

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [],
    // biome-ignore lint/style/useNamingConvention: Sentry
    _experiments: { enableLogs: true },
    sendDefaultPii: true,
  })
}
