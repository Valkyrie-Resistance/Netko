import { type Message, MessageSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { thread: true }
}>

export async function createMessage(
  threadId: string,
  content: string,
  role: 'USER' | 'ASSISTANT',
  userId?: string,
  assistantId?: string,
  modelId?: string,
  parentId?: string,
  tokenCount?: number,
): Promise<Message> {
  const message = await prisma.message.create({
    data: {
      content,
      role,
      thread: {
        connect: {
          id: threadId,
        },
      },
      ...(userId && {
        user: {
          connect: {
            id: userId,
          },
        },
      }),
      ...(assistantId && {
        assistant: {
          connect: {
            id: assistantId,
          },
        },
      }),
      ...(modelId && {
        model: {
          connect: {
            id: modelId,
          },
        },
      }),
      ...(parentId && {
        parent: {
          connect: {
            id: parentId,
          },
        },
      }),
      tokenCount,
    },
    include: {
      thread: true,
    },
  }) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function updateMessage(
  messageId: string,
  threadId: string,
  data: {
    content?: string
    tokenCount?: number
  },
): Promise<Message | null> {
  const message = await prisma.message.update({
    where: {
      id: messageId,
      threadId,
    },
    data,
    include: {
      thread: true,
    },
  }) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function deleteMessage(
  messageId: string,
  threadId: string,
): Promise<Message | null> {
  const message = await prisma.message.delete({
    where: {
      id: messageId,
      threadId,
    },
    include: {
      thread: true,
    },
  }) as MessageWithRelations

  return MessageSchema.parse(message)
}
