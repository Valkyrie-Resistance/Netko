import { type Message, type MessageRole, MessageSchema } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'

export async function createMessage(
  threadId: string,
  content: string,
  role: MessageRole,
  userId: string,
): Promise<Message> {
  const message = await prisma.message.create({
    data: {
      threadId,
      content,
      role,
      userId,
    },
  })
  return MessageSchema.parse(message)
}
