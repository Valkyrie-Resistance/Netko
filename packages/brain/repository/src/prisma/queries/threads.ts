import {
  type Thread,
  type ThreadByAssistantInput,
  ThreadByAssistantInputSchema,
  ThreadIdSchema,
  type ThreadListInput,
  ThreadListInputSchema,
  ThreadSchema,
  type ThreadSearchInput,
  ThreadSearchInputSchema,
  ThreadWithMessagesInThreadSchema,
  type ThreadWithMessagesInput,
  ThreadWithMessagesInputSchema,
} from '@chad-chat/brain-domain'
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
  input: ThreadListInput,
): Promise<{
  threads: Thread[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const { limit, cursor } = ThreadListInputSchema.parse(input)

  const threads = (await prisma.thread.findMany({
    where: {
      userId,
    },
    include: {
      user: true,
      assistant: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: new Date(cursor.updatedAt),
          id: cursor.id,
        }
      : undefined,
  })) as ThreadWithRelations[]

  const nextCursor =
    threads.length > limit
      ? {
          updatedAt: threads[limit]?.updatedAt.toISOString() ?? '',
          id: threads[limit]?.id ?? '',
        }
      : null
  const page = threads.slice(0, limit)
  return {
    threads: page.map((thread) => ThreadSchema.parse(thread)),
    nextCursor,
  }
}

export async function getThreadById(threadId: string, userId: string): Promise<Thread | null> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const thread = (await prisma.thread.findUnique({
    where: {
      threadCompoundId: {
        id: validatedThreadId,
        userId: userId,
      },
    },
    include: {
      user: true,
      assistant: true,
    },
  })) as ThreadWithRelations | null

  return thread ? ThreadSchema.parse(thread) : null
}

export async function getThreadWithMessages(input: ThreadWithMessagesInput): Promise<{
  thread: Thread
  messages: Message[]
  nextCursor: { createdAt: string; id: string } | null
} | null> {
  const { threadId, userId, limit, cursor } = ThreadWithMessagesInputSchema.parse(input)
  const validatedThreadId = ThreadIdSchema.parse(threadId)

  const thread = (await prisma.thread.findUnique({
    where: {
      threadCompoundId: {
        id: validatedThreadId,
        userId: userId,
      },
    },
    include: {
      messages: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            }
          : undefined,
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

  const nextCursor =
    thread.messages.length > limit
      ? {
          createdAt: thread.messages[limit]?.createdAt.toISOString() ?? '',
          id: thread.messages[limit]?.id ?? '',
        }
      : null
  const page = thread.messages.slice(0, limit)

  return {
    thread: ThreadSchema.parse(thread),
    messages: page,
    nextCursor,
  }
}

export async function getMessagesInThread(
  threadId: string,
  userId: string,
  input: ThreadListInput,
): Promise<{
  messages: Message[]
  nextCursor: { createdAt: string; id: string } | null
}> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const { limit, cursor } = ThreadWithMessagesInThreadSchema.parse(input)

  const messages = (await prisma.message.findMany({
    where: {
      threadId: validatedThreadId,
      thread: {
        userId,
      },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          createdAt: new Date(cursor.createdAt),
          id: cursor.id,
        }
      : undefined,
    select: {
      id: true,
      content: true,
      role: true,
      createdAt: true,
    },
  })) as Message[]

  const nextCursor =
    messages.length > limit
      ? {
          createdAt: messages[limit]?.createdAt.toISOString() ?? '',
          id: messages[limit]?.id ?? '',
        }
      : null
  const page = messages.slice(0, limit)

  return {
    messages: page,
    nextCursor,
  }
}

export async function searchThreads(
  userId: string,
  input: ThreadSearchInput,
): Promise<{
  threads: Thread[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const { limit, cursor, query } = ThreadSearchInputSchema.parse(input)

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
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: new Date(cursor.updatedAt),
          id: cursor.id,
        }
      : undefined,
  })) as ThreadWithRelations[]

  const nextCursor =
    threads.length > limit
      ? {
          updatedAt: threads[limit]?.updatedAt.toISOString() ?? '',
          id: threads[limit]?.id ?? '',
        }
      : null
  const page = threads.slice(0, limit)
  return {
    threads: page.map((thread) => ThreadSchema.parse(thread)),
    nextCursor,
  }
}

export async function getThreadsByAssistant(
  userId: string,
  input: ThreadByAssistantInput,
): Promise<{
  threads: Thread[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const { limit, cursor, assistantId } = ThreadByAssistantInputSchema.parse(input)

  const threads = (await prisma.thread.findMany({
    where: {
      userId,
      assistantId,
    },
    include: {
      user: true,
      assistant: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? {
          updatedAt: new Date(cursor.updatedAt),
          id: cursor.id,
        }
      : undefined,
  })) as ThreadWithRelations[]

  const nextCursor =
    threads.length > limit
      ? {
          updatedAt: threads[limit]?.updatedAt.toISOString() ?? '',
          id: threads[limit]?.id ?? '',
        }
      : null
  const page = threads.slice(0, limit)
  return {
    threads: page.map((thread) => ThreadSchema.parse(thread)),
    nextCursor,
  }
}
