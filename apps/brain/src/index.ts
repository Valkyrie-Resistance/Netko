import { auth, brainEnvConfig } from '@chad-chat/brain-service'
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

if (process.env.NODE_ENV === 'production') {
  app.use('*', serveStatic({ root: './public' }))
  app.use('*', serveStatic({ root: './public', path: 'index.html' }))
}

export default {
  port: brainEnvConfig.app.port,
  fetch: app.fetch,
}
