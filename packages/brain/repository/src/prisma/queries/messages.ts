import { type Message, MessageSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { thread: true }
}>

export const messages = {
  getAll: async (
    threadId: string,
    limit: number,
    cursor?: string,
  ): Promise<{
    messages: Message[]
    nextCursor: string | null
  }> => {
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
  },

  getById: async (messageId: string, threadId: string): Promise<Message | null> => {
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
  },

  create: async (
    threadId: string,
    content: string,
    role: 'USER' | 'ASSISTANT',
  ): Promise<Message> => {
    const message = await prisma.message.create({
      data: {
        content,
        role,
        thread: {
          connect: {
            id: threadId,
          },
        },
      },
      include: {
        thread: true,
      },
    }) as MessageWithRelations

    return MessageSchema.parse(message)
  },

  update: async (
    messageId: string,
    threadId: string,
    content: string,
  ): Promise<Message | null> => {
    const message = await prisma.message.update({
      where: {
        id: messageId,
        threadId,
      },
      data: {
        content,
      },
      include: {
        thread: true,
      },
    }) as MessageWithRelations

    return MessageSchema.parse(message)
  },

  delete: async (messageId: string, threadId: string): Promise<Message | null> => {
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
  },
} 