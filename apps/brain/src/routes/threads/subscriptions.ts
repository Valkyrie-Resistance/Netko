import { callLLM } from '@netko/brain-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const threadsSubscriptions = router({
  callLLM: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        userMessage: z.string(),
        assistantId: z.string(),
        modelId: z.string(),
      }),
    )
    .subscription(async function* ({ input }) {
      const { threadId, userMessage, assistantId, modelId } = input

      const stream = await callLLM(threadId, userMessage, assistantId, modelId)

      // biome-ignore lint/suspicious/noExplicitAny: stream is a stream of chunks
      for await (const chunk of stream as any) {
        yield chunk
      }
    }),
})
