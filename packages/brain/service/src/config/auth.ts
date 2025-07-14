import { prisma } from '@netko/brain-repository'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { jwt } from 'better-auth/plugins'
import { brainEnvConfig } from '../../../../configs/brain-config/src/env'

export const auth = betterAuth({
  baseURL: brainEnvConfig.app.baseUrl,
  basePath: '/auth/api',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    jwt({
      jwt: {
        expirationTime: '1d',
      },
    }),
  ],
  ...brainEnvConfig.auth,
})
