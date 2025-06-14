import { TRPCError, initTRPC } from '@trpc/server'
import type { Context } from './context'
import { userMutations } from './routes/user/mutations'
import { userQueries } from './routes/user/queries'

const t = initTRPC.context<Context>().create()

export const publicProcedure = t.procedure
export const router = t.router

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: {
        user: ctx.session.user,
      },
    },
  })
})

export const appRouter = router({
  user: router({
    // TODO: fix the spread of the queries and mutations to append
    // them directly to user instead of having to go through queries and mutations
    queries: userQueries,
    mutations: userMutations,
  }),
})

export type AppRouter = typeof appRouter
