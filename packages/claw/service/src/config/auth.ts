import { prisma } from '@netko/claw-repository'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { jwt } from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'
import { brainEnvConfig } from '../../../../configs/brain-config/src/env'

export const auth = betterAuth({
  baseURL: brainEnvConfig.app.baseUrl,
  basePath: '/api/auth',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    jwt({
      jwt: {
        expirationTime: '1d',
      },
    }),
    reactStartCookies(),
  ],
  ...brainEnvConfig.auth,
})
