import { z } from 'zod'
import { ModelProviderSchema } from '../../values'

export const CreateApiKeyInputSchema = z.object({
  provider: ModelProviderSchema,
  key: z.string(),
  userId: z.string(),
})

export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>
