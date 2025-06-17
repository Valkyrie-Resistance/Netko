import {
  type SharedChat,
  type SharedChatByShareIdInput,
  SharedChatByShareIdInputSchema,
  SharedChatIdSchema,
  type SharedChatListInput,
  SharedChatListInputSchema,
  SharedChatSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type SharedChatWithRelations = Prisma.SharedChatGetPayload<{
  include: { thread: true; sharedBy: true }
}>

export async function getAllSharedChats(input: SharedChatListInput): Promise<{
  sharedChats: SharedChat[]
  nextCursor: { createdAt: string; id: string } | null
}> {
  const { limit, cursor, userId } = SharedChatListInputSchema.parse(input)

  const sharedChats = (await prisma.sharedChat.findMany({
    where: {
      sharedById: userId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    cursor: cursor
      ? {
          createdAt: cursor.createdAt,
          id: cursor.id,
        }
      : undefined,
  })) as SharedChatWithRelations[]

  const nextCursor =
    sharedChats.length > limit
      ? {
          createdAt: sharedChats[limit]?.createdAt.toISOString() ?? '',
          id: sharedChats[limit]?.id ?? '',
        }
      : null
  const page = sharedChats.slice(0, limit)
  return {
    sharedChats: page.map((sharedChat) => SharedChatSchema.parse(sharedChat)),
    nextCursor,
  }
}

export async function getSharedChatById(sharedChatId: string): Promise<SharedChat | null> {
  const validatedId = SharedChatIdSchema.parse(sharedChatId)

  const sharedChat = (await prisma.sharedChat.findUnique({
    where: {
      id: validatedId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations | null

  return sharedChat ? SharedChatSchema.parse(sharedChat) : null
}

export async function getSharedChatByShareId(
  input: SharedChatByShareIdInput,
): Promise<SharedChat | null> {
  const { shareId } = SharedChatByShareIdInputSchema.parse(input)

  const sharedChat = (await prisma.sharedChat.findUnique({
    where: {
      shareId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations | null

  return sharedChat ? SharedChatSchema.parse(sharedChat) : null
}
