import { z } from 'zod'
import { ModelProviderSchema } from '../../values'

export const ApiKeySchema = z.object({
  id: z.string(),
  provider: ModelProviderSchema,
  encryptedKey: z.string(),
  isActive: z.boolean(),
  lastUsedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ApiKey = z.infer<typeof ApiKeySchema>
