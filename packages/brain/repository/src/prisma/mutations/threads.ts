import {
  type Thread,
  type ThreadCreateInput,
  ThreadCreateInputSchema,
  ThreadIdSchema,
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
  const validatedUserId = ThreadIdSchema.parse(data.userId)
  const validatedAssistantId = ThreadIdSchema.parse(data.assistantId)
  const validatedData = ThreadCreateInputSchema.parse({
    ...data,
    user: {
      connect: {
        id: validatedUserId,
      },
    },
    assistant: {
      connect: {
        id: validatedAssistantId,
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
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const { assistantId, ...updateData } = data
  const validatedData = ThreadUpdateInputSchema.parse({
    ...updateData,
    ...(assistantId && {
      assistant: {
        connect: {
          id: ThreadIdSchema.parse(assistantId),
        },
      },
    }),
  })

  const thread = (await prisma.thread.update({
    where: {
      id: validatedThreadId,
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
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const thread = (await prisma.thread.delete({
    where: {
      id: validatedThreadId,
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}
