import {
  type Assistant,
  AssistantIdSchema,
  type AssistantListInput,
  AssistantListInputSchema,
  AssistantSchema,
  type AssistantSearchInput,
  AssistantSearchInputSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

export async function getAllAssistants(input: AssistantListInput): Promise<{
  assistants: Assistant[]
  nextCursor: string | null
}> {
  const { limit, cursor, userId } = AssistantListInputSchema.parse(input)

  const assistants = (await prisma.assistant.findMany({
    where: {
      createdById: userId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    cursor: cursor
      ? {
          updatedAt: cursor,
          id: cursor,
        }
      : undefined,
  })) as AssistantWithRelations[]

  const nextCursor =
    assistants.length > limit ? (assistants[limit]?.updatedAt.toISOString() ?? null) : null
  const page = assistants.slice(0, limit)
  return {
    assistants: page.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getAssistantById(
  assistantId: string,
  userId: string,
): Promise<Assistant | null> {
  const validatedId = AssistantIdSchema.parse(assistantId)

  const assistant = (await prisma.assistant.findUnique({
    where: {
      assistantCompoundId: {
        id: validatedId,
        createdById: userId,
      },
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations | null

  return assistant ? AssistantSchema.parse(assistant) : null
}

export async function searchAssistants(input: AssistantSearchInput): Promise<{
  assistants: Assistant[]
  nextCursor: string | null
}> {
  const { limit, cursor, query, userId } = AssistantSearchInputSchema.parse(input)

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
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    cursor: cursor
      ? {
          updatedAt: cursor,
          id: cursor,
        }
      : undefined,
  })) as AssistantWithRelations[]

  const nextCursor =
    assistants.length > limit ? (assistants[limit]?.updatedAt.toISOString() ?? null) : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getAllPublicAssistants(input: AssistantListInput): Promise<{
  assistants: Assistant[]
  nextCursor: string | null
}> {
  const { limit, cursor } = AssistantListInputSchema.parse(input)

  const assistants = (await prisma.assistant.findMany({
    where: {
      isPublic: true,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    cursor: cursor
      ? {
          updatedAt: cursor,
          id: cursor,
        }
      : undefined,
  })) as AssistantWithRelations[]

  const nextCursor =
    assistants.length > limit ? (assistants[limit]?.updatedAt.toISOString() ?? null) : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getPublicAssistantById(assistantId: string): Promise<Assistant | null> {
  const validatedId = AssistantIdSchema.parse(assistantId)

  const assistant = (await prisma.assistant.findUnique({
    where: {
      id: validatedId,
      isPublic: true,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations | null

  return assistant ? AssistantSchema.parse(assistant) : null
}
