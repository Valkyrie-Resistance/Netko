import { prisma } from '@chad-chat/brain-repository'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Message } from 'ai'
import { type StreamTextResult, streamText } from 'ai'

interface OpenRouterError {
  error?: string
  status?: number
  statusText?: string
}

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

  async createLLM(
    assistantId: string,
    modelId: string,
    threadId: string,
    userId: string,
    messages: Message[],
  ): Promise<StreamTextResult<never, never>> {
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

    const validatedAssistantId = assistant.id
    const chatModel = this.openRouterClient.chat(model.name)

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
            metadata: {},
          },
        })
      } else if (existingSystemMessage.content !== assistant.systemPrompt) {
        await tx.message.update({
          where: { id: existingSystemMessage.id },
          data: {
            content: assistant.systemPrompt,
            metadata: {},
          },
        })
      }
    })

    return stream
  }
}
