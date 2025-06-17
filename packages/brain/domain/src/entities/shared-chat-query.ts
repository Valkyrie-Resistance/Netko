import { z } from 'zod'
import { SharedChatIdSchema } from './shared-chat'
import { UserIdSchema } from './user'

export const SharedChatCursorSchema = z.object({
  createdAt: z.coerce.date(),
  id: SharedChatIdSchema,
})

export const SharedChatListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: SharedChatCursorSchema.optional(),
  userId: UserIdSchema,
})

export const SharedChatByShareIdInputSchema = z.object({
  shareId: SharedChatIdSchema,
})

export type SharedChatListInput = z.infer<typeof SharedChatListInputSchema>
export type SharedChatByShareIdInput = z.infer<typeof SharedChatByShareIdInputSchema>
export type SharedChatCursor = z.infer<typeof SharedChatCursorSchema>
