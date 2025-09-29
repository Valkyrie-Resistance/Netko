import z from 'zod'

export const ModelProviderEnum = {
  OPENAI: 'OPENAI',
  OPENROUTER: 'OPENROUTER',
  OLLAMA: 'OLLAMA',
  CUSTOM: 'CUSTOM',
} as const

export type ModelProvider = (typeof ModelProviderEnum)[keyof typeof ModelProviderEnum]

export const ModelProviderSchema = z.nativeEnum(ModelProviderEnum)
