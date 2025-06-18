import {
  type Message,
  MessageIdSchema,
  type MessageListInput,
  MessageListInputSchema,
  MessageSchema,
} from '@chad-chat/brain-domain'
import { ThreadIdSchema } from '@chad-chat/brain-domain'
import { prisma } from '../client'

export async function getAllMessages(
  threadId: string,
  input: MessageListInput,
): Promise<{
  messages: Message[]
  nextCursor: { createdAt: string; id: string } | null
}> {
  const { limit, cursor } = MessageListInputSchema.parse(input)
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const messages = await prisma.message.findMany({
    where: {
      threadId: validatedThreadId,
    },
    include: {
      thread: true,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          createdAt: new Date(cursor.createdAt),
          id: cursor.id,
        }
      : undefined,
  })

  const nextCursor =
    messages.length > limit
      ? {
          createdAt: messages[limit]?.createdAt.toISOString() ?? '',
          id: messages[limit]?.id ?? '',
        }
      : null
  const page = messages.slice(0, limit)
  return {
    messages: page.map((message) => MessageSchema.parse(message)),
    nextCursor,
  }
}

export async function getMessageById(messageId: string, threadId: string): Promise<Message | null> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const message = await prisma.message.findUnique({
    where: {
      messageCompoundId: {
        id: validatedMessageId,
        threadId: validatedThreadId,
      },
    },
    include: {
      thread: true,
    },
  })

  return message ? MessageSchema.parse(message) : null
}

export async function getMessagesUpToId(
  threadId: string,
  upToMessageId: string,
): Promise<Message[]> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
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
      id: true,
    },
  })

  if (!targetMessage) {
    return []
  }

  const messages = await prisma.message.findMany({
    where: {
      threadId: validatedThreadId,
      createdAt: {
        lte: targetMessage.createdAt,
      },
    },
    include: {
      thread: true,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  return messages.map((message) => MessageSchema.parse(message))
}
