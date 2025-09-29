import { prisma } from '@netko/claw-repository'
import { encrypt } from '../../utils'

export const updateApiKey = async (
  id: string,
  userId: string,
  updates: { key?: string; isActive?: boolean },
) => {
  const updateData: any = {}

  if (updates.key) {
    updateData.encryptedKey = encrypt(updates.key)
  }

  if (updates.isActive !== undefined) {
    updateData.isActive = updates.isActive
  }

  const apiKey = await prisma.userApiKey.update({
    where: {
      id,
      userId, // Ensure user can only update their own keys
    },
    data: updateData,
  })

  return apiKey
}
