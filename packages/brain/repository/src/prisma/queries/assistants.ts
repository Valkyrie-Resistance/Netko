import { type Assistant, AssistantSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

export async function getAllAssistants(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<{
  assistants: Assistant[]
  nextCursor: string | null
}> {
  const assistants = await prisma.assistant.findMany({
    where: {
      createdById: userId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  }) as AssistantWithRelations[]

  const nextCursor = assistants.length > limit ? (assistants.pop()?.id ?? null) : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getAssistantById(
  assistantId: string,
  userId: string,
): Promise<Assistant | null> {
  const assistant = await prisma.assistant.findUnique({
    where: {
      id: assistantId,
      createdById: userId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  }) as AssistantWithRelations | null

  return assistant ? AssistantSchema.parse(assistant) : null
}

export async function searchAssistants(
  userId: string,
  query: string,
  limit: number,
  cursor?: string,
): Promise<{
  assistants: Assistant[]
  nextCursor: string | null
}> {
  const assistants = await prisma.assistant.findMany({
    where: {
      createdById: userId,
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  }) as AssistantWithRelations[]

  const nextCursor = assistants.length > limit ? (assistants.pop()?.id ?? null) : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export const assistants = {
  getAllPublic: async (
    limit: number,
    cursor?: string,
  ): Promise<{
    assistants: Assistant[]
    nextCursor: string | null
  }> => {
    const assistants = (await prisma.assistant.findMany({
      where: {
        isPublic: true,
      },
      include: {
        createdBy: true,
        defaultModel: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    })) as AssistantWithRelations[]
    const nextCursor = assistants.length > limit ? (assistants.pop()?.id ?? null) : null
    return {
      assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
      nextCursor,
    }
  },

  getPrivateByUserId: async (
    userId: string,
    limit: number,
    cursor?: string,
  ): Promise<{
    assistants: Assistant[]
    nextCursor: string | null
  }> => {
    const assistants = (await prisma.assistant.findMany({
      where: {
        createdById: userId,
        isPublic: false,
      },
      include: {
        createdBy: true,
        defaultModel: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    })) as AssistantWithRelations[]
    const nextCursor = assistants.length > limit ? (assistants.pop()?.id ?? null) : null
    return {
      assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
      nextCursor,
    }
  },
}
