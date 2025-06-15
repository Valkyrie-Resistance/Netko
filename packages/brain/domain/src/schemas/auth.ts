import { z } from 'zod'
import { UserSchema } from '../entities/user'

export const UserAuthSchema = UserSchema
export type UserAuth = z.infer<typeof UserAuthSchema>

export const SessionAuthSchema = z.object({
  id: z.string().uuid(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SessionAuth = z.infer<typeof SessionAuthSchema>
