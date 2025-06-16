import { z } from 'zod'
import { AssistantSchema } from './assistant'
import { UserSchema } from './user'

export const ThreadSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  user: UserSchema,
  assistant: AssistantSchema,
  parentId: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Thread = z.infer<typeof ThreadSchema>
