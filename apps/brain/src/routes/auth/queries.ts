import { brainEnvConfig } from '@netko/brain-service'
import { protectedProcedure, publicProcedure, router } from '../../lib/trpc'

export const authQueries = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user
  }),
  getEnabledAuthMethods: publicProcedure.query(async (_) => {
    return Object.entries(brainEnvConfig.auth.socialProviders)
      .filter(([_, value]) => value?.enabled)
      .map(([key]) => key)
  }),
})
