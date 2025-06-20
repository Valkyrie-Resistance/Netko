import { type LLMModel, LLMModelIdSchema, LLMModelSchema } from '@netko/brain-domain'
import { prisma } from '../client'

export async function getModelById(modelId: string): Promise<LLMModel | null> {
  const validatedId = LLMModelIdSchema.parse(modelId)

  const model = await prisma.lLMModel.findUnique({
    where: {
      id: validatedId,
    },
    select: {
      id: true,
      name: true,
      provider: true,
      displayName: true,
      description: true,
      isActive: true,
      isDefault: true,
    },
  })

  return model ? LLMModelSchema.parse(model) : null
}

export async function getActiveModels(): Promise<LLMModel[]> {
  const models = await prisma.lLMModel.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      provider: true,
      displayName: true,
      description: true,
      isActive: true,
      isDefault: true,
    },
  })

  return models.map((model) => LLMModelSchema.parse(model))
}

export async function getDefaultModels(): Promise<LLMModel[]> {
  const models = await prisma.lLMModel.findMany({
    where: {
      isDefault: true,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      provider: true,
      displayName: true,
      description: true,
      isActive: true,
      isDefault: true,
    },
  })

  return models.map((model) => LLMModelSchema.parse(model))
}
