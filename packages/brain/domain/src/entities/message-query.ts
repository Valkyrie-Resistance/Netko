import { z } from 'zod'
import { MessageIdSchema } from './message'

export const MessageCursorSchema = z.object({
  createdAt: z.coerce.date(),
  id: MessageIdSchema,
})

export const MessageListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: MessageCursorSchema.optional(),
})

export type MessageListInput = z.infer<typeof MessageListInputSchema>
export type MessageCursor = z.infer<typeof MessageCursorSchema>
