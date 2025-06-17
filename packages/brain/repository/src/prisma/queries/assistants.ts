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
  const assistants = (await prisma.assistant.findMany({
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
  })) as AssistantWithRelations[]

  const nextCursor = assistants.length > limit ? (assistants[limit]?.id ?? null) : null
  const page = assistants.slice(0, limit)
  return {
    assistants: page.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getAssistantById(assistantId: string): Promise<Assistant | null> {
  const assistant = (await prisma.assistant.findUnique({
    where: {
      id: assistantId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations | null

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
  const assistants = (await prisma.assistant.findMany({
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
  })) as AssistantWithRelations[]

  const nextCursor = assistants.length > limit ? (assistants.pop()?.id ?? null) : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getAllPublicAssistants(
  limit: number,
  cursor?: string,
): Promise<{
  assistants: Assistant[]
  nextCursor: string | null
}> {
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
    cursor: cursor ? { id: cursor } : undefined,
  })) as AssistantWithRelations[]

  const nextCursor = assistants.length > limit ? (assistants.pop()?.id ?? null) : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getPublicAssistantById(assistantId: string): Promise<Assistant | null> {
  const assistant = (await prisma.assistant.findUnique({
    where: {
      id: assistantId,
      isPublic: true,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations | null

  return assistant ? AssistantSchema.parse(assistant) : null
}
