import z from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const threadsMutations = router({
  createThread: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return {
        thread: {
          id: '1',
          title: input.title,
          description: input.description,
        },
      }
    }),
})
