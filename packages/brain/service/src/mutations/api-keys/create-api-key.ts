import type { CreateApiKeyInput } from '@netko/brain-domain'
import { prisma } from '@netko/brain-repository'
import { encrypt } from '../../utils'

export const createApiKey = async (input: CreateApiKeyInput) => {
  const { provider, key, userId } = input

  const apiKey = await prisma.userApiKey.create({
    data: {
      provider,
      encryptedKey: encrypt(key),
      userId,
    },
  })

  return apiKey
}
