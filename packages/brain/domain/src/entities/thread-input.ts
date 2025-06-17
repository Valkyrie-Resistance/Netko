import { z } from 'zod'

export const ThreadCreateInputSchema = z.object({
  title: z.string().optional(),
})

export const ThreadUpdateInputSchema = ThreadCreateInputSchema.partial()

export type ThreadCreateInput = z.infer<typeof ThreadCreateInputSchema>
export type ThreadUpdateInput = z.infer<typeof ThreadUpdateInputSchema>
