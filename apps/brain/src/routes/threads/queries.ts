import { ThreadSearchSchemaInput } from '@chad-chat/brain-domain'
import { assistantService, threadService } from '@chad-chat/brain-service'
import { protectedProcedure, router } from '../../lib/trpc'

export const threadsQueries = router({
  searchThreads: protectedProcedure.input(ThreadSearchSchemaInput).query(async ({ ctx, input }) => {
    return threadService.searchThreads(ctx.user.id, input)
  }),

  getSidebarThreads: protectedProcedure.query(async ({ ctx }) => {
    return threadService.getSidebarThreads(ctx.user.id)
  }),

  getAssistants: protectedProcedure.query(async ({ ctx }) => {
    return assistantService.getAssistants(ctx.user.id)
  }),
})
