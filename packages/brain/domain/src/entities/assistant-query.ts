import { z } from 'zod'

export const AssistantListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: z.string().optional(),
  userId: z.string(),
})

export const AssistantSearchInputSchema = AssistantListInputSchema.extend({
  query: z.string(),
})

export type AssistantListInput = z.infer<typeof AssistantListInputSchema>
export type AssistantSearchInput = z.infer<typeof AssistantSearchInputSchema>
