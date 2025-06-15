import { protectedProcedure, router } from '../../lib/trpc'

export const threadsQueries = router({
  getThreads: protectedProcedure.query(async ({ ctx }) => {
    return {
      threads: [
        {
          id: '1',
          title: 'Thread 1',
          description: 'Thread 1 description',
        },
      ],
    }
  }),
})
