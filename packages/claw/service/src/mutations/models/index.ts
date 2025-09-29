import type { LLMModel, ModelProvider } from '@netko/claw-domain'
import { prisma } from '@netko/claw-repository'

export async function createLLMModel(input: {
  name: string
  displayName: string
  provider: ModelProvider
  description?: string | null
  isActive?: boolean
  isPublic?: boolean
  author?: string
}): Promise<LLMModel> {
  const model = await prisma.lLMModel.create({
    data: {
      name: input.name,
      displayName: input.displayName,
      provider: input.provider,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
      isPublic: input.isPublic ?? false,
      authorId: input.author ?? null,
    },
  })
  // Types differ slightly between domain and prisma shape; rely on runtime compatibility
  return model as unknown as LLMModel
}

export async function updateLLMModel(
  id: string,
  updates: Partial<{
    name: string
    displayName: string
    provider: ModelProvider
    description: string | null
    isActive: boolean
    isPublic: boolean
    author: string
  }>,
): Promise<LLMModel> {
  const model = await prisma.lLMModel.update({
    where: { id },
    data: {
      ...updates,
      // map author -> authorId if present
      ...(updates.author !== undefined ? { authorId: updates.author } : {}),
    },
  })
  return model as unknown as LLMModel
}

export async function deleteLLMModel(id: string): Promise<LLMModel> {
  const existing = await prisma.lLMModel.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Model not found')
  }
  if (existing.isPublic) {
    throw new Error('Cannot delete a public model')
  }
  const model = await prisma.lLMModel.delete({ where: { id } })
  return model as unknown as LLMModel
}
