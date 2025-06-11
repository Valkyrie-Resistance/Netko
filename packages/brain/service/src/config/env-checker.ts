import { environmentSchema } from '@chad-chat/brain-domain/env-schema'

const parsedEnv = environmentSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsedEnv.data
