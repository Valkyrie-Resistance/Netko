import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).strict()

export type User = z.infer<typeof UserSchema>
