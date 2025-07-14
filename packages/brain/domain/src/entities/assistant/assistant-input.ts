import { z } from 'zod'

export const AssistantCreateInputSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  systemPrompt: z.string(),
  temperature: z.number(),
  maxTokens: z.number().nullish(),
  isPublic: z.boolean(),
})

export const AssistantUpdateInputSchema = AssistantCreateInputSchema.partial()

export type AssistantCreateInput = z.infer<typeof AssistantCreateInputSchema>
export type AssistantUpdateInput = z.infer<typeof AssistantUpdateInputSchema>
