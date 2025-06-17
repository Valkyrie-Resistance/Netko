import {
  type SharedChat,
  type SharedChatCreateInput,
  SharedChatCreateInputSchema,
  SharedChatIdSchema,
  SharedChatSchema,
  type SharedChatUpdateInput,
  SharedChatUpdateInputSchema,
  ThreadIdSchema,
  UserIdSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type SharedChatWithRelations = Prisma.SharedChatGetPayload<{
  include: { thread: true; sharedBy: true }
}>

export async function addThreadToSharedChat(
  sharedChatId: string,
  threadId: string,
): Promise<SharedChat> {
  const validatedSharedChatId = SharedChatIdSchema.parse(sharedChatId)
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const sharedChat = (await prisma.sharedChat.update({
    where: {
      id: validatedSharedChatId,
    },
    data: {
      threadId: validatedThreadId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}

export async function addSharedByToSharedChat(
  sharedChatId: string,
  userId: string,
): Promise<SharedChat> {
  const validatedSharedChatId = SharedChatIdSchema.parse(sharedChatId)
  const validatedUserId = UserIdSchema.parse(userId)

  const sharedChat = (await prisma.sharedChat.update({
    where: {
      id: validatedSharedChatId,
    },
    data: {
      sharedById: validatedUserId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}

export async function createSharedChat(
  data: Omit<SharedChatCreateInput, 'thread' | 'sharedBy'> & { threadId: string; sharedById: string },
): Promise<SharedChat> {
  const validatedData = SharedChatCreateInputSchema.parse(data)

  const sharedChat = (await prisma.sharedChat.create({
    data: {
      ...validatedData,
      threadId: data.threadId,
      sharedById: data.sharedById,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}

export async function updateSharedChat(
  sharedChatId: string,
  data: SharedChatUpdateInput,
): Promise<SharedChat | null> {
  const validatedId = SharedChatIdSchema.parse(sharedChatId)
  const validatedData = SharedChatUpdateInputSchema.parse(data)

  const sharedChat = (await prisma.sharedChat.update({
    where: {
      id: validatedId,
    },
    data: validatedData,
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}

export async function deleteSharedChat(sharedChatId: string): Promise<SharedChat> {
  const validatedId = SharedChatIdSchema.parse(sharedChatId)

  const sharedChat = (await prisma.sharedChat.delete({
    where: {
      id: validatedId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}
