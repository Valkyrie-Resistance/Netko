import {
  type Message,
  MessageIdSchema,
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
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit + 1,
    cursor: cursor
      ? {
          createdAt: cursor,
          id: cursor,
        }
      : undefined,
  })) as MessageWithRelations[]

  const nextCursor =
    messages.length > limit ? (messages[limit]?.createdAt.toISOString() ?? null) : null
  const page = messages.slice(0, limit)
  return {
    messages: page.map((message) => MessageSchema.parse(message)),
    nextCursor,
  }
}

export async function getMessageById(messageId: string, threadId: string): Promise<Message | null> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = MessageIdSchema.parse(threadId)

  const message = (await prisma.message.findUnique({
    where: {
      messageCompoundId: {
        id: validatedMessageId,
        threadId: validatedThreadId,
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
  const validatedThreadId = MessageIdSchema.parse(threadId)
  const validatedMessageId = MessageIdSchema.parse(upToMessageId)

  const targetMessage = await prisma.message.findUnique({
    where: {
      messageCompoundId: {
        id: validatedMessageId,
        threadId: validatedThreadId,
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
      threadId: validatedThreadId,
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
