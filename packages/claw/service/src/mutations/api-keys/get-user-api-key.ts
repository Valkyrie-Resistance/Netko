import type { ModelProvider } from '@netko/claw-domain'
import { prisma } from '@netko/claw-repository'
import { decrypt } from '../../utils'

export const getUserApiKey = async (userId: string, provider: ModelProvider) => {
  const apiKey = await prisma.userApiKey.findFirst({
    where: {
      userId,
      provider,
    },
  })

  return apiKey
}

export const getUserApiKeys = async (userId: string) => {
  const apiKeys = await prisma.userApiKey.findMany({
    where: {
      userId,
    },
  })

  return apiKeys.map((key) => ({
    ...key,
    encryptedKey: decrypt(key.encryptedKey),
  }))
}
