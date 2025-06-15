import { type BrainConfig, BrainConfigSchema } from '@chad-chat/brain-domain'

const brainConfig: BrainConfig = {
  auth: {
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      // * undefined values are converted to empty strings to avoid better-auth errors
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      },
    },
  },
}

export const brainEnvConfig = BrainConfigSchema.parse(brainConfig)
