import { prisma } from '@chad-chat/brain-repository'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

interface OpenRouterModel {
  id: string
  name: string
  displayName: string
  description: string
  architecture: {
    inputModalities: string[]
    outputModalities: string[]
    instructType: string
  }
  supportedParameters: string[]
}

interface InternalModel {
  id: string
  name: string
  displayName: string
  description: string
}

interface ModelsCache {
  models: InternalModel[]
  timestamp: number
}

interface ModelSyncInstance {
  service: ModelSyncService
  lastAccessed: number
}

const MODELS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const INSTANCE_TTL = 30 * 60 * 1000 // 30 minutes

export function createOpenRouterClient(apiKey: string) {
  return createOpenRouter({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
  })
}

export class ModelSyncService {
  private static instances: Map<string, ModelSyncInstance> = new Map()
  private modelsCache: ModelsCache | null = null
  private readonly openRouterClient: ReturnType<typeof createOpenRouter>
  private readonly apiKey: string

  private constructor(apiKey: string) {
    this.apiKey = apiKey
    this.openRouterClient = createOpenRouterClient(apiKey)
  }

  static getInstance(apiKey: string): ModelSyncService {
    const now = Date.now()

    for (const [key, instance] of ModelSyncService.instances.entries()) {
      if (now - instance.lastAccessed > INSTANCE_TTL) {
        ModelSyncService.instances.delete(key)
      }
    }

    const instance = ModelSyncService.instances.get(apiKey)
    if (instance) {
      instance.lastAccessed = now
      return instance.service
    }

    const newInstance = {
      service: new ModelSyncService(apiKey),
      lastAccessed: now,
    }
    ModelSyncService.instances.set(apiKey, newInstance)
    return newInstance.service
  }

  private async fetchModels(): Promise<InternalModel[]> {
    if (this.modelsCache && Date.now() - this.modelsCache.timestamp < MODELS_CACHE_TTL) {
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

      if (!Array.isArray(data.data)) {
        throw new Error('Invalid response format from OpenRouter API')
      }

      const models = data.data.map((model: OpenRouterModel) => ({
        id: model.id,
        name: model.name,
        displayName: model.name,
        description: model.description || '',
      }))

      this.modelsCache = {
        models,
        timestamp: Date.now(),
      }

      return models
    } catch (error) {
      console.error('Error fetching models from OpenRouter:', error)
      throw error
    }
  }

  async syncModels(): Promise<void> {
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
            content: JSON.stringify({}),
            role: 'SYSTEM',
            threadId: 'model-metadata',
            modelId: model.id,
            metadata: {},
          },
          update: {
            content: JSON.stringify({}),
            metadata: {},
          },
        })
      }
    } catch (error) {
      console.error('Failed to sync models:', error)
      throw error
    }
  }

  async validateModel(modelId: string): Promise<boolean> {
    const models = await this.fetchModels()
    return models.some((model) => model.id === modelId)
  }

  async getModelMetadata(modelId: string): Promise<Record<string, unknown> | null> {
    const recentMessage = await prisma.message.findFirst({
      where: {
        threadId: 'model-metadata',
        role: 'SYSTEM',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (recentMessage?.metadata) {
      return recentMessage.metadata as Record<string, unknown>
    }

    const models = await this.fetchModels()
    const openRouterModel = models.find((m) => m.id === modelId)
    if (!openRouterModel) {
      return null
    }

    return {}
  }
}
