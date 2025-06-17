import {
  AssistantIdSchema,
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

export async function addUserToThread(threadId: string, userId: string): Promise<Thread> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const validatedUserId = ThreadIdSchema.parse(userId)

  const thread = (await prisma.thread.update({
    where: {
      id: validatedThreadId,
    },
    data: {
      userId: validatedUserId,
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}

export async function addAssistantToThread(threadId: string, assistantId: string): Promise<Thread> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const validatedAssistantId = AssistantIdSchema.parse(assistantId)

  const thread = (await prisma.thread.update({
    where: {
      id: validatedThreadId,
    },
    data: {
      assistantId: validatedAssistantId,
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}

export async function addParentToThread(threadId: string, parentId: string): Promise<Thread> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const validatedParentId = ThreadIdSchema.parse(parentId)

  const thread = (await prisma.thread.update({
    where: {
      id: validatedThreadId,
    },
    data: {
      parentId: validatedParentId,
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations

  return ThreadSchema.parse(thread)
}

export async function createThread(
  data: Omit<ThreadCreateInput, 'user' | 'assistant'> & { userId: string; assistantId: string },
): Promise<Thread> {
  const validatedData = ThreadCreateInputSchema.parse(data)

  // Create thread with required relationships for Prisma
  const thread = (await prisma.thread.create({
    data: {
      ...validatedData,
      userId: data.userId,
      assistantId: data.assistantId,
    },
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
): Promise<Thread> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const { assistantId, ...updateData } = data
  const validatedData = ThreadUpdateInputSchema.parse(updateData)

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

  if (assistantId) {
    return addAssistantToThread(thread.id, assistantId)
  }

  return ThreadSchema.parse(thread)
}

export async function deleteThread(threadId: string): Promise<Thread> {
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
