import { z } from 'zod'

export const AssistantSchema = z
  .object({
    id: z.string().cuid(),
    name: z.string(),
    description: z.string().nullish(),
    systemPrompt: z.string(),
    temperature: z.number().default(0.7),
    maxTokens: z.number().nullish(),
    isPublic: z.boolean().default(false),
    defaultModelId: z.string().cuid().nullish(),
    createdById: z.string().cuid().nullish(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .strict()

export type Assistant = z.infer<typeof AssistantSchema>
