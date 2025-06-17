import { type Thread, ThreadSchema } from '@chad-chat/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

type ThreadWithRelations = Prisma.ThreadGetPayload<{
  include: { user: true; assistant: true }
}>

type Message = Prisma.MessageGetPayload<{
  select: {
    id: true
    content: true
    role: true
    createdAt: true
  }
}>

export async function getAllThreads(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<{
  threads: Thread[]
  nextCursor: string | null
}> {
  const threads = (await prisma.thread.findMany({
    where: {
      userId,
    },
    include: {
      user: true,
      assistant: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  })) as ThreadWithRelations[]

  const nextCursor = threads.length > limit ? (threads.pop()?.id ?? null) : null

  return {
    threads: threads.map((thread) => ThreadSchema.parse(thread)),
    nextCursor,
  }
}

export async function getThreadById(threadId: string, userId: string): Promise<Thread | null> {
  const thread = (await prisma.thread.findUnique({
    where: {
      id: threadId,
      userId,
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations | null

  return thread ? ThreadSchema.parse(thread) : null
}

export async function getThreadWithMessages(
  threadId: string,
  userId: string,
  limit: number,
  cursor?: string,
): Promise<{
  thread: Thread
  messages: Message[]
  nextCursor: string | null
} | null> {
  const thread = (await prisma.thread.findUnique({
    where: {
      id: threadId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
        },
      },
    },
  })) as (ThreadWithRelations & { messages: Message[] }) | null

  if (!thread) {
    return null
  }

  const nextCursor = thread.messages.length > limit ? (thread.messages.pop()?.id ?? null) : null

  return {
    thread: ThreadSchema.parse(thread),
    messages: thread.messages,
    nextCursor,
  }
}

export async function getMessagesInThread(
  threadId: string,
  userId: string,
  limit: number,
  cursor?: string,
): Promise<{
  messages: Message[]
  nextCursor: string | null
}> {
  const messages = (await prisma.message.findMany({
    where: {
      threadId,
      thread: {
        userId,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      id: true,
      content: true,
      role: true,
      createdAt: true,
    },
  })) as Message[]

  const nextCursor = messages.length > limit ? (messages.pop()?.id ?? null) : null

  return {
    messages,
    nextCursor,
  }
}

export async function searchThreads(
  userId: string,
  query: string,
  limit: number,
  cursor?: string,
): Promise<{
  threads: Thread[]
  nextCursor: string | null
}> {
  const threads = (await prisma.thread.findMany({
    where: {
      userId,
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: {
      user: true,
      assistant: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  })) as ThreadWithRelations[]

  const nextCursor = threads.length > limit ? (threads.pop()?.id ?? null) : null

  return {
    threads: threads.map((thread) => ThreadSchema.parse(thread)),
    nextCursor,
  }
}

export async function getThreadsByAssistant(
  userId: string,
  assistantId: string,
  limit: number,
  cursor?: string,
): Promise<{
  threads: Thread[]
  nextCursor: string | null
}> {
  const threads = (await prisma.thread.findMany({
    where: {
      userId,
      assistantId,
    },
    include: {
      user: true,
      assistant: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  })) as ThreadWithRelations[]

  const nextCursor = threads.length > limit ? (threads.pop()?.id ?? null) : null

  return {
    threads: threads.map((thread) => ThreadSchema.parse(thread)),
    nextCursor,
  }
}
