import {
  type Message,
  type MessageCreateInput,
  MessageCreateInputSchema,
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
  const validatedData = MessageCreateInputSchema.parse({
    ...data,
    thread: {
      connect: {
        id: data.threadId,
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
  const validatedData = MessageUpdateInputSchema.parse(data)

  const message = (await prisma.message.update({
    where: {
      id: messageId,
      threadId,
    },
    data: validatedData,
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function deleteMessage(messageId: string, threadId: string): Promise<Message | null> {
  const message = (await prisma.message.delete({
    where: {
      id: messageId,
      threadId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}
