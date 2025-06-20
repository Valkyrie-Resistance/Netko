import { AssistantSchema, LLMModelSchema, ThreadSearchSchemaInput } from '@netko/brain-domain'
import { MessageMutations, prisma, ThreadQueries } from '@netko/brain-repository'
import { assistantService, threadService } from '@netko/brain-service'
import z from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const threadsQueries = router({
  searchThreads: protectedProcedure.input(ThreadSearchSchemaInput).query(async ({ ctx, input }) => {
    return threadService.searchThreads(ctx.user.id, input)
  }),

  getSidebarThreads: protectedProcedure.query(async ({ ctx }) => {
    return threadService.getSidebarThreads(ctx.user.id)
  }),

  getAssistants: protectedProcedure.output(z.array(AssistantSchema)).query(async ({ ctx }) => {
    return assistantService.getAssistants(ctx.user.id)
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
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User must be authenticated')
      }

      // Get messages for the thread
      const messages = await MessageMutations.getMessagesByThreadId(input.threadId)

      // TODO: Add authorization check to ensure user owns the thread
      return messages
    }),

  getThreadWithMessages: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        userId: z.string(),
        limit: z.number().default(50),
        cursor: z
          .object({
            createdAt: z.string(),
            id: z.string(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User must be authenticated')
      }

      // Get thread with messages using the existing repository function
      const result = await ThreadQueries.getThreadWithMessages({
        threadId: input.threadId,
        userId: ctx.user.id,
        limit: input.limit,
        cursor: input.cursor
          ? {
              ...input.cursor,
              createdAt: new Date(input.cursor.createdAt),
            }
          : undefined,
      })

      return result
    }),
})
