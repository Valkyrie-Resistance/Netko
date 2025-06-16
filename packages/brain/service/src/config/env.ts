import { type BrainConfig, BrainConfigSchema } from '@chad-chat/brain-domain'

const isEnabled = (args: (string | undefined)[]): boolean => {
  return args.every((arg) => arg !== undefined && arg !== '')
}

const brainConfig: BrainConfig = {
  app: {
    baseUrl: process.env.BASE_URL,
    port: Number(process.env.PORT),
    cors: process.env.CORS?.split(',') ?? undefined,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    // TODO: enable email and password auth
    emailAndPassword: {
      enabled: false,
    },
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') ?? [],
    socialProviders: {
      // * undefined values are converted to empty strings to avoid better-auth errors
      github: {
        enabled: isEnabled([process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET]),
        clientId: process.env.GITHUB_CLIENT_ID ?? '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      },
      google: {
        enabled: isEnabled([process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET]),
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      },
    },
  },
}

export const brainEnvConfig = BrainConfigSchema.parse(brainConfig)
