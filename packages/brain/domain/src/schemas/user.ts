import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
})

export const sessionSchema = z.object({
  user: userSchema.nullable(),
})

export type User = z.infer<typeof userSchema>
export type Session = z.infer<typeof sessionSchema>
