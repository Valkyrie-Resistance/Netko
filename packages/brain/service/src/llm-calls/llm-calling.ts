import { UserIdSchema } from '@chad-chat/brain-domain'
import { prisma } from '@chad-chat/brain-repository'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Message } from 'ai'
import { type StreamTextResult, streamText } from 'ai'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export function createOpenRouterClient(apiKey: string) {
  return createOpenRouter({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
  })
}

export class LLMService {
  private static instances: Map<string, LLMService> = new Map()
  private readonly openRouterClient: ReturnType<typeof createOpenRouter>
  private readonly apiKey: string

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required')
    }
    this.apiKey = apiKey
    this.openRouterClient = createOpenRouterClient(apiKey)
  }

  static getInstance(apiKey: string): LLMService {
    const instance = LLMService.instances.get(apiKey)
    if (instance) {
      return instance
    }

    const newInstance = new LLMService(apiKey)
    LLMService.instances.set(apiKey, newInstance)
    return newInstance
  }

  private async getUserApiKey(userId: string): Promise<string> {
    const validatedUserId = UserIdSchema.parse(userId)

    const apiKey = await prisma.userApiKey.findFirst({
      where: {
        userId: validatedUserId,
        provider: 'OPENROUTER',
        isActive: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    })

    if (!apiKey) {
      throw new Error('No active API key found for user')
    }

    // Update lastUsedAt
    const oneHour = 60 * 60 * 1000
    const now = new Date()
    if (!apiKey.lastUsedAt || now.getTime() - apiKey.lastUsedAt.getTime() > oneHour) {
      try {
        await prisma.userApiKey.update({
          where: { id: apiKey.id },
          data: { lastUsedAt: now },
        })
      } catch (error) {
        console.error('Failed to update lastUsedAt for userApiKey:', apiKey.id, error)
      }
    }

    return apiKey.encryptedKey
  }

  async createLLM(
    assistantId: string,
    modelId: string,
    threadId: string,
    userId: string,
    messages: Message[],
  ): Promise<StreamTextResult<never, never>> {
    const apiKey = await this.getUserApiKey(userId)
    const llmService = LLMService.getInstance(apiKey)

    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      select: {
        id: true,
        systemPrompt: true,
      },
    })

    if (!assistant) {
      throw new Error('Assistant not found')
    }

    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      select: {
        id: true,
        name: true,
      },
    })

    if (!model) {
      throw new Error('Model not found')
    }

    const chatModel = llmService.openRouterClient.chat(model.name)

    const stream = await streamText({
      model: chatModel,
      messages: [
        {
          role: 'system',
          content: assistant.systemPrompt,
        },
        ...messages,
      ],
    })

    await prisma.message.create({
      data: {
        content: assistant.systemPrompt,
        role: 'SYSTEM',
        threadId,
        assistantId: assistant.id,
        modelId,
        metadata: {},
      },
    })

    return stream
  }
}
