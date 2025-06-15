import { z } from 'zod'

export const SharedChatSchema = z.object({
  id: z.string().cuid(),
  shareId: z.string().cuid(),
  threadId: z.string().cuid(),
  sharedById: z.string().cuid(),
  shareUpToMessageId: z.string().cuid().nullish(),
  isPublic: z.boolean().default(true),
  expiresAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
}).strict()

export type SharedChat = z.infer<typeof SharedChatSchema>
