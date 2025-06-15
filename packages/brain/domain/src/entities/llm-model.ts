import { z } from 'zod'

export const LLMModelSchema = z
  .object({
    id: z.string().cuid(),
    name: z.string(),
    provider: z.string(),
    displayName: z.string(),
    isActive: z.boolean().default(false),
  })
  .strict()

export type LLMModel = z.infer<typeof LLMModelSchema>
