import { z } from 'zod'

export const SharedChatListInputSchema = z.object({
  limit: z.number().int().positive(),
  cursor: z.string().optional(),
  userId: z.string(),
})

export const SharedChatByShareIdInputSchema = z.object({
  shareId: z.string(),
})

export type SharedChatListInput = z.infer<typeof SharedChatListInputSchema>
export type SharedChatByShareIdInput = z.infer<typeof SharedChatByShareIdInputSchema> 