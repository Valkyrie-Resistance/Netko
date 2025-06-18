import Elysia from 'elysia'
import type { LoggerOptions } from 'pino'
import { Logger } from '../logger'

export const elysiaLogger = (options?: LoggerOptions) => {
  const environment = process.env.NODE_ENV || 'development'
  const logger = Logger.initialize(environment, options)

  const app = new Elysia({
    name: 'logger',
    seed: options,
  })

  app
    .onStart((ctx) => {
      logger.info(`Server initialized on port ${ctx.server?.port}`)
      logger.info(`Environment: ${environment}`)
      logger.info(`Server url: ${ctx.server?.url}`)
    })
    .onRequest((ctx) => {
      logger.info('Incoming request:', {
        request: {
          method: ctx.request.method,
          url: ctx.request.url,
          headers: Object.fromEntries(ctx.request.headers.entries()),
        },
      })
    })
    .onAfterResponse((ctx) => {
      logger.info('Response sent:', {
        response: {
          status: ctx.set.status,
          headers: ctx.set.headers,
          response: ctx.response,
        },
      })
    })
    .onError((ctx) => {
      let errorMessage: string | undefined
      let errorStack: string | undefined
      if (ctx.error instanceof Error) {
        errorMessage = ctx.error.message
        errorStack = ctx.error.stack
      } else if (typeof ctx.error === 'string') {
        errorMessage = ctx.error
      } else {
        errorMessage = String(ctx.error)
      }
      logger.error('Request error:', {
        request: {
          method: ctx.request?.method,
          url: ctx.request?.url,
          code: ctx.code,
        },
        error: {
          message: errorMessage,
          stack: errorStack,
        },
      })
    })

  return app
}
