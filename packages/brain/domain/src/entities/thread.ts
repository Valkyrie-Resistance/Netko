import { z } from 'zod'
import { AssistantSchema } from './assistant'
import { UserSchema } from './user'

export const ThreadIdSchema = z.string()
export type ThreadId = z.infer<typeof ThreadIdSchema>

export const ThreadSchema = z.object({
  id: ThreadIdSchema,
  title: z.string().nullish(),
  user: UserSchema.optional(),
  assistant: AssistantSchema.optional(),
  parentId: ThreadIdSchema.nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Thread = z.infer<typeof ThreadSchema>
