import { brainEnvConfig } from '@netko/brain-config'
import * as Sentry from '@sentry/bun'

if (brainEnvConfig.app.sentryDsn) {
  Sentry.init({
    dsn: brainEnvConfig.app.sentryDsn,
    sendDefaultPii: true,
    environment: brainEnvConfig.app.dev ? 'development' : 'production',
    integrations: [Sentry.consoleLoggingIntegration({ levels: ['log', 'error', 'warn', 'info'] })],
    // biome-ignore lint/style/useNamingConvention: Sentry
    _experiments: { enableLogs: true },
  })
}
