import { z } from 'zod'

const SharedChatBaseSchema = z.object({
  isPublic: z.boolean().default(true),
  expiresAt: z.coerce.date().optional(),
  shareUpToMessageId: z.string().cuid().optional(),
})

export const SharedChatCreateInputSchema = SharedChatBaseSchema.extend({
  thread: z.object({
    connect: z.object({
      id: z.string(),
    }),
  }),
  sharedBy: z.object({
    connect: z.object({
      id: z.string(),
    }),
  }),
})

export const SharedChatUpdateInputSchema = SharedChatBaseSchema.partial()

export type SharedChatCreateInput = z.infer<typeof SharedChatCreateInputSchema>
export type SharedChatUpdateInput = z.infer<typeof SharedChatUpdateInputSchema>
