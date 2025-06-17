import {
  type Message,
  type MessageCreateInput,
  MessageCreateInputSchema,
  MessageIdSchema,
  MessageSchema,
  type MessageUpdateInput,
  MessageUpdateInputSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { thread: true }
}>

export async function createMessage(
  data: Omit<MessageCreateInput, 'thread'> & { threadId: string },
): Promise<Message> {
  const validatedThreadId = MessageIdSchema.parse(data.threadId)
  const validatedData = MessageCreateInputSchema.parse({
    ...data,
    thread: {
      connect: {
        id: validatedThreadId,
      },
    },
  })

  const message = (await prisma.message.create({
    data: validatedData,
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function updateMessage(
  messageId: string,
  threadId: string,
  data: MessageUpdateInput,
): Promise<Message | null> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = MessageIdSchema.parse(threadId)
  const validatedData = MessageUpdateInputSchema.parse(data)

  const message = (await prisma.message.update({
    where: {
      id: validatedMessageId,
      threadId: validatedThreadId,
    },
    data: validatedData,
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function deleteMessage(messageId: string, threadId: string): Promise<Message | null> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = MessageIdSchema.parse(threadId)
  
  const message = (await prisma.message.delete({
    where: {
      id: validatedMessageId,
      threadId: validatedThreadId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}
