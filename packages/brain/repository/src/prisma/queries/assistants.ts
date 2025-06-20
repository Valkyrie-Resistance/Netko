import {
  type Assistant,
  AssistantIdSchema,
  type AssistantListInput,
  AssistantListInputSchema,
  AssistantSchema,
  type AssistantSearchInput,
  AssistantSearchInputSchema,
  UserIdSchema,
} from '@netko/brain-domain'
import { prisma } from '../client'

export async function getAllAssistants(input: AssistantListInput): Promise<{
  assistants: Assistant[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const { limit, cursor, userId } = AssistantListInputSchema.parse(input)

  const assistants = await prisma.assistant.findMany({
    where: {
      createdById: userId,
    },
    include: {
      createdBy: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: new Date(cursor.updatedAt),
          id: cursor.id,
        }
      : undefined,
  })

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

export async function getAssistantById(assistantId: string, userId: string): Promise<Assistant> {
  const validatedId = AssistantIdSchema.parse(assistantId)
  const validatedUserId = UserIdSchema.parse(userId)

  const assistant = await prisma.assistant.findFirst({
    where: {
      id: validatedId,
      createdById: validatedUserId,
    },
    include: {
      createdBy: true,
    },
  })

  return AssistantSchema.parse(assistant)
}

export async function searchAssistants(input: AssistantSearchInput): Promise<{
  assistants: Assistant[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const { limit, cursor, query, userId } = AssistantSearchInputSchema.parse(input)

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
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: new Date(cursor.updatedAt),
          id: cursor.id,
        }
      : undefined,
  })

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

export async function getAllPublicAssistants(input: Omit<AssistantListInput, 'userId'>): Promise<{
  assistants: Assistant[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const { limit, cursor } = AssistantListInputSchema.omit({ userId: true }).parse(input)

  const assistants = await prisma.assistant.findMany({
    where: {
      isPublic: true,
    },
    include: {
      createdBy: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: new Date(cursor.updatedAt),
          id: cursor.id,
        }
      : undefined,
  })

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

export async function getPublicAssistantById(assistantId: string): Promise<Assistant | null> {
  const validatedId = AssistantIdSchema.parse(assistantId)

  const assistant = await prisma.assistant.findFirst({
    where: {
      id: validatedId,
      isPublic: true,
    },
    include: {
      createdBy: true,
    },
  })

  return assistant ? AssistantSchema.parse(assistant) : null
}

export async function getAssistants(userId: string): Promise<Assistant[]> {
  const validatedUserId = UserIdSchema.parse(userId)

  const [userAssistants, publicAssistants] = await prisma.$transaction([
    prisma.assistant.findMany({
      where: {
        createdById: validatedUserId,
      },
      include: {
        createdBy: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    }),
    prisma.assistant.findMany({
      where: {
        isPublic: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    }),
  ])

  const assistants = [...userAssistants, ...publicAssistants]

  return assistants.map((assistant) => AssistantSchema.parse(assistant))
}
