import './instrument'
import { sentry } from '@hono/sentry'
import { trpcServer } from '@hono/trpc-server'
import { brainEnvConfig } from '@netko/brain-config'
import { auth, seed } from '@netko/brain-service'
import * as Sentry from '@sentry/bun'
import { createBunHonoWSHandler } from '@valkyrie-resistance/trpc-ws-hono-bun-adapter'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { createContext, createWsContext } from './lib/trpc'
import { appRouter } from './routes'

//* App
const app = new Hono()

// Logger middleware
app.use(logger())

// Health check
app.get('/up', async (c) => {
  return c.newResponse('🟢 UP', { status: 200 })
})

// Websocket
const { websocket, wsRouter } = createBunHonoWSHandler({
  router: appRouter,
  createContext: createWsContext,
  onError: (err) => {
    if (brainEnvConfig.app.sentryDsn) {
      Sentry.captureException(err)
    }
  },
})

app.route('/ws', wsRouter)

// CORS middleware
app.use(
  '*',
  cors({
    origin: brainEnvConfig.app.cors,
    credentials: true,
    maxAge: 86400, // Cache preflight for 1 day
  }),
)

// Auth middleware
app.all('/auth/api/*', async (c) => {
  return await auth.handler(c.req.raw)
})

// TRPC middleware
app.use(
  '/api/trpc/*',
  trpcServer({
    router: appRouter,
    endpoint: '/api/trpc',
    createContext,
    onError: (err) => {
      if (brainEnvConfig.app.sentryDsn) {
        Sentry.captureException(err)
      }
    },
  }),
)

// Sentry middleware
if (brainEnvConfig.app.sentryDsn) {
  app.use('*', sentry({ dsn: brainEnvConfig.app.sentryDsn }))
}

// Serve static files
if (!brainEnvConfig.app.dev) {
  app.use('*', serveStatic({ root: './public', }))
  app.use('*', serveStatic({ root: './public', path: 'index.html' }))
}

// Global error handler
app.onError((err, c) => {
  if (brainEnvConfig.app.sentryDsn) {
    Sentry.captureException(err)
  }
  return c.json({ error: 'Internal server error' }, 500)
})

// Seed Marvin
seed().catch(console.error)

// Export the app
export default {
  port: brainEnvConfig.app.port,
  fetch: app.fetch,
  websocket,
}
