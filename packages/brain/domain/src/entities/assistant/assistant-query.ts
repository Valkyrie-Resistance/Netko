import { z } from 'zod'
import { UserIdSchema } from '../user/user'
import { AssistantIdSchema } from './assistant'

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
