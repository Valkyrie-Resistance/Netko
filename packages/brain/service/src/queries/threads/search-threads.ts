import { prisma } from '@netko/brain-repository'

export async function searchThreads(userId: string, input: string) {
  return prisma.thread.findMany({
    where: {
      userId,
      title: {
        contains: input,
        mode: 'insensitive',
      },
    },
  })
}
