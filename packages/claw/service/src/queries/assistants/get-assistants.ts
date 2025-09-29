import { prisma } from '@netko/claw-repository'

export async function getAssistants(userId: string) {
  return prisma.assistant.findMany({
    where: {
      OR: [
        {
          isPublic: true,
        },
        {
          createdById: userId,
        },
      ],
    },
  })
}
