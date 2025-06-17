import { type Message, MessageSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { thread: true }
}>

export async function getAllMessages(
  threadId: string,
  limit: number,
  cursor?: string,
): Promise<{
  messages: Message[]
  nextCursor: string | null
}> {
  const messages = await prisma.message.findMany({
    where: {
      threadId,
    },
    include: {
      thread: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  }) as MessageWithRelations[]

  const nextCursor = messages.length > limit ? (messages.pop()?.id ?? null) : null

  return {
    messages: messages.map((message) => MessageSchema.parse(message)),
    nextCursor,
  }
}

export async function getMessageById(
  messageId: string,
  threadId: string,
): Promise<Message | null> {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
      threadId,
    },
    include: {
      thread: true,
    },
  }) as MessageWithRelations | null

  return message ? MessageSchema.parse(message) : null
}
