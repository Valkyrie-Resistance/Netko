import { z } from 'zod'
import { AssistantIdSchema } from './assistant'
import { ThreadIdSchema } from './thread'
import { UserIdSchema } from './user'

export const ThreadCursorSchema = z.object({
  updatedAt: z.coerce.date(),
  id: ThreadIdSchema,
})

export const ThreadSearchSchemaInput = z.object({
  query: z.string(),
})

export const ThreadListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: ThreadCursorSchema.optional(),
})

export const ThreadSearchInputSchema = ThreadListInputSchema.extend({
  query: z.string(),
})

export const ThreadWithMessagesCursorSchema = z.object({
  createdAt: z.coerce.date(),
  id: ThreadIdSchema,
})

export const ThreadWithMessagesInputSchema = z.object({
  threadId: ThreadIdSchema,
  userId: UserIdSchema,
  limit: z.number().int().positive(),
  cursor: ThreadWithMessagesCursorSchema.optional(),
})

export const ThreadWithMessagesInThreadSchema = z.object({
  threadId: ThreadIdSchema,
  limit: z.number().int().positive(),
  cursor: ThreadWithMessagesCursorSchema.optional(),
})
export const ThreadByAssistantInputSchema = ThreadListInputSchema.extend({
  assistantId: AssistantIdSchema,
})

export type ThreadListInput = z.infer<typeof ThreadListInputSchema>
export type ThreadSearchInput = z.infer<typeof ThreadSearchInputSchema>
export type ThreadWithMessagesInput = z.infer<typeof ThreadWithMessagesInputSchema>
export type ThreadByAssistantInput = z.infer<typeof ThreadByAssistantInputSchema>
export type ThreadCursor = z.infer<typeof ThreadCursorSchema>
