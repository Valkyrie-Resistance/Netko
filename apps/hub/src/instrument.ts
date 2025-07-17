import * as Sentry from '@sentry/react'

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    integrations: [],

    // Enable logs to be sent to Sentry
    // biome-ignore lint/style/useNamingConvention: Sentry
    _experiments: { enableLogs: true },
  })
}
