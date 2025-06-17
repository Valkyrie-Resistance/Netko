import { 
  type SharedChat, 
  type SharedChatByShareIdInput,
  SharedChatByShareIdInputSchema,
  type SharedChatListInput,
  SharedChatListInputSchema,
  SharedChatSchema
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type SharedChatWithRelations = Prisma.SharedChatGetPayload<{
  include: { thread: true; sharedBy: true }
}>

export async function getAllSharedChats(
  input: SharedChatListInput
): Promise<{
  sharedChats: SharedChat[]
  nextCursor: string | null
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
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  })) as SharedChatWithRelations[]

  const nextCursor = sharedChats.length > limit ? (sharedChats.pop()?.id ?? null) : null

  return {
    sharedChats: sharedChats.map((sharedChat) => SharedChatSchema.parse(sharedChat)),
    nextCursor,
  }
}

export async function getSharedChatById(sharedChatId: string): Promise<SharedChat | null> {
  const sharedChat = (await prisma.sharedChat.findUnique({
    where: {
      id: sharedChatId,
    },
    include: {
      thread: true,
      sharedBy: true,
    },
  })) as SharedChatWithRelations | null

  return sharedChat ? SharedChatSchema.parse(sharedChat) : null
}

export async function getSharedChatByShareId(
  input: SharedChatByShareIdInput
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