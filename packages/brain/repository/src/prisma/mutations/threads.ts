import {
  type Thread,
  type ThreadCreateInput,
  ThreadCreateInputSchema,
  ThreadSchema,
  type ThreadUpdateInput,
  ThreadUpdateInputSchema,
} from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type ThreadWithRelations = Prisma.ThreadGetPayload<{
  include: { user: true; assistant: true }
}>

export async function createThread(
  data: Omit<ThreadCreateInput, 'user' | 'assistant'> & { userId: string; assistantId: string },
): Promise<Thread> {
  const validatedData = ThreadCreateInputSchema.parse({
    ...data,
    user: {
      connect: {
        id: data.userId,
      },
    },
    assistant: {
      connect: {
        id: data.assistantId,
      },
    },
  })

  const thread = (await prisma.thread.create({
    data: validatedData,
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}

export async function updateThread(
  threadId: string,
  data: Omit<ThreadUpdateInput, 'assistant'> & { assistantId?: string },
): Promise<Thread | null> {
  const { assistantId, ...updateData } = data
  const validatedData = ThreadUpdateInputSchema.parse({
    ...updateData,
    ...(assistantId && {
      assistant: {
        connect: {
          id: assistantId,
        },
      },
    }),
  })

  const thread = (await prisma.thread.update({
    where: {
      id: threadId,
    },
    data: validatedData,
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}

export async function deleteThread(threadId: string): Promise<Thread | null> {
  const thread = (await prisma.thread.delete({
    where: {
      id: threadId,
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}
