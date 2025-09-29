import { z } from 'zod'

export const MessageRoleEnum = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
  SYSTEM: 'SYSTEM',
} as const
export type MessageRole = (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum]

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: z.nativeEnum(MessageRoleEnum),
  metadata: z.any().optional(),
  createdAt: z.date(),
})

export type Message = z.infer<typeof MessageSchema>
