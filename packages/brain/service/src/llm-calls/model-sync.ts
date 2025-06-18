import { prisma } from '@chad-chat/brain-repository'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

interface OpenRouterModel {
  id: string
  name: string
  displayName: string
  description?: string
  contextLength: number
  pricing: {
    prompt: number
    completion: number
  }
}

export class ModelSyncService {
  private static instances: Map<string, ModelSyncService> = new Map()
  private openrouter: ReturnType<typeof createOpenRouter>
  private apiKey: string

  private constructor(apiKey: string) {
    this.apiKey = apiKey
    this.openrouter = createOpenRouter({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }

  public static getInstance(apiKey: string): ModelSyncService {
    if (!ModelSyncService.instances.has(apiKey)) {
      ModelSyncService.instances.set(apiKey, new ModelSyncService(apiKey))
    }
    const instance = ModelSyncService.instances.get(apiKey)
    if (!instance) {
      throw new Error('Failed to create ModelSyncService instance')
    }
    return instance
  }

  public async syncModels(): Promise<void> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'HTTP-Referer': 'https://chad-chat.vercel.app',
          'X-Title': 'Chad Chat',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch models from OpenRouter')
      }

      const { data: models } = (await response.json()) as { data: OpenRouterModel[] }

      await prisma.$transaction(
        models.map((model) =>
          prisma.lLMModel.upsert({
            where: {
              provider_name: {
                provider: 'OPENROUTER',
                name: model.id,
              },
            },
            create: {
              name: model.id,
              provider: 'OPENROUTER',
              displayName: model.displayName,
              description: model.description,
              isActive: true,
              isDefault: false,
            },
            update: {
              displayName: model.displayName,
              description: model.description,
              isActive: true,
            },
          }),
        ),
      )
    } catch (error) {
      console.error('Failed to sync models:', error)
      throw error
    }
  }

  public async validateModel(modelId: string): Promise<boolean> {
    try {
      const model = await prisma.lLMModel.findUnique({
        where: {
          provider_name: {
            provider: 'OPENROUTER',
            name: modelId,
          },
        },
      })

      return !!model && model.isActive
    } catch (error) {
      console.error('Failed to validate model:', error)
      return false
    }
  }

  public async getModelMetadata(
    modelId: string,
  ): Promise<{ contextLength: number; pricing: { prompt: number; completion: number } } | null> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://chad-chat.vercel.app',
          'X-Title': 'Chad Chat',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch models from OpenRouter')
      }

      const { data: models } = (await response.json()) as { data: OpenRouterModel[] }
      const model = models.find((m) => m.id === modelId)

      if (!model) {
        return null
      }

      return {
        contextLength: model.contextLength,
        pricing: model.pricing,
      }
    } catch (error) {
      console.error('Failed to get model metadata:', error)
      return null
    }
  }
}
