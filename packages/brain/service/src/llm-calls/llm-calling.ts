import { prisma } from "@chad-chat/brain-repository";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from 'ai';

export async  function callLLM(userId: string, assistantId: string, modelId: string, userMessage: string) {
  const model = await prisma.lLMModel.findUnique({
    where: {
      id: modelId,
    },
  })

  const assistant = await prisma.assistant.findUnique({
    where: {
      id: assistantId,
    },
  })

  if (!model || !assistant)  {
    throw new Error("Model or assistant not found")
  }

  const userKey = await prisma.userApiKey.findFirst({
    where: {
      userId: userId,
      provider: "OPENROUTER",
    },
  })

  if (!userKey) {
    throw new Error("User key not found")
  }

  const openrouter = createOpenRouter({
    apiKey: userKey.encryptedKey,
  });

  const stream = streamText({
    model: openrouter.chat(model.name),
    prompt: userMessage,
    system: assistant.systemPrompt,
  })

  return stream

}