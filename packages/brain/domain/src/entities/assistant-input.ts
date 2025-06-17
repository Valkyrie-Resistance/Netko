import { z } from 'zod'

const AssistantBaseSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  systemPrompt: z.string(),
  temperature: z.number().default(0.7),
  maxTokens: z.number().nullish(),
  isPublic: z.boolean().default(false),
})

export const AssistantCreateInputSchema = AssistantBaseSchema.extend({
  defaultModel: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
  createdBy: z.object({
    connect: z.object({
      id: z.string(),
    }),
  }),
})

export const AssistantUpdateInputSchema = AssistantBaseSchema.partial().extend({
  defaultModel: z
    .object({
      connect: z.object({
        id: z.string(),
      }),
    })
    .optional(),
})

export type AssistantCreateInput = z.infer<typeof AssistantCreateInputSchema>
export type AssistantUpdateInput = z.infer<typeof AssistantUpdateInputSchema>
