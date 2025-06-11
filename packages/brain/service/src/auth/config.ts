import { prisma } from '@chad-chat/brain-repository'
import { env } from '@chad-chat/brain-service/env'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

const hasGithubCredentials = env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
const hasGoogleCredentials = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET

if (!hasGithubCredentials && !hasGoogleCredentials) {
  console.error(
    'No social provider credentials found. Please set environment variables for GitHub or Google.',
  )
  process.exit(1)
}

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {}

if (hasGithubCredentials) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID as string,
    clientSecret: env.GITHUB_CLIENT_SECRET as string,
  }
}
if (hasGoogleCredentials) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID as string,
    clientSecret: env.GOOGLE_CLIENT_SECRET as string,
  }
}

const config = {
  basePath: '/api',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders,
}

export const auth = betterAuth(config)
