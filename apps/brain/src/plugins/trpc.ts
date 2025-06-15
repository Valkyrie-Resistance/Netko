import type { AnyRouter } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import Elysia from 'elysia'
import { createContext } from '../lib/trpc'

export const trpcPlugin = (appRouter: AnyRouter) =>
  new Elysia().all(
    '/api/trpc/*',
    async (opts) => {
      const res = await fetchRequestHandler({
        endpoint: '/api/trpc',
        router: appRouter,
        req: opts.request,
        createContext,
      })
      return res
    },
    {
      parse: 'none',
    },
  )
