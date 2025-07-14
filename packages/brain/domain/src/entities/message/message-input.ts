import { z } from 'zod'
import { MessageRoleEnum } from './message'

export const MessageCreateInputSchema = z.object({
  content: z.string(),
  role: z.nativeEnum(MessageRoleEnum),
  tokenCount: z.number().int().nonnegative().optional(),
  metadata: z.any().optional(),
})

export const MessageUpdateInputSchema = MessageCreateInputSchema.partial()

export type MessageCreateInput = z.infer<typeof MessageCreateInputSchema>
export type MessageUpdateInput = z.infer<typeof MessageUpdateInputSchema>
