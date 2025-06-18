import { AssistantQueries } from '@chad-chat/brain-repository'

export const assistantService = {
  getAssistants: async (userId: string) => {
    return AssistantQueries.getAssistants(userId)
  },
}
