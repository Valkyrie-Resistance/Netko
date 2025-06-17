import { z } from 'zod'

export const SharedChatCursorSchema = z.object({
  createdAt: z.string(),
  id: z.string().cuid(),
})

export const SharedChatListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: SharedChatCursorSchema.optional(),
  userId: z.string(),
})

export const SharedChatByShareIdInputSchema = z.object({
  shareId: z.string(),
})

export type SharedChatListInput = z.infer<typeof SharedChatListInputSchema>
export type SharedChatByShareIdInput = z.infer<typeof SharedChatByShareIdInputSchema>
export type SharedChatCursor = z.infer<typeof SharedChatCursorSchema>
