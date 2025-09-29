import { LLMModelSchema } from '@netko/claw-domain'
import { getActiveLLMModels, getAllLLMModels } from '@netko/claw-service'
import z from 'zod'
import { protectedProcedure, router } from '../../integrations/trpc/init'

export const modelsQueries = router({
  getActiveModels: protectedProcedure.output(z.array(LLMModelSchema)).query(async () => {
    return getActiveLLMModels()
  }),

  getAllModels: protectedProcedure.output(z.array(LLMModelSchema)).query(async () => {
    return getAllLLMModels()
  }),
})
