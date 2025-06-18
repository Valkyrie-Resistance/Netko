import { z } from 'zod'
import { LLMModelSchema } from './llm-model'
import { UserSchema } from './user'

export const AssistantIdSchema = z.string()
export type AssistantId = z.infer<typeof AssistantIdSchema>

export const AssistantSchema = z.object({
  id: AssistantIdSchema,
  name: z.string(),
  description: z.string().nullish(),
  systemPrompt: z.string(),
  maxTokens: z.number().nullish(),
  isPublic: z.boolean(),
  defaultModel: LLMModelSchema.nullish(),
  createdByUser: UserSchema.nullish(),
  createdAt: z.any().nullish(),
  updatedAt: z.any().nullish(),
})

export type Assistant = z.infer<typeof AssistantSchema>
