import { getUserApiKeys } from '@netko/claw-service'
import { protectedProcedure, router } from '../../integrations/trpc/init'

export const apiKeysQueries = router({
  getApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    return getUserApiKeys(user.id)
  }),
})
