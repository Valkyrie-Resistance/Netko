import { prisma } from '@chad-chat/brain-repository'
import { TRPCError, initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { Context } from '../server/context'

const t = initTRPC.context<Context>().create()

export const publicProcedure = t.procedure

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

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user?.role || ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must have admin rights to access this resource',
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

export const router = t.router

// Define the app router with all procedures
export const appRouter = router({
  // Public routes
  userList: publicProcedure.query(async () => {
    const users = await prisma.user.findMany()
    return users
  }),

  // Protected routes
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
      return user
    }),

  // Admin routes
  deleteUser: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const user = await prisma.user.delete({
      where: { id: input.id },
    })
    return user
  }),
})
