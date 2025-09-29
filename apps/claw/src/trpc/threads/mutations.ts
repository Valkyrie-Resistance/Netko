import { createMessage, createThread, genLLMMessage } from '@netko/claw-service'
import z from 'zod'
import { protectedProcedure, router } from '../../integrations/trpc/init'

export const threadsMutations = router({
  createThread: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        assistantId: z.string(),
        llmModel: z.string(),
        content: z.string(),
        isWebSearchEnabled: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await createThread(
        ctx.user.id,
        input.assistantId,
        input.title,
        input.llmModel, // Pass as currentModelId
      )

      // Generate LLM response for the initial message
      const messages = await genLLMMessage(
        thread.id,
        ctx.user.id,
        input.content,
        input.llmModel,
        input.assistantId,
        input.isWebSearchEnabled,
      )

      return {
        thread,
        userMessage: messages.userMessage,
        assistantMessage: messages.assistantMessage,
      }
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        content: z.string(),
        assistantId: z.string(),
        llmModel: z.string(),
        isWebSearchEnabled: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate LLM response for the message
      const messages = await genLLMMessage(
        input.threadId,
        ctx.user.id,
        input.content,
        input.llmModel,
        input.assistantId,
        input.isWebSearchEnabled,
      )

      return {
        userMessage: messages.userMessage,
        assistantMessage: messages.assistantMessage,
      }
    }),

  createMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        content: z.string(),
        role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await createMessage(input.threadId, input.content, input.role, ctx.user.id)

      return { message }
    }),
})
