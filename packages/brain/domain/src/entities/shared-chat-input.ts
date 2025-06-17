import { z } from 'zod'
import { MessageIdSchema } from './message'

export const SharedChatCreateInputSchema = z.object({
  isPublic: z.boolean().default(true),
  expiresAt: z.coerce.date().optional(),
  shareUpToMessageId: MessageIdSchema.nullish(),
})

export const SharedChatUpdateInputSchema = SharedChatCreateInputSchema.partial()

export type SharedChatCreateInput = z.infer<typeof SharedChatCreateInputSchema>
export type SharedChatUpdateInput = z.infer<typeof SharedChatUpdateInputSchema>
