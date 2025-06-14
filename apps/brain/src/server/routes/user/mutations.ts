import { prisma } from '@chad-chat/brain-repository'
import { z } from 'zod'
import { protectedProcedure, router } from '../../router'

const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
})

const userMutations = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: { id: true, name: true, email: true, image: true },
      })
    }),
})

export { userMutations }
