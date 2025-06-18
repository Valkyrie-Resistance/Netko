import { z } from 'zod'
import { AssistantIdSchema } from './assistant'
import { UserIdSchema } from './user'

export const AssistantCursorSchema = z.object({
  updatedAt: z.coerce.date(),
  id: AssistantIdSchema,
})

export const AssistantListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: AssistantCursorSchema.optional(),
  userId: UserIdSchema,
})

export const AssistantSearchInputSchema = AssistantListInputSchema.extend({
  query: z.string(),
})

export type AssistantListInput = z.infer<typeof AssistantListInputSchema>
export type AssistantSearchInput = z.infer<typeof AssistantSearchInputSchema>
export type AssistantCursor = z.infer<typeof AssistantCursorSchema>
