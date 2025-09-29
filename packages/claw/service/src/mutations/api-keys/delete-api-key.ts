import { prisma } from '@netko/claw-repository'

export const deleteApiKey = async (id: string, userId: string) => {
  const apiKey = await prisma.userApiKey.delete({
    where: {
      id,
      userId, // Ensure user can only delete their own keys
    },
  })

  return apiKey
}
