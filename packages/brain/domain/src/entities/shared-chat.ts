import { z } from 'zod'
import { ThreadSchema } from './thread'
import { UserSchema } from './user'

export const SharedChatIdSchema = z.string()
export type SharedChatId = z.infer<typeof SharedChatIdSchema>

export const SharedChatSchema = z.object({
  id: SharedChatIdSchema,
  shareId: z.string(),
  thread: ThreadSchema,
  sharedBy: UserSchema,
  shareUpToMessageId: z.string().nullish(),
  isPublic: z.boolean(),
  expiresAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
})

export type SharedChat = z.infer<typeof SharedChatSchema>
