import {
  AssistantIdSchema,
  LLMModelIdSchema,
  type Message,
  type MessageCreateInput,
  MessageCreateInputSchema,
  MessageIdSchema,
  MessageSchema,
  type MessageUpdateInput,
  MessageUpdateInputSchema,
  ThreadIdSchema,
  UserIdSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { thread: true }
}>

export async function addThreadToMessage(
  messageId: string,
  threadId: string,
): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const message = (await prisma.message.update({
    where: {
      id: validatedMessageId,
    },
    data: {
      threadId: validatedThreadId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function addUserToMessage(
  messageId: string,
  userId: string,
): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedUserId = UserIdSchema.parse(userId)

  const message = (await prisma.message.update({
    where: {
      id: validatedMessageId,
    },
    data: {
      userId: validatedUserId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function addAssistantToMessage(
  messageId: string,
  assistantId: string,
): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedAssistantId = AssistantIdSchema.parse(assistantId)

  const message = (await prisma.message.update({
    where: {
      id: validatedMessageId,
    },
    data: {
      assistantId: validatedAssistantId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function addModelToMessage(
  messageId: string,
  modelId: string,
): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedModelId = LLMModelIdSchema.parse(modelId)

  const message = (await prisma.message.update({
    where: {
      id: validatedMessageId,
    },
    data: {
      modelId: validatedModelId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function addParentToMessage(
  messageId: string,
  parentId: string,
): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedParentId = MessageIdSchema.parse(parentId)

  const message = (await prisma.message.update({
    where: {
      id: validatedMessageId,
    },
    data: {
      parentId: validatedParentId,
    },
    include: {
      thread: true,
    },
  })) as MessageWithRelations

  return MessageSchema.parse(message)
}

export async function createMessage(
  data: Omit<MessageCreateInput, 'thread'> & { threadId: string },
): Promise<Message> {
  const validatedData = MessageCreateInputSchema.parse(data)

  const message = (await prisma.message.create({
    data: {
      ...validatedData,
      threadId: data.threadId,
    },
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
): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = ThreadIdSchema.parse(threadId)
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

export async function deleteMessage(messageId: string, threadId: string): Promise<Message> {
  const validatedMessageId = MessageIdSchema.parse(messageId)
  const validatedThreadId = ThreadIdSchema.parse(threadId)

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
