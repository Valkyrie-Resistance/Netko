import { sleep } from 'bun'
import { z } from 'zod'
import { publicProcedure, router } from '../../lib/trpc'

export const threadsSubscriptions = router({
  onThreadUpdate: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .subscription(async function* ({ input: _ }) {
      await sleep(1000)
      yield Math.random()
    }),
})
