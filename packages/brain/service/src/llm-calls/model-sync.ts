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
    request: number
    image?: number
    webSearch?: number
    internalReasoning?: number
    inputCacheRead?: number
    inputCacheWrite?: number
  }
  architecture?: {
    inputModalities: string[]
    outputModalities: string[]
    tokenizer: string
    instructType: string | null
  }
  supportedParameters?: string[]
}

interface InternalModel {
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

type ModelsCache = {
  models: InternalModel[]
  fetchedAt: number
}

const MODELS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const INSTANCE_TTL = 30 * 60 * 1000 // 30 minutes

type ModelSyncInstance = {
  service: ModelSyncService
  lastAccessed: number
}

export class ModelSyncService {
  private static instances: Map<string, ModelSyncInstance> = new Map()
  private openrouter: ReturnType<typeof createOpenRouter>
  private apiKey: string
  private modelsCache: ModelsCache = { models: [], fetchedAt: 0 }

  private constructor(apiKey: string) {
    this.apiKey = apiKey
    this.openrouter = createOpenRouter({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }

  public static getInstance(apiKey: string): ModelSyncService {
    const now = Date.now()

    for (const [key, instance] of ModelSyncService.instances.entries()) {
      if (now - instance.lastAccessed > INSTANCE_TTL) {
        ModelSyncService.instances.delete(key)
      }
    }

    if (!ModelSyncService.instances.has(apiKey)) {
      ModelSyncService.instances.set(apiKey, {
        service: new ModelSyncService(apiKey),
        lastAccessed: now,
      })
    }

    const instance = ModelSyncService.instances.get(apiKey)
    if (!instance) {
      throw new Error('Failed to create ModelSyncService instance')
    }

    instance.lastAccessed = now
    return instance.service
  }

  private async fetchModels(): Promise<InternalModel[]> {
    const now = Date.now()
    if (this.modelsCache.models.length > 0 && now - this.modelsCache.fetchedAt < MODELS_CACHE_TTL) {
      return this.modelsCache.models
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://chad-chat.vercel.app',
          'X-Title': 'Chad Chat',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
      }

      const data = (await response.json()) as { data: OpenRouterModel[] }

      // Validate the response data
      if (!Array.isArray(data.data)) {
        throw new Error('Invalid response format from OpenRouter API')
      }

      // Transform the data to match our internal model structure
      const models = data.data.map((model) => ({
        id: model.id,
        name: model.name,
        displayName: model.name, // Using name as displayName since it's human-readable
        description: model.description,
        contextLength: model.contextLength,
        pricing: {
          prompt: Number(model.pricing.prompt) || 0,
          completion: Number(model.pricing.completion) || 0,
        },
      }))

      this.modelsCache = { models, fetchedAt: now }
      return models
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error fetching models from OpenRouter:', errorMessage)
      throw new Error(`Failed to fetch models: ${errorMessage}`)
    }
  }

  public async syncModels(): Promise<void> {
    try {
      const models = await this.fetchModels()

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

      for (const model of models) {
        await prisma.message.upsert({
          where: {
            messageCompoundId: {
              id: model.id,
              threadId: 'model-metadata',
            },
          },
          create: {
            content: JSON.stringify({
              contextLength: model.contextLength,
              pricing: model.pricing,
            }),
            role: 'SYSTEM',
            threadId: 'model-metadata',
            modelId: model.id,
            metadata: {
              contextLength: model.contextLength,
              pricing: model.pricing,
            },
          },
          update: {
            content: JSON.stringify({
              contextLength: model.contextLength,
              pricing: model.pricing,
            }),
            metadata: {
              contextLength: model.contextLength,
              pricing: model.pricing,
            },
          },
        })
      }
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
      const recentMessage = await prisma.message.findFirst({
        where: {
          modelId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          metadata: true,
        },
      })

      if (recentMessage?.metadata) {
        const metadata = recentMessage.metadata as {
          contextLength: number
          pricing: { prompt: number; completion: number }
        }
        if (metadata.contextLength && metadata.pricing) {
          return metadata
        }
      }

      const models = await this.fetchModels()
      const openRouterModel = models.find((m) => m.id === modelId)

      if (!openRouterModel) {
        return null
      }

      return {
        contextLength: openRouterModel.contextLength,
        pricing: openRouterModel.pricing,
      }
    } catch (error) {
      console.error('Failed to get model metadata:', error)
      return null
    }
  }
}
