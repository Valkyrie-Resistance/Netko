import { z } from 'zod'

export const ThreadSchema = z.object({
  id: z.string().cuid(),
  title: z.string().nullish(),
  userId: z.string().cuid(),
  assistantId: z.string().cuid(),
  parentId: z.string().cuid().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).strict()

export type Thread = z.infer<typeof ThreadSchema>
