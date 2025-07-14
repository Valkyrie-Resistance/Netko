import { ThreadSchema } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'

export async function getUserSidebarThreads(userId: string) {
  const threads = await prisma.thread.findMany({
    where: {
      userId,
    },
    include: {
      assistant: true,
    },
    orderBy: {
      createdAt: 'desc', // Newest threads first
    },
  })
  return threads.map((thread) => ThreadSchema.parse(thread))
}
