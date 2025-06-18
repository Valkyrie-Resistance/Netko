import { AssistantIdSchema } from '@chad-chat/brain-domain'
import { AssistantQueries, getUserApiKeyByProvider } from '@chad-chat/brain-repository'
import { prisma } from '@chad-chat/brain-repository'
import type { Message } from 'ai'
import { ModelSyncService } from './model-sync'

interface OpenRouterError {
  error?: string
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
  ): Promise<ReadableStream> {
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
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://chad-chat.vercel.app',
          'X-Title': 'Chad Chat',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: assistant.systemPrompt,
            },
            ...messages,
          ],
          temperature: assistant.temperature,
          max_tokens: assistant.maxTokens ?? undefined,
          stream: true,
        }),
      })

      if (!response.ok) {
        const error = (await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))) as OpenRouterError
        throw new Error(`Failed to create LLM: ${error.error || response.statusText}`)
      }

      const stream = response.body
      if (!stream) {
        throw new Error('Failed to get response stream')
      }

      await prisma.message.create({
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

      return stream
    } catch (error) {
      const openRouterError = error as OpenRouterError
      throw new Error(`Failed to create LLM: ${openRouterError.error || 'Unknown error'}`)
    }
  }
}
