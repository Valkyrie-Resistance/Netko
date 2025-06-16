import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import { publicProcedure, router } from '../../lib/trpc'

export const threadsSubscriptions = router({
  onThreadUpdate: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      return observable<{ threadId: string; type: 'update' | 'delete' }>((emit) => {
        const onUpdate = (data: { threadId: string; type: 'update' | 'delete' }) => {
          if (data.threadId === input.threadId) {
            emit.next(data)
          }
        }

        // TODO: Subscribe to the event emitter here (ask)

        return () => {
          // TODO: Unsubscribe from the event emitter here (ask)
        }
      })
    }),
})
