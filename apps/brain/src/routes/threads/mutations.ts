import {
  ThreadMutations,
} from '@chad-chat/brain-repository'
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
      const thread = await ThreadMutations.createThread({
        title: input.title,
        userId: ctx.user.id,
        assistantId: input.assistantId,
      })

      return { thread }
    }),
})
