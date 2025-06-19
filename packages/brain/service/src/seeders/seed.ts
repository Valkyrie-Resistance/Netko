import { PrismaClient } from '@chad-chat/brain-repository'
import { brainEnvConfig } from '../config/env'

const prisma = new PrismaClient()

export const seed = async () => {
  try {
    // Use a more reliable path resolution for Docker containers
    const marvinPromptPath = !brainEnvConfig.app.dev
      ? '/app/packages/brain/domain/src/values/prompts/marvin.md'
      : new URL('../../../domain/src/values/prompts/marvin.md', import.meta.url).pathname

    const marvinPrompt = await Bun.file(marvinPromptPath).text()

    await prisma.assistant.upsert({
      where: {
        id: 'y3javtpp7g9j9c6xxlg7g8qn',
      },
      update: {},
      create: {
        id: 'y3javtpp7g9j9c6xxlg7g8qn',
        name: 'Marvin',
        description:
          'A deeply depressed hyper-intelligent AI companion assistant with a cynical and sarcastic personality.',
        systemPrompt: marvinPrompt,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    await prisma.lLMModel.upsert({
      where: {
        id: 'cmc23woxs000208l78rlo42qv',
      },
      update: {},
      create: {
        id: 'cmc23woxs000208l78rlo42qv',
        name: 'gpt-4o-mini',
        description: 'GPT-4o-mini',
        provider: 'OPENROUTER',
        displayName: 'GPT-4o-mini',
      },
    })

    await prisma.lLMModel.upsert({
      where: {
        id: 'cmc23we9s000008l853hf6mi5',
      },
      update: {},
      create: {
        id: 'cmc23we9s000008l853hf6mi5',
        name: 'google/gemini-2.5-flash-lite-preview-06-17',
        description: 'Gemini 2.5 Flash Lite',
        provider: 'OPENROUTER',
        displayName: 'Gemini 2.5 Flash Lite',
      },
    })
  } catch (error) {
    console.error('Error creating assistant:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
