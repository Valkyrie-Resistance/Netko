import { z } from 'zod'

export const AssistantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  systemPrompt: z.string(),
  temperature: z.number().default(0.7),
  maxTokens: z.number().nullish(),
  isPublic: z.boolean().default(false),
  defaultModelId: z.string().nullish(),
  createdById: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Assistant = z.infer<typeof AssistantSchema>
