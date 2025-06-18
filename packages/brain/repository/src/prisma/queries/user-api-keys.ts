import { UserIdSchema } from '@chad-chat/brain-domain'
import { prisma } from '../client'

export async function getUserApiKeyByProvider(
  userId: string,
  provider: 'OPENAI' | 'OPENROUTER' | 'OLLAMA' | 'CUSTOM',
): Promise<string | null> {
  const validatedUserId = UserIdSchema.parse(userId)

  const apiKey = await prisma.userApiKey.findFirst({
    where: {
      userId: validatedUserId,
      provider,
      isActive: true,
    },
    orderBy: {
      lastUsedAt: 'desc',
    },
  })

  if (!apiKey) {
    return null
  }

  await prisma.userApiKey.update({
    where: {
      id: apiKey.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  })

  return apiKey.encryptedKey
} 