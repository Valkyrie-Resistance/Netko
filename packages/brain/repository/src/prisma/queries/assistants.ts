import { type Assistant, AssistantSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

export const assistants = {
  getAll: async (
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
  },

  getById: async (assistantId: string, userId: string): Promise<Assistant | null> => {
    const assistant = (await prisma.assistant.findUnique({
      where: {
        id: assistantId,
        createdById: userId,
      },
      include: {
        createdBy: true,
        defaultModel: true,
      },
    })) as AssistantWithRelations | null

    return assistant ? AssistantSchema.parse(assistant) : null
  },

  create: async (
    userId: string,
    name: string,
    description: string,
    systemPrompt: string,
    temperature = 0.7,
    maxTokens?: number,
    defaultModelId?: string,
  ): Promise<Assistant> => {
    const createData = {
      name,
      description,
      systemPrompt,
      temperature,
      maxTokens,
      createdBy: {
        connect: {
          id: userId,
        },
      },
      ...(defaultModelId && {
        defaultModel: {
          connect: {
            id: defaultModelId,
          },
        },
      }),
    }

    const assistant = (await prisma.assistant.create({
      data: createData,
      include: {
        createdBy: true,
        defaultModel: true,
      },
    })) as AssistantWithRelations

    return AssistantSchema.parse(assistant)
  },

  update: async (
    assistantId: string,
    userId: string,
    data: {
      name?: string
      description?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      defaultModelId?: string
    },
  ): Promise<Assistant | null> => {
    const assistant = (await prisma.assistant.update({
      where: {
        id: assistantId,
        createdById: userId,
      },
      data,
      include: {
        createdBy: true,
        defaultModel: true,
      },
    })) as AssistantWithRelations

    return AssistantSchema.parse(assistant)
  },

  delete: async (assistantId: string, userId: string): Promise<Assistant | null> => {
    const assistant = (await prisma.assistant.delete({
      where: {
        id: assistantId,
        createdById: userId,
      },
      include: {
        createdBy: true,
        defaultModel: true,
      },
    })) as AssistantWithRelations

    return AssistantSchema.parse(assistant)
  },
}
