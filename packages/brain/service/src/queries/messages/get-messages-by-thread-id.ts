import { type Message, MessageSchema } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'

export async function getMessagesByThreadId(threadId: string, userId: string): Promise<Message[]> {
  const messages = await prisma.message.findMany({
    where: {
      threadId,
      userId: userId,
    },
  })
  return messages.map((message) => MessageSchema.parse(message))
}
