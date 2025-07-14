import { getUserApiKeys } from '@netko/brain-service'
import { protectedProcedure, router } from '../../lib/trpc'

export const apiKeysQueries = router({
  getApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    return getUserApiKeys(user.id)
  }),
})
