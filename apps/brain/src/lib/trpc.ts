import { type Context, UserAuthSchema } from '@netko/brain-domain'
import { auth, validateToken } from '@netko/brain-service'
import { initTRPC, TRPCError } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { CreateBunHonoWSSContextFnOptions } from '@valkyrie-resistance/trpc-ws-hono-bun-adapter'
import superjson from 'superjson'
import type { AppRouter } from '../routes'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

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
  opt: CreateBunHonoWSSContextFnOptions<AppRouter>,
): Promise<Context> => {
  const jwt = opt.info.connectionParams?.token

  if (jwt) {
    try {
      const decoded = await validateToken(jwt)

      if (!decoded) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      if (!decoded.exp || !decoded.iat) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      // JWT epoch to date
      const expiresAt = new Date(decoded.exp * 1000)
      const createdAt = new Date(decoded.iat * 1000)
      const updatedAt = new Date(decoded.iat * 1000)

      return {
        user: UserAuthSchema.parse(decoded),
        session: {
          id: decoded.jti ?? '',
          expiresAt,
          token: jwt,
          createdAt,
          updatedAt,
        },
      }
    } catch (error) {
      console.error('Error validating token', error)
      return {
        user: null,
        session: null,
      }
    }
  }

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
