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

  const oneHour = 60 * 60 * 1000
  const now = new Date()
  if (!apiKey.lastUsedAt || now.getTime() - apiKey.lastUsedAt.getTime() > oneHour) {
    try {
      await prisma.userApiKey.update({
        where: {
          id: apiKey.id,
        },
        data: {
          lastUsedAt: now,
        },
      })
    } catch (error) {
      console.error('Failed to update lastUsedAt for userApiKey:', apiKey.id, error)
    }
  }

  return apiKey.encryptedKey
}
