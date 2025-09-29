import { brainEnvConfig } from '@netko/claw-config'
import { protectedProcedure, publicProcedure, router } from '../../integrations/trpc/init'

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
