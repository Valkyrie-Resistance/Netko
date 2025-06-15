import { z } from 'zod'

export const MessageRoleEnum = z.enum(['USER', 'ASSISTANT', 'SYSTEM'])
export type MessageRole = z.infer<typeof MessageRoleEnum>

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: MessageRoleEnum,
  threadId: z.string(),
  userId: z.string().nullish(),
  assistantId: z.string().nullish(),
  modelId: z.string().nullish(),
  parentId: z.string().nullish(),
  tokenCount: z.number().int().nonnegative().nullish(),
  metadata: z.record(z.unknown()).nullish(),
  createdAt: z.coerce.date(),
})

export type Message = z.infer<typeof MessageSchema>
