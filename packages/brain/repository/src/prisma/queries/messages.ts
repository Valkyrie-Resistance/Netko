import {
  type Message,
  type MessageListInput,
  MessageListInputSchema,
  MessageSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { thread: true }
}>

export async function getAllMessages(
  threadId: string,
  input: MessageListInput,
): Promise<{
  messages: Message[]
  nextCursor: string | null
}> {
  const { limit, cursor } = MessageListInputSchema.parse(input)

  const messages = (await prisma.message.findMany({
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
  })) as MessageWithRelations[]

  const nextCursor = messages.length > limit ? (messages.pop()?.id ?? null) : null

  return {
    messages: messages.map((message) => MessageSchema.parse(message)),
    nextCursor,
  }
}

export async function getMessageById(messageId: string, threadId: string): Promise<Message | null> {
  const message = (await prisma.message.findUnique({
    where: {
      messageCompoundId: {
        id: messageId,
        threadId: threadId,
      },
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations | null

  return message ? MessageSchema.parse(message) : null
}

export async function getMessagesUpToId(
  threadId: string,
  upToMessageId: string,
): Promise<Message[]> {
  const targetMessage = await prisma.message.findUnique({
    where: {
      messageCompoundId: {
        id: upToMessageId,
        threadId,
      },
    },
    select: {
      createdAt: true,
    },
  })

  if (!targetMessage) {
    return []
  }

  const messages = (await prisma.message.findMany({
    where: {
      threadId,
      createdAt: {
        lte: targetMessage.createdAt,
      },
    },
    include: {
      thread: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })) as MessageWithRelations[]

  return messages.map((message) => MessageSchema.parse(message))
}
