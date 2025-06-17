import {
  type Assistant,
  type AssistantCreateInput,
  AssistantCreateInputSchema,
  AssistantIdSchema,
  AssistantSchema,
  type AssistantUpdateInput,
  AssistantUpdateInputSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type AssistantWithRelations = Prisma.AssistantGetPayload<{
  include: { createdBy: true; defaultModel: true }
}>

export async function createAssistant(
  data: Omit<AssistantCreateInput, 'createdBy'> & { createdById: string },
): Promise<Assistant> {
  const validatedData = AssistantCreateInputSchema.parse({
    ...data,
    createdBy: {
      connect: {
        id: data.createdById,
      },
    },
  })

  const assistant = (await prisma.assistant.create({
    data: validatedData,
    include: {
      createdBy: true,
      defaultModel: true,
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
    data: validatedData,
    include: {
      createdBy: true,
      defaultModel: true,
    },
  })) as AssistantWithRelations

  return AssistantSchema.parse(assistant)
}

export async function deleteAssistant(assistantId: string): Promise<Assistant | null> {
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
