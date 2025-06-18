import { AssistantIdSchema } from '@chad-chat/brain-domain'
import { AssistantQueries, getUserApiKeyByProvider } from '@chad-chat/brain-repository'
import { prisma } from '@chad-chat/brain-repository'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Message } from 'ai'
import { type StreamTextResult, streamText } from 'ai'
import { ModelSyncService } from './model-sync'

interface OpenRouterError {
  error?: string
  status?: number
  statusText?: string
}

export class LLMService {
  private static instance: LLMService

  private constructor() {}

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService()
    }
    return LLMService.instance
  }

  public async createLLM(
    assistantId: string,
    modelId: string,
    threadId: string,
    userId: string,
    messages: Message[],
  ): Promise<StreamTextResult<never, never>> {
    const validatedAssistantId = AssistantIdSchema.parse(assistantId)
    const assistant = await AssistantQueries.getAssistantById(validatedAssistantId, userId)
    if (!assistant) {
      throw new Error('Assistant not found')
    }

    const apiKey = await getUserApiKeyByProvider(userId, 'OPENROUTER')
    if (!apiKey) {
      throw new Error('User does not have an API key for OpenRouter')
    }

    if (!assistant.defaultModel || assistant.defaultModel.id !== modelId) {
      throw new Error('Invalid model selection for this assistant')
    }

    const modelSync = ModelSyncService.getInstance(apiKey)
    const isValidModel = await modelSync.validateModel(modelId)
    if (!isValidModel) {
      throw new Error('Invalid or inactive model')
    }

    const modelMetadata = await modelSync.getModelMetadata(modelId)
    if (!modelMetadata) {
      throw new Error('Failed to get model metadata')
    }

    try {
      const openrouter = createOpenRouter({
        apiKey,
      })
      const chatModel = openrouter.chat(modelId)
      const stream = await streamText({
        model: chatModel,
        messages: [
          {
            role: 'system',
            content: assistant.systemPrompt,
          },
          ...messages,
        ],
        temperature: assistant.temperature,
        maxTokens: assistant.maxTokens ?? undefined,
      })

      await prisma.$transaction(async (tx) => {
        const existingSystemMessage = await tx.message.findFirst({
          where: {
            threadId,
            role: 'SYSTEM',
          },
        })

        if (!existingSystemMessage) {
          await tx.message.create({
            data: {
              content: assistant.systemPrompt,
              role: 'SYSTEM',
              threadId,
              assistantId: validatedAssistantId,
              modelId,
              metadata: {
                contextLength: modelMetadata.contextLength,
                pricing: modelMetadata.pricing,
              },
            },
          })
        } else {
          const existingMetadata = existingSystemMessage.metadata as {
            contextLength?: number
            pricing?: { prompt: number; completion: number }
          } | null

          if (
            existingSystemMessage.content !== assistant.systemPrompt ||
            existingMetadata?.contextLength !== modelMetadata.contextLength ||
            JSON.stringify(existingMetadata?.pricing) !== JSON.stringify(modelMetadata.pricing)
          ) {
            await tx.message.update({
              where: { id: existingSystemMessage.id },
              data: {
                content: assistant.systemPrompt,
                metadata: {
                  contextLength: modelMetadata.contextLength,
                  pricing: modelMetadata.pricing,
                },
              },
            })
          }
        }
      })

      return stream
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error
      }
      const openRouterError = error as OpenRouterError
      throw new Error(
        `Failed to create LLM: ${openRouterError.error || openRouterError.statusText || 'Unknown error'}`,
      )
    }
  }
}
