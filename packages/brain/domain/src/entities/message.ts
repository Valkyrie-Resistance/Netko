import { z } from 'zod'

export const MessageRoleEnum = z.enum(['USER', 'ASSISTANT', 'SYSTEM'])
export type MessageRole = z.infer<typeof MessageRoleEnum>

export const MessageSchema = z.object({
  id: z.string().cuid(),
  content: z.string(),
  role: MessageRoleEnum,
  threadId: z.string(),
  userId: z.string().cuid().nullish(),
  assistantId: z.string().cuid().nullish(),
  modelId: z.string().cuid().nullish(),
  parentId: z.string().cuid().nullish(),
  tokenCount: z.number().int().nonnegative().nullish(),
  metadata: z.record(z.unknown()).nullish(),
  createdAt: z.coerce.date(),
}).strict()

export type Message = z.infer<typeof MessageSchema>
