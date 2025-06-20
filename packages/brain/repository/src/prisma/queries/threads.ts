import {
  AssistantIdSchema,
  type Thread,
  type ThreadByAssistantInput,
  ThreadByAssistantInputSchema,
  ThreadIdSchema,
  type ThreadListInput,
  ThreadListInputSchema,
  ThreadSchema,
  type ThreadSearchInput,
  ThreadSearchInputSchema,
  type ThreadWithMessagesInput,
  ThreadWithMessagesInputSchema,
  ThreadWithMessagesInThreadSchema,
  UserIdSchema,
} from '@netko/brain-domain'
import type { Prisma } from '../../../generated/prisma'
import { prisma } from '../client'

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
  const validatedUserId = UserIdSchema.parse(userId)

  const threads = await prisma.thread.findMany({
    where: {
      userId: validatedUserId,
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
  })

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
  const validatedUserId = UserIdSchema.parse(userId)

  const thread = await prisma.thread.findUnique({
    where: {
      threadCompoundId: {
        id: validatedThreadId,
        userId: validatedUserId,
      },
    },
    include: {
      user: true,
      assistant: true,
    },
  })

  return thread ? ThreadSchema.parse(thread) : null
}

export async function getThreadWithMessages(input: ThreadWithMessagesInput): Promise<{
  thread: Thread
  messages: Message[]
  nextCursor: { createdAt: string; id: string } | null
} | null> {
  const { threadId, userId, limit, cursor } = ThreadWithMessagesInputSchema.parse(input)
  const validatedThreadId = threadId
  const validatedUserId = UserIdSchema.parse(userId)

  const thread = await prisma.thread.findUnique({
    where: {
      threadCompoundId: {
        id: validatedThreadId,
        userId: validatedUserId,
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
  })

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
  userId: string,
  input: ThreadListInput,
  threadId: string,
): Promise<{
  messages: Message[]
  nextCursor: { createdAt: string; id: string } | null
}> {
  const validatedThreadId = ThreadIdSchema.parse(threadId)
  const { limit, cursor } = ThreadWithMessagesInThreadSchema.parse({
    threadId: validatedThreadId,
    ...input,
  })

  const validatedUserId = UserIdSchema.parse(userId)

  const messages = await prisma.message.findMany({
    where: {
      threadId: validatedThreadId,
      thread: {
        userId: validatedUserId,
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
  })

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
  const validatedUserId = UserIdSchema.parse(userId)

  const threads = await prisma.thread.findMany({
    where: {
      userId: validatedUserId,
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
  })

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
  const validatedUserId = UserIdSchema.parse(userId)
  const validatedAssistantId = AssistantIdSchema.parse(assistantId)

  const threads = await prisma.thread.findMany({
    where: {
      userId: validatedUserId,
      assistantId: validatedAssistantId,
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
  })

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

export async function searchThreadsByName(
  userId: string,
  name: string,
  limit: number,
): Promise<Thread[]> {
  const validatedUserId = UserIdSchema.parse(userId)

  const threads = await prisma.thread.findMany({
    where: {
      userId: validatedUserId,
      title: {
        contains: name,
        mode: 'insensitive',
      },
    },
    include: {
      user: true,
      assistant: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: limit,
  })

  return threads.map((thread) => ThreadSchema.parse(thread))
}

export async function getSidebarThreads(userId: string): Promise<{
  threads: Thread[]
  nextCursor: { updatedAt: string; id: string } | null
}> {
  const validatedUserId = UserIdSchema.parse(userId)

  const threads = await prisma.thread.findMany({
    where: {
      userId: validatedUserId,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
  })

  return {
    threads: threads.map((thread) => ThreadSchema.parse(thread)),
    nextCursor: null,
  }
}
