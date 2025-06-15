import type { Context } from '@chad-chat/brain-domain'
import { auth } from '@chad-chat/brain-service'
import { TRPCError, initTRPC } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export const t = initTRPC.context<Context>().create()

//* Router
export const router = t.router
export const mergeRouters = t.mergeRouters

//* Context
export const createContext = async ({ req }: FetchCreateContextFnOptions): Promise<Context> => {
  const token = req.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    return {
      user: null,
      session: null,
    }
  }

  const authResponse = await auth.api.getSession({
    headers: req.headers,
  })

  if (!authResponse?.session && !authResponse?.user) {
    return {
      user: null,
      session: null,
    }
  }

  return {
    user: authResponse.user,
    session: authResponse.session,
  }
}

//* Procedures
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ next, ctx }) => {
  const { user, session } = ctx
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user, session } })
})
