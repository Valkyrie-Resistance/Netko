import { ModelProviderEnum } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'
import { createLLMModel, deleteLLMModel, updateLLMModel } from '@netko/brain-service'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const modelsMutations = router({
  createModel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        displayName: z.string().min(1),
        provider: z.nativeEnum(ModelProviderEnum),
        description: z.string().nullish(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return createLLMModel({
        name: input.name,
        displayName: input.displayName,
        provider: input.provider,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
        // All new models are private by default
        isPublic: false,
        // Author is the current user
        author: ctx.user.id,
      })
    }),

  updateModel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        displayName: z.string().optional(),
        provider: z.nativeEnum(ModelProviderEnum).optional(),
        description: z.string().nullish(),
        isActive: z.boolean().optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input
      const existing = await prisma.lLMModel.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Model not found' })
      }
      if (existing.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only update your own models' })
      }
      return updateLLMModel(id, updates)
    }),

  deleteModel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existing = await prisma.lLMModel.findUnique({ where: { id: input.id } })
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Model not found' })
        }
        if (existing.authorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own models' })
        }
        return await deleteLLMModel(input.id)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete model'
        if (message.toLowerCase().includes('public')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete a public model' })
        }
        throw new TRPCError({ code: 'BAD_REQUEST', message })
      }
    }),
})
