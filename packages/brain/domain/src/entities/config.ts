import { z } from 'zod'

export const environmentSchema = z
  .object({
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    const hasGithub = env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    const hasGoogle = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET

    if (!hasGithub && !hasGoogle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one authentication provider must be configured (GitHub or Google).',
        path: [
          'GITHUB_CLIENT_ID',
          'GITHUB_CLIENT_SECRET',
          'GOOGLE_CLIENT_ID',
          'GOOGLE_CLIENT_SECRET',
        ],
        fatal: true,
      })
    }
  })
