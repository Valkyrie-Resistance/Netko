import { z } from 'zod'

export const ThreadSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  userId: z.string(),
  assistantId: z.string(),
  parentId: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Thread = z.infer<typeof ThreadSchema>
