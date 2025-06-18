import { PrismaClient } from '@chad-chat/brain-repository'

const prisma = new PrismaClient()

export const seed = async () => {
  try {
    await prisma.assistant.deleteMany({
      where: {
        name: 'Marvin',
      },
    })

    const marvinPromptPath = new URL(
      '../../../domain/src/values/prompts/marvin.md',
      import.meta.url,
    )
    const marvinPrompt = await Bun.file(marvinPromptPath).text()

    const marvin = await prisma.assistant.create({
      data: {
        name: 'Marvin',
        description:
          'A deeply depressed hyper-intelligent AI companion assistant with a cynical and sarcastic personality.',
        systemPrompt: marvinPrompt,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log('Assistant created:', {
      id: marvin.id,
      name: marvin.name,
      description: marvin.description,
    })
  } catch (error) {
    console.error('Error creating assistant:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
