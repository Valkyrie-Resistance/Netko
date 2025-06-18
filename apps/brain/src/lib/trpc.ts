import type { Context } from '@chad-chat/brain-domain'
import { auth } from '@chad-chat/brain-service'
import { initTRPC, TRPCError } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { CreateBunHonoWSSContextFnOptions } from '@valkyrie-resistance/trpc-ws-hono-bun-adapter'
import type { AppRouter } from '../routes'

export const t = initTRPC.context<Context>().create()

//* Router
export const router = t.router
export const mergeRouters = t.mergeRouters

//* Context
export const createContext = async ({ req }: FetchCreateContextFnOptions): Promise<Context> => {
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

// create ws context
export const createWsContext = async (
  _opt: CreateBunHonoWSSContextFnOptions<AppRouter>,
): Promise<Context> => {
  return {
    user: null,
    session: null,
  }
}

//* Procedures
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ next, ctx }) => {
  const { user, session } = ctx
  if (!session || !user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user, session } })
})
