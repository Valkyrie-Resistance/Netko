import { prisma } from '@chad-chat/brain-repository'
import { protectedProcedure, publicProcedure, router } from '../../router'

const userQueries = router({
  userList: publicProcedure.query(async () => {
    const users = await prisma.user.findMany()
    return users
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user
  }),
})

export { userQueries }
