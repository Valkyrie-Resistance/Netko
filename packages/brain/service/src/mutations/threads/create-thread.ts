import { type Thread, ThreadSchema } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'

export async function createThread(
  userId: string,
  assistantId: string,
  title: string,
  currentModelId?: string,
): Promise<Thread> {
  const thread = await prisma.thread.create({
    data: {
      userId,
      assistantId,
      title,
      currentModelId,
    },
  })
  return ThreadSchema.parse(thread)
}
