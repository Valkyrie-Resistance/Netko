import { z } from 'zod'
import { SessionAuthSchema, UserAuthSchema } from './auth'

export const ContextSchema = z.object({
  user: UserAuthSchema.nullable(),
  session: SessionAuthSchema.nullable(),
})

export type Context = z.infer<typeof ContextSchema>
