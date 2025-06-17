import {
  type Assistant,
  type AssistantCreateInput,
  AssistantCreateInputSchema,
  AssistantIdSchema,
  AssistantSchema,
  type AssistantUpdateInput,
  AssistantUpdateInputSchema,
  LLMModelIdSchema,
  UserIdSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

export async function addDefaultModelToAssistant(
  assistantId: string,
  modelId: string,
): Promise<Assistant> {
  const validatedAssistantId = AssistantIdSchema.parse(assistantId)
  const validatedModelId = LLMModelIdSchema.parse(modelId)

  const assistant = (await prisma.assistant.update({
    where: {
      id: validatedAssistantId,
    },
    data: {
      defaultModelId: validatedModelId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function addCreatorToAssistant(
  assistantId: string,
  userId: string,
): Promise<Assistant> {
  const validatedAssistantId = AssistantIdSchema.parse(assistantId)
  const validatedUserId = UserIdSchema.parse(userId)

  const assistant = (await prisma.assistant.update({
    where: {
      id: validatedAssistantId,
    },
    data: {
      createdById: validatedUserId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function createAssistant(
  data: Omit<AssistantCreateInput, 'defaultModel' | 'createdBy'> & {
    createdById: string
    defaultModelId?: string
  },
): Promise<Assistant> {
  const validatedData = AssistantCreateInputSchema.parse(data)
  const {createdById, defaultModelId, ...rest} = data
  const validatedDefaultModelId = defaultModelId ? LLMModelIdSchema.parse(defaultModelId) : undefined
  const validatedCreatedById = UserIdSchema.parse(createdById)
  const assistant = (await prisma.assistant.create({
    data: {
      ...validatedData,
      createdById: validatedCreatedById,
      defaultModelId: validatedDefaultModelId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function updateAssistant(
  assistantId: string,
  data: Omit<AssistantUpdateInput, 'defaultModel'> & { defaultModelId?: string },
): Promise<Assistant> {
  const validatedId = AssistantIdSchema.parse(assistantId)
  const { defaultModelId, ...updateData } = data
  const validatedDefaultModelId = defaultModelId ? LLMModelIdSchema.parse(defaultModelId): undefined
  const validatedData = AssistantUpdateInputSchema.parse({
    ...updateData,
    defaultModelId: validatedDefaultModelId,
  })

  const assistant = (await prisma.assistant.update({
    where: {
      id: validatedId,
    },
    data: validatedData,
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations

  if (defaultModelId) {
    return addDefaultModelToAssistant(assistant.id, defaultModelId)
  }

  return AssistantSchema.parse(assistant)
}

export async function deleteAssistant(assistantId: string): Promise<Assistant> {
  const validatedId = AssistantIdSchema.parse(assistantId)

  const assistant = (await prisma.assistant.delete({
    where: {
      id: validatedId,
    },
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}
