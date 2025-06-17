import { z } from 'zod'
import { AssistantSchema } from './assistant'
import { LLMModelSchema } from './llm-model'
import { ThreadSchema } from './thread'
import { UserSchema } from './user'

export const MessageRoleEnum = z.enum(['USER', 'ASSISTANT', 'SYSTEM'])
export type MessageRole = z.infer<typeof MessageRoleEnum>

export const MessageIdSchema = z.string()
export type MessageId = z.infer<typeof MessageIdSchema>

export const MessageSchema = z.object({
  id: MessageIdSchema,
  content: z.string(),
  role: MessageRoleEnum,
  thread: ThreadSchema,
  user: UserSchema.nullish(),
  assistant: AssistantSchema.nullish(),
  model: LLMModelSchema.nullish(),
  parentId: MessageIdSchema.nullish(),
  tokenCount: z.number().int().nonnegative().nullish(),
  metadata: z.record(z.unknown()).nullish(),
  createdAt: z.coerce.date(),
})

export type Message = z.infer<typeof MessageSchema>
