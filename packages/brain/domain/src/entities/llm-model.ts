import { z } from 'zod'

export const LLMModelIdSchema = z.string()

export const LLMModelSchema = z.object({
  id: LLMModelIdSchema,
  name: z.string(),
  //TODO: Add enum for model provider to make it a bound set of values
  // e.g., OpenAI, HuggingFace, etc.
  provider: z.string(),
  displayName: z.string(),
  isActive: z.boolean(),
})

export type LLMModel = z.infer<typeof LLMModelSchema>
