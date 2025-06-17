import {
  type SharedChat,
  type SharedChatCreateInput,
  SharedChatCreateInputSchema,
  SharedChatSchema,
  type SharedChatUpdateInput,
  SharedChatUpdateInputSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type SharedChatWithRelations = Prisma.SharedChatGetPayload<{
  include: { thread: true; sharedBy: true }
}>

export async function createSharedChat(
  data: Omit<SharedChatCreateInput, 'sharedBy'> & { sharedById: string },
): Promise<SharedChat> {
  const validatedData = SharedChatCreateInputSchema.parse({
    ...data,
    sharedBy: {
      connect: {
        id: data.sharedById,
      },
    },
  })

  const sharedChat = (await prisma.sharedChat.create({
    data: validatedData,
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
  const validatedData = SharedChatUpdateInputSchema.parse(data)

  const sharedChat = (await prisma.sharedChat.update({
    where: {
      id: sharedChatId,
    },
    data: validatedData,
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}

export async function deleteSharedChat(sharedChatId: string): Promise<SharedChat | null> {
  const sharedChat = (await prisma.sharedChat.delete({
    where: {
      id: sharedChatId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations

  return SharedChatSchema.parse(sharedChat)
}
