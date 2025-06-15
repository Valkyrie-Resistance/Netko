import { z } from 'zod'

export const LLMModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  displayName: z.string(),
  isActive: z.boolean().default(true),
})

export type LLMModel = z.infer<typeof LLMModelSchema>
