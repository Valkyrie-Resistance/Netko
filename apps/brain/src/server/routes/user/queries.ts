import { prisma } from '@chad-chat/brain-repository'
import { protectedProcedure, router } from '../../router'

const userQueries = router({
  userList: protectedProcedure.query(async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return users
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }),
})

export { userQueries }
