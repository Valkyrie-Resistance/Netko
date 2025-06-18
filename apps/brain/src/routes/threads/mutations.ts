import {
  AssistantQueries,
  LLMModelQueries,
  MessageMutations,
  ThreadMutations,
  ThreadQueries,
} from '@chad-chat/brain-repository'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const threadsMutations = router({
  createThread: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        assistantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User must be authenticated to create threads',
        })
      }

      const assistant =
        (await AssistantQueries.getAssistantById(input.assistantId, ctx.user.id)) ||
        (await AssistantQueries.getPublicAssistantById(input.assistantId))

      if (!assistant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assistant not found or you do not have access to it',
        })
      }

      const thread = await ThreadMutations.createThread({
        title: input.title,
        userId: ctx.user.id,
        assistantId: input.assistantId,
      })

      return { thread }
    }),

  createMessage: protectedProcedure
    .input(
      z.object({
        body: z.string(),
        threadId: z.string(),
        llmModelId: z.string(),
        assistantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User must be authenticated to create messages',
        })
      }

      const thread = await ThreadQueries.getThreadById(input.threadId, ctx.user.id)

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found or you do not have access to it',
        })
      }

      const assistant =
        (await AssistantQueries.getAssistantById(input.assistantId, ctx.user.id)) ||
        (await AssistantQueries.getPublicAssistantById(input.assistantId))

      if (!assistant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assistant not found or you do not have access to it',
        })
      }

      const model = await LLMModelQueries.getModelById(input.llmModelId)

      if (!model) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'LLM model not found',
        })
      }

      const message = await MessageMutations.createMessage({
        threadId: input.threadId,
        content: input.body,
        role: 'USER',
        metadata: {
          assistantId: input.assistantId,
          llmModelId: input.llmModelId,
        },
      })

      const messageWithUser = await MessageMutations.addUserToMessage(message.id, ctx.user.id)
      const messageWithModel = await MessageMutations.addModelToMessage(
        messageWithUser.id,
        input.llmModelId,
      )
      const messageWithAssistant = await MessageMutations.addAssistantToMessage(
        messageWithModel.id,
        input.assistantId,
      )

      return { message: messageWithAssistant }
    }),
})
