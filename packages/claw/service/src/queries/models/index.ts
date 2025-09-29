import type { LLMModel } from '@netko/claw-domain'
import { prisma } from '@netko/claw-repository'

export async function getActiveLLMModels(): Promise<LLMModel[]> {
  const models = await prisma.lLMModel.findMany({ where: { isActive: true } })
  return models as unknown as LLMModel[]
}

export async function getAllLLMModels(): Promise<LLMModel[]> {
  const models = await prisma.lLMModel.findMany({})
  return models as unknown as LLMModel[]
}
