import { prisma } from '@chad-chat/brain-repository'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

type EnvironmentMode = 'warn' | 'throw' | 'silent'

const getEnv = (key: string, mode: EnvironmentMode = 'warn'): string | undefined => {
  const value = process.env[key]
  if (!value) {
    const message = `Environment variable ${key} missing or empty.`
    if (mode === 'warn') {
      console.warn(`Environment variable ${key} is not set.`)
    } else if (mode === 'throw') {
      throw new Error(`Environment variable ${key} is required but not set.`)
    }
    return undefined
  }
  return value
}

const githubClientId = process.env.GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

const hasGithubCredentials = githubClientId && githubClientSecret
const hasGoogleCredentials = googleClientId && googleClientSecret

if (!hasGithubCredentials || !hasGoogleCredentials) {
  console.error(
    'No social provider credentials found. Please set environment variables for GitHub or Google.',
  )
  process.exit(1)
}

export const auth = betterAuth({
  basePath: '/api',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
})
