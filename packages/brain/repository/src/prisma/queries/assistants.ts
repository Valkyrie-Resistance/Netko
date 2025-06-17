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
  nextCursor: { updatedAt: string; id: string } | null
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
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: cursor.updatedAt,
          id: cursor.id,
        }
      : undefined,
  })) as AssistantWithRelations[]

  const nextCursor =
    assistants.length > limit
      ? {
          updatedAt: assistants[limit]?.updatedAt.toISOString() ?? '',
          id: assistants[limit]?.id ?? '',
        }
      : null
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

  const assistant = (await prisma.assistant.findFirst({
    where: {
      id: validatedId,
      createdById: userId,
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
  nextCursor: { updatedAt: string; id: string } | null
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
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: cursor.updatedAt,
          id: cursor.id,
        }
      : undefined,
  })) as AssistantWithRelations[]

  const nextCursor =
    assistants.length > limit
      ? {
          updatedAt: assistants[limit]?.updatedAt.toISOString() ?? '',
          id: assistants[limit]?.id ?? '',
        }
      : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getAllPublicAssistants(input: AssistantListInput): Promise<{
  assistants: Assistant[]
  nextCursor: { updatedAt: string; id: string } | null
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
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: cursor.updatedAt,
          id: cursor.id,
        }
      : undefined,
  })) as AssistantWithRelations[]

  const nextCursor =
    assistants.length > limit
      ? {
          updatedAt: assistants[limit]?.updatedAt.toISOString() ?? '',
          id: assistants[limit]?.id ?? '',
        }
      : null

  return {
    assistants: assistants.map((assistant) => AssistantSchema.parse(assistant)),
    nextCursor,
  }
}

export async function getPublicAssistantById(assistantId: string): Promise<Assistant | null> {
  const validatedId = AssistantIdSchema.parse(assistantId)

  const assistant = (await prisma.assistant.findFirst({
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
