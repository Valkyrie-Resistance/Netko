import { LLMModelSchema } from '@netko/brain-domain'
import { getActiveLLMModels, getAllLLMModels } from '@netko/brain-service'
import z from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

export const modelsQueries = router({
  getActiveModels: protectedProcedure.output(z.array(LLMModelSchema)).query(async () => {
    return getActiveLLMModels()
  }),

  getAllModels: protectedProcedure.output(z.array(LLMModelSchema)).query(async () => {
    return getAllLLMModels()
  }),
})
