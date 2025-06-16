import { auth, brainEnvConfig } from '@chad-chat/brain-service'
import { sentry } from '@hono/sentry'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { appRouter } from './routes'
const app = new Hono()

// Logger middleware
app.use(logger())

app.use(
  '*',
  cors({
    origin: brainEnvConfig.app.cors,
    credentials: true,
    maxAge: 86400, // Cache preflight for 1 day
  }),
)

app.all('/auth/api/*', async (c) => {
  return await auth.handler(c.req.raw)
})

app.use(
  '/api/trpc/*',
  trpcServer({
    router: appRouter,
    endpoint: '/api/trpc',
  }),
)

if (brainEnvConfig.app.sentryDsn) {
  app.use('*', sentry({ dsn: brainEnvConfig.app.sentryDsn }))
}

if (!brainEnvConfig.app.dev) {
  app.use('*', serveStatic({ root: './public' }))
  app.use('*', serveStatic({ root: './public', path: 'index.html' }))
}

export default {
  port: brainEnvConfig.app.port,
  fetch: app.fetch,
}
