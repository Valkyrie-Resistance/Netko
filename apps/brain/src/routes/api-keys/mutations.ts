import { CreateApiKeyInputSchema } from '@netko/brain-domain'
import { createApiKey, deleteApiKey, updateApiKey } from '@netko/brain-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const apiKeysMutations = router({
  createApiKey: protectedProcedure
    .input(CreateApiKeyInputSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await createApiKey({
        ...input,
        userId: ctx.user.id,
      })
      return apiKey
    }),

  updateApiKey: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        key: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input
      const apiKey = await updateApiKey(id, ctx.user.id, updates)
      return apiKey
    }),

  deleteApiKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await deleteApiKey(input.id, ctx.user.id)
      return apiKey
    }),
})
