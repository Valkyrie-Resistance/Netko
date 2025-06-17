import { z } from 'zod'

export const AssistantCursorSchema = z.object({
  updatedAt: z.string(),
  id: z.string().cuid(),
})

export const AssistantListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: AssistantCursorSchema.optional(),
  userId: z.string(),
})

export const AssistantSearchInputSchema = AssistantListInputSchema.extend({
  query: z.string(),
})

export type AssistantListInput = z.infer<typeof AssistantListInputSchema>
export type AssistantSearchInput = z.infer<typeof AssistantSearchInputSchema>
export type AssistantCursor = z.infer<typeof AssistantCursorSchema>
