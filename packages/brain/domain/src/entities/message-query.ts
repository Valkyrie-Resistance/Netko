import { z } from 'zod'

export const MessageCursorSchema = z.object({
  createdAt: z.string(),
  id: z.string().cuid(),
})

export const MessageListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: MessageCursorSchema.optional(),
})

export type MessageListInput = z.infer<typeof MessageListInputSchema>
export type MessageCursor = z.infer<typeof MessageCursorSchema>
