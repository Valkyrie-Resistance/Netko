import { type Thread, ThreadSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type ThreadWithRelations = Prisma.ThreadGetPayload<{
  include: { user: true; assistant: true }
}>

export const threadMutations = {
  create: async (
    userId: string,
    assistantId: string,
    title?: string,
    parentId?: string,
  ): Promise<Thread> => {
    const thread = (await prisma.thread.create({
      data: {
        title,
        user: {
          connect: {
            id: userId,
          },
        },
        assistant: {
          connect: {
            id: assistantId,
          },
        },
        ...(parentId && {
          parent: {
            connect: {
              id: parentId,
            },
          },
        }),
      },
      include: {
        user: true,
        assistant: true,
      },
    })) as ThreadWithRelations

    return ThreadSchema.parse(thread)
  },

  update: async (
    threadId: string,
    userId: string,
    data: {
      title?: string
      assistantId?: string
    },
  ): Promise<Thread | null> => {
    const { assistantId, ...updateData } = data
    const thread = (await prisma.thread.update({
      where: {
        id: threadId,
        userId,
      },
      data: {
        ...updateData,
        ...(assistantId && {
          assistant: {
            connect: {
              id: assistantId,
            },
          },
        }),
      },
      include: {
        user: true,
        assistant: true,
      },
    })) as ThreadWithRelations

    return ThreadSchema.parse(thread)
  },

  delete: async (threadId: string, userId: string): Promise<Thread | null> => {
    const thread = (await prisma.thread.delete({
      where: {
        id: threadId,
        userId,
      },
      include: {
        user: true,
        assistant: true,
      },
    })) as ThreadWithRelations

    return ThreadSchema.parse(thread)
  },
}
