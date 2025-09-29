import { AssistantSchema, LLMModelSchema, type Message } from '@netko/claw-domain'
import { prisma } from '@netko/claw-repository'
import {
  getAssistants,
  getMessagesByThreadId,
  getThread,
  getUserSidebarThreads,
  searchThreads,
} from '@netko/claw-service'
import z from 'zod'
import { protectedProcedure, router } from '../../integrations/trpc/init'

export const threadsQueries = router({
  searchThreads: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return searchThreads(ctx.user.id, input.query)
    }),

  getSidebarThreads: protectedProcedure.query(async ({ ctx }) => {
    return getUserSidebarThreads(ctx.user.id)
  }),

  getAssistants: protectedProcedure.output(z.array(AssistantSchema)).query(async ({ ctx }) => {
    return getAssistants(ctx.user.id)
  }),

  getThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getThread(input.threadId, ctx.user.id)
    }),

  getLLMModels: protectedProcedure.output(z.array(LLMModelSchema)).query(async ({ ctx: _ }) => {
    return prisma.lLMModel.findMany({
      where: {
        isActive: true,
      },
    })
  }),

  getMessages: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }): Promise<Message[]> => {
      const messages = await getMessagesByThreadId(input.threadId, ctx.user.id)
      return messages
    }),
})
