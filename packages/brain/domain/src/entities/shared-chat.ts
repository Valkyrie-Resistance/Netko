import { z } from 'zod'

export const SharedChatSchema = z.object({
  id: z.string(),
  shareId: z.string(),
  threadId: z.string(),
  sharedById: z.string(),
  shareUpToMessageId: z.string().nullish(),
  isPublic: z.boolean().default(true),
  expiresAt: z.date().nullish(),
  createdAt: z.date(),
})

export type SharedChat = z.infer<typeof SharedChatSchema>
