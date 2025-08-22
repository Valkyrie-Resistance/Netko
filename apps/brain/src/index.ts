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
  app.use('*', serveStatic({ root: './public' }))
  app.use('*', serveStatic({ root: './public', path: 'index.html' }))
}

// Enhanced global error handler with better error categorization
app.onError((err, c) => {
  const errorContext = {
    url: c.req.url,
    method: c.req.method,
    userAgent: c.req.header('user-agent'),
    timestamp: new Date().toISOString(),
  }

  console.error('🔴 Server error:', err, errorContext)

  if (brainEnvConfig.app.sentryDsn) {
    Sentry.captureException(err, {
      extra: errorContext,
      tags: {
        component: 'hono-server',
      },
    })
  }

  // Return appropriate error response based on error type
  if (err.name === 'ValidationError') {
    return c.json({ error: 'Invalid request data', details: err.message }, 400)
  }

  if (err.name === 'UnauthorizedError' || err.message?.includes('UNAUTHORIZED')) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  if (err.name === 'NotFoundError') {
    return c.json({ error: 'Resource not found' }, 404)
  }

  // Generic server error for unknown errors
  return c.json(
    {
      error: 'Internal server error',
      ...(brainEnvConfig.app.dev && { details: err.message }),
    },
    500,
  )
})

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('🛑 Initiating graceful shutdown...')

  try {
    // Import the RedisCacheClient for cleanup
    const { RedisCacheClient } = await import('@netko/brain-repository')

    // Close Redis connections
    await RedisCacheClient.disconnect()
    console.log('✅ Redis connections closed')

    // Close database connections if needed
    // await prisma.$disconnect()

    console.log('✅ Graceful shutdown completed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
    process.exit(1)
  }
}

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🔴 Uncaught Exception:', error)
  if (brainEnvConfig.app.sentryDsn) {
    Sentry.captureException(error, {
      tags: { type: 'uncaughtException' },
    })
  }
  gracefulShutdown()
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason)
  if (brainEnvConfig.app.sentryDsn) {
    Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`), {
      tags: { type: 'unhandledRejection' },
    })
  }
})

// Seed Marvin with error handling
seed().catch((error) => {
  console.error('🔴 Seed error:', error)
  if (brainEnvConfig.app.sentryDsn) {
    Sentry.captureException(error, {
      tags: { component: 'seed' },
    })
  }
})

// Health check endpoint with Redis status
app.get('/health', async (c) => {
  try {
    // Import the health monitor and Redis client
    const { healthMonitor } = await import('@netko/logger/src/health-monitor')
    const { RedisCacheClient } = await import('@netko/brain-repository')

    // Register Redis health check if not already registered
    healthMonitor.registerRedisHealthCheck(async () => {
      const healthStatus = RedisCacheClient.getHealthStatus()
      return {
        isHealthy: healthStatus.isHealthy,
        errorCount: healthStatus.errorCount,
        circuitBreakerState: healthStatus.circuitBreakerState,
      }
    })

    // Perform comprehensive health check
    const healthResult = await healthMonitor.performHealthCheck()

    const statusCode =
      healthResult.status === 'healthy' ? 200 : healthResult.status === 'degraded' ? 200 : 503

    return c.json(healthResult, statusCode)
  } catch (error) {
    console.error('🔴 Health check error:', error)
    return c.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      500,
    )
  }
})

// Export the app
export default {
  port: brainEnvConfig.app.port,
  fetch: app.fetch,
  websocket,
}
