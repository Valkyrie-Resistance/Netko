import {
  type SharedChat,
  type SharedChatByShareIdInput,
  SharedChatByShareIdInputSchema,
  SharedChatIdSchema,
  type SharedChatListInput,
  SharedChatListInputSchema,
  SharedChatSchema,
  UserIdSchema,
} from '@netko/brain-domain'
import { prisma } from '../client'

export async function getAllSharedChats(input: SharedChatListInput): Promise<{
  sharedChats: SharedChat[]
  nextCursor: { createdAt: string; id: string } | null
}> {
  const { limit, cursor, userId } = SharedChatListInputSchema.parse(input)

  const sharedChats = await prisma.sharedChat.findMany({
    where: {
      sharedById: userId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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

  const sharedChat = await prisma.sharedChat.findUnique({
    where: {
      id: validatedId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })

  return sharedChat ? SharedChatSchema.parse(sharedChat) : null
}

export async function getSharedChatByUserId(
  sharedChatId: string,
  userId: string,
): Promise<SharedChat | null> {
  const validatedId = SharedChatIdSchema.parse(sharedChatId)
  const validatedUserId = UserIdSchema.parse(userId)

  const sharedChat = await prisma.sharedChat.findFirst({
    where: {
      id: validatedId,
      sharedById: validatedUserId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })

  return sharedChat ? SharedChatSchema.parse(sharedChat) : null
}

export async function getSharedChatByShareId(
  input: SharedChatByShareIdInput,
): Promise<SharedChat | null> {
  const { shareId } = SharedChatByShareIdInputSchema.parse(input)

  const sharedChat = await prisma.sharedChat.findUnique({
    where: {
      shareId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })

  return sharedChat ? SharedChatSchema.parse(sharedChat) : null
}
