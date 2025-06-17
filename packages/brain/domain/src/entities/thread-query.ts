import { z } from 'zod'

export const ThreadListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: z.string().optional(),
})

export const ThreadSearchInputSchema = ThreadListInputSchema.extend({
  query: z.string(),
})

export const ThreadWithMessagesInputSchema = ThreadListInputSchema.extend({
  threadId: z.string(),
  userId: z.string(),
})

export const ThreadByAssistantInputSchema = ThreadListInputSchema.extend({
  assistantId: z.string(),
})

export type ThreadListInput = z.infer<typeof ThreadListInputSchema>
export type ThreadSearchInput = z.infer<typeof ThreadSearchInputSchema>
export type ThreadWithMessagesInput = z.infer<typeof ThreadWithMessagesInputSchema>
export type ThreadByAssistantInput = z.infer<typeof ThreadByAssistantInputSchema>
