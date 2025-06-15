import { z } from 'zod'

export const ThreadSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  userId: z.string(),
  assistantId: z.string(),
  parentId: z.string().nullable().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Thread = z.infer<typeof ThreadSchema>
