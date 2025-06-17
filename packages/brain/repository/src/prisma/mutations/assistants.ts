import { type Assistant, AssistantSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

export async function createAssistant(
  userId: string,
  name: string,
  description: string,
  systemPrompt: string,
  temperature = 0.7,
  maxTokens?: number,
  defaultModelId?: string,
): Promise<Assistant> {
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

  const assistant = await prisma.assistant.create({
    data: createData,
    include: {
      createdBy: true,
      defaultModel: true,
    },
  }) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function updateAssistant(
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
): Promise<Assistant | null> {
  const { defaultModelId, ...updateData } = data
  const assistant = await prisma.assistant.update({
    where: {
      id: assistantId,
      createdById: userId,
    },
    data: {
      ...updateData,
      ...(defaultModelId && {
        defaultModel: {
          connect: {
            id: defaultModelId,
          },
        },
      }),
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  }) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function deleteAssistant(
  assistantId: string,
  userId: string,
): Promise<Assistant | null> {
  const assistant = await prisma.assistant.delete({
    where: {
      id: assistantId,
      createdById: userId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  }) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}
