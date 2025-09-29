import { z } from 'zod'

export const UserIdSchema = z.string()

export const UserSchema = z.object({
  id: UserIdSchema,
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>
