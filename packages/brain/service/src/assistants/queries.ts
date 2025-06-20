import { AssistantQueries } from '@netko/brain-repository'

export const assistantService = {
  getAssistants: async (userId: string) => {
    return AssistantQueries.getAssistants(userId)
  },
}
