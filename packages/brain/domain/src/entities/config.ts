import { z } from 'zod'

const _protoSocialProviderSchema = z.object({
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
  auth: z.object({
    emailAndPassword: z.object({
      enabled: z.boolean(),
    }),
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
  const availableProviders = Object.entries(config.auth.socialProviders).filter(
    ([_, value]) => value?.clientId && value?.clientSecret,
  )

  if (availableProviders.length === 0) {
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
