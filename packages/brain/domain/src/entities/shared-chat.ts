import { z } from 'zod'

export const SharedChatSchema = z.object({
  id: z.string(),
  shareId: z.string(),
  threadId: z.string(),
  sharedById: z.string(),
  shareUpToMessageId: z.string().cuid().nullish(),
  isPublic: z.boolean(),
  expiresAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
})

export type SharedChat = z.infer<typeof SharedChatSchema>
