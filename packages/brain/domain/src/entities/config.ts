import { z } from 'zod'

const _protoSocialProviderSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string(),
  clientSecret: z.string(),
})

const transformSocialProviderSchema = (data: z.infer<typeof _protoSocialProviderSchema>) => {
  if (!data.clientId || !data.clientSecret) {
    return undefined
  }
  return data
}

const _protoBrainConfigSchema = z.object({
  app: z.object({
    port: z.number().default(3001),
    cors: z.array(z.string()).default(['http://localhost:3001', 'http://localhost:5173']),
  }),
  db: z.object({
    url: z.string(),
  }),
  auth: z.object({
    secret: z.string().optional(),
    url: z.string().url(),
    emailAndPassword: z.object({
      enabled: z.boolean(),
    }),
    trustedOrigins: z.array(z.string()).default(['http://localhost:3001', 'http://localhost:5173']),
    socialProviders: z.object({
      github: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
      google: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
    }),
  }),
})

const brainSuperRefinement = (
  config: z.infer<typeof _protoBrainConfigSchema>,
  ctx: z.RefinementCtx,
) => {
  const enabledProviders = Object.entries(config.auth.socialProviders).filter(
    ([_, value]) => value?.enabled,
  )

  if (enabledProviders.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one authentication provider must be configured (GitHub or Google).',
      path: ['auth', 'socialProviders', 'github', 'google'],
      fatal: true,
    })
  }
}

export const BrainConfigSchema = _protoBrainConfigSchema.superRefine(brainSuperRefinement)
export type BrainConfig = z.infer<typeof BrainConfigSchema>
