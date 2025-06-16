import { type Thread, ThreadSchema } from '@chad-chat/brain-domain'
import { prisma } from '../client'

export const getThreads = async (userId: string): Promise<Thread[]> => {
  const threads = await prisma.thread.findMany({
    where: {
      userId,
    },
  })

  return threads.map((thread) => ThreadSchema.parse(thread))
}
