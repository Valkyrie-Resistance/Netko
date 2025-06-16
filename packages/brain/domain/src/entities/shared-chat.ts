import { z } from 'zod'
import { UserSchema } from './user'

export const SharedChatSchema = z.object({
  id: z.string(),
  shareId: z.string(),
  thread: UserSchema,
  sharedBy: UserSchema,
  shareUpToMessageId: z.string().cuid().nullish(),
  isPublic: z.boolean(),
  expiresAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
})

export type SharedChat = z.infer<typeof SharedChatSchema>
