import type { Message, Thread } from '@netko/brain-domain'
import { genLLMMessage } from '../llm/gen-message'
import { createThread } from './create-thread'

export async function createThreadWithMessage(
  userId: string,
  assistantId: string,
  title: string,
  initialMessage: string,
  modelId: string,
  webSearchEnabled = false,
): Promise<{
  thread: Thread
  userMessage: Message
  assistantMessage: Message
}> {
  // 1. Create the thread
  const thread = await createThread(userId, assistantId, title, modelId)

  // 2. Generate the initial message exchange
  const messages = await genLLMMessage(
    thread.id,
    userId,
    initialMessage,
    modelId,
    assistantId,
    webSearchEnabled,
  )

  return {
    thread,
    userMessage: messages.userMessage,
    assistantMessage: messages.assistantMessage,
  }
}
