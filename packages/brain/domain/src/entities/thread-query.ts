import { z } from 'zod'

export const ThreadCursorSchema = z.object({
  updatedAt: z.string(),
  id: z.string().cuid(),
})

export const ThreadListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: ThreadCursorSchema.optional(),
})

export const ThreadSearchInputSchema = ThreadListInputSchema.extend({
  query: z.string(),
})

export const ThreadWithMessagesCursorSchema = z.object({
  createdAt: z.string(),
  id: z.string().cuid(),
})

export const ThreadWithMessagesInputSchema = z.object({
  threadId: z.string(),
  userId: z.string(),
  limit: z.number().int().positive(),
  cursor: ThreadWithMessagesCursorSchema.optional(),
})

export const ThreadByAssistantInputSchema = ThreadListInputSchema.extend({
  assistantId: z.string(),
})

export type ThreadListInput = z.infer<typeof ThreadListInputSchema>
export type ThreadSearchInput = z.infer<typeof ThreadSearchInputSchema>
export type ThreadWithMessagesInput = z.infer<typeof ThreadWithMessagesInputSchema>
export type ThreadByAssistantInput = z.infer<typeof ThreadByAssistantInputSchema>
export type ThreadCursor = z.infer<typeof ThreadCursorSchema>
