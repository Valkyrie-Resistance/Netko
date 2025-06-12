import { prisma } from '@chad-chat/brain-repository'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { brainEnvConfig } from '../config/env'

export const auth = betterAuth({
  basePath: '/api',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  ...brainEnvConfig.auth,
})
