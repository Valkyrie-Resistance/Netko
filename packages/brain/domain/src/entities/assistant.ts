import { z } from 'zod'
import { LLMModelSchema } from './llm-model'
import { UserSchema } from './user'

export const AssistantIdSchema = z.string().cuid()
export type AssistantId = z.infer<typeof AssistantIdSchema>

export const AssistantSchema = z.object({
  id: AssistantIdSchema,
  name: z.string(),
  description: z.string().nullish(),
  systemPrompt: z.string(),
  temperature: z.number(),
  maxTokens: z.number().nullish(),
  isPublic: z.boolean(),
  defaultModel: LLMModelSchema.nullish(),
  createdByUser: UserSchema.nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Assistant = z.infer<typeof AssistantSchema>
