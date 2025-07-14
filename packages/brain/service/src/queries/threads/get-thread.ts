import { ThreadSchema } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'

export async function getThread(threadId: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId, userId },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
  if (!thread) {
    throw new Error('Thread not found')
  }
  return ThreadSchema.parse(thread)
}
