import type { LLMModel } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'

export async function getActiveLLMModels(): Promise<LLMModel[]> {
  const models = await prisma.lLMModel.findMany({ where: { isActive: true } })
  return models as unknown as LLMModel[]
}

export async function getAllLLMModels(): Promise<LLMModel[]> {
  const models = await prisma.lLMModel.findMany({})
  return models as unknown as LLMModel[]
}
