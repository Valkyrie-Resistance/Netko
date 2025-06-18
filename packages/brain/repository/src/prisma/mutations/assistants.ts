import {
  type Assistant,
  type AssistantCreateInput,
  AssistantCreateInputSchema,
  AssistantIdSchema,
  AssistantSchema,
  type AssistantUpdateInput,
  AssistantUpdateInputSchema,
  UserIdSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

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
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function createAssistant(
  data: Omit<AssistantCreateInput, 'createdBy'> & { createdById: string },
): Promise<Assistant> {
  const { createdById, ...rest } = data
  const validatedData = AssistantCreateInputSchema.parse(rest)
  const validatedCreatedById = UserIdSchema.parse(createdById)
  const assistant = (await prisma.assistant.create({
    data: {
      ...validatedData,
      createdById: validatedCreatedById,
    },
    include: {
      createdBy: true,
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function updateAssistant(
  assistantId: string,
  data: AssistantUpdateInput,
): Promise<Assistant> {
  const validatedId = AssistantIdSchema.parse(assistantId)
  const validatedData = AssistantUpdateInputSchema.parse(data)

  const assistant = (await prisma.assistant.update({
        where: {
      id: validatedId,
    },
    data: {
      ...validatedData,
    },
    include: {
      createdBy: true,
    },
  })) as AssistantWithRelations

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
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}
