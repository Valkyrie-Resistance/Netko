import { z } from 'zod'

export const MessageListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: z.string().optional(),
})

export type MessageListInput = z.infer<typeof MessageListInputSchema>
