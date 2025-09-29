import type { Message } from '@netko/claw-domain'
import { prisma, redisCache, redisPublisher } from '@netko/claw-repository'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { getMessagesByThreadId } from '../../queries/messages/get-messages-by-thread-id'
import { decrypt } from '../../utils'
import { createMessage } from '../messages/create-message'

export async function genLLMMessage(
  threadId: string,
  userId: string,
  message: string,
  model: string,
  assistantId: string,
  webSearchEnabled = false,
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  try {
    // 1. Create the user message first
    const userMessage = await createMessage(threadId, message, 'USER', userId)

    // 2. Publish user message to Redis for real-time updates
    const channel = `thread:${threadId}:${userId}:events`
    const timestamp = Date.now()
    const userMessageEvent = {
      type: 'message_created',
      messageId: userMessage.id,
      message: userMessage,
      timestamp,
    }

    await redisPublisher.publish(channel, JSON.stringify(userMessageEvent))
    await redisCache.zadd(
      `thread:${threadId}:${userId}:events`,
      timestamp,
      JSON.stringify(userMessageEvent),
    )

    // 6. Create the assistant message using direct Prisma call (initially empty)
    const assistantMessage = await prisma.message.create({
      data: {
        threadId,
        content: '', // Empty content initially
        role: 'ASSISTANT',
        userId, // Associate assistant message with the user
        assistantId,
        modelId: model,
      },
    })

    // 7. Publish assistant message creation event
    const assistantMessageCreateTime = Date.now()
    const assistantMessageEvent = {
      type: 'message_created',
      messageId: assistantMessage.id,
      message: assistantMessage,
      timestamp: assistantMessageCreateTime,
    }

    await redisPublisher.publish(channel, JSON.stringify(assistantMessageEvent))
    await redisCache.zadd(
      `thread:${threadId}:${userId}:events`,
      assistantMessageCreateTime,
      JSON.stringify(assistantMessageEvent),
    )

    // Fire-and-forget the rest of the logic
    ;(async () => {
      try {
        // 3. Get user's OpenRouter API key
        const userApiKey = await prisma.userApiKey.findFirst({
          where: {
            userId,
            provider: 'OPENROUTER',
            isActive: true,
          },
        })

        if (!userApiKey) {
          console.error('❌ No active OpenRouter API key found for user:', userId)
          throw new Error('No active OpenRouter API key found for user')
        }

        const decryptedApiKey = decrypt(userApiKey.encryptedKey)

        // 4. Get assistant details for system prompt
        const assistant = await prisma.assistant.findUnique({
          where: { id: assistantId },
        })

        if (!assistant) {
          console.error('❌ Assistant not found:', assistantId)
          throw new Error('Assistant not found')
        }

        // 5. Get LLM model details
        const llmModel = await prisma.lLMModel.findUnique({
          where: { id: model },
        })

        if (!llmModel) {
          console.error('❌ LLM model not found:', model)
          throw new Error('LLM model not found')
        }

        // 8. Get conversation history for context (last 10 messages, excluding the current user message)
        const allMessages = await getMessagesByThreadId(threadId, userId)
        const messagesBeforeCurrent = allMessages.filter((msg) => msg.id !== userMessage.id)
        const last10Messages = messagesBeforeCurrent
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .slice(-10)

        // 9. Format messages for LLM conversation context
        const conversationMessages = last10Messages.map((msg) => ({
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
        }))

        // Add the current user message to the conversation
        conversationMessages.push({
          role: 'user' as const,
          content: message,
        })

        // 10. Stream AI response using OpenRouter with conversation context
        const openrouter = createOpenRouter({
          apiKey: decryptedApiKey,
        })

        const modelNameForOpenRouter = webSearchEnabled ? `${llmModel.name}:online` : llmModel.name

        const result = await streamText({
          model: openrouter(modelNameForOpenRouter),
          system: assistant.systemPrompt,
          messages: conversationMessages,
          temperature: 0.7,
          maxTokens: 2048,
        })

        let fullContent = ''
        let lastUpdateTime = Date.now()
        const updateInterval = 100 // Update every 100ms to avoid overwhelming Redis

        // 11. Stream the response and publish incremental updates
        for await (const delta of result.textStream) {
          fullContent += delta

          // Throttle updates to avoid overwhelming Redis
          const now = Date.now()
          if (now - lastUpdateTime >= updateInterval) {
            const streamUpdateEvent = {
              type: 'message_streaming',
              messageId: assistantMessage.id,
              content: fullContent,
              isComplete: false,
              timestamp: now,
            }

            await redisPublisher.publish(channel, JSON.stringify(streamUpdateEvent))
            await redisCache.zadd(
              `thread:${threadId}:${userId}:events`,
              now,
              JSON.stringify(streamUpdateEvent),
            )

            lastUpdateTime = now
          }
        }

        // 12. Get final usage data and update the assistant message with complete content
        const usage = await result.usage
        const finishReason = await result.finishReason

        const updatedAssistantMessage = await prisma.message.update({
          where: { id: assistantMessage.id },
          data: {
            content: fullContent,
            metadata: {
              model: llmModel.name,
              tokensUsed: usage?.totalTokens || 0,
              promptTokens: usage?.promptTokens || 0,
              completionTokens: usage?.completionTokens || 0,
              finishReason: finishReason || 'unknown',
            },
          },
        })

        // 13. Publish final message completion event
        const completionTime = Date.now()
        const messageCompletionEvent = {
          type: 'message_completed',
          messageId: updatedAssistantMessage.id,
          message: updatedAssistantMessage,
          content: fullContent,
          timestamp: completionTime,
        }

        await redisPublisher.publish(channel, JSON.stringify(messageCompletionEvent))
        await redisCache.zadd(
          `thread:${threadId}:${userId}:events`,
          completionTime,
          JSON.stringify(messageCompletionEvent),
        )

        // 14. Update API key last used timestamp
        await prisma.userApiKey.update({
          where: { id: userApiKey.id },
          data: { lastUsedAt: new Date() },
        })
      } catch (error) {
        console.error('💥 Error in background LLM generation:', error)
        // Optionally, publish an error event to the channel
        const errorTime = Date.now()
        const errorEvent = {
          type: 'message_error',
          messageId: assistantMessage.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: errorTime,
        }
        await redisPublisher.publish(channel, JSON.stringify(errorEvent))
        await redisCache.zadd(
          `thread:${threadId}:${userId}:events`,
          errorTime,
          JSON.stringify(errorEvent),
        )
      }
    })().catch(console.error)

    // Parse the messages with the schema before returning
    const parsedUserMessage = {
      id: userMessage.id,
      content: userMessage.content,
      role: userMessage.role,
      metadata: userMessage.metadata,
      createdAt: userMessage.createdAt,
    } as Message

    const parsedAssistantMessage = {
      id: assistantMessage.id,
      content: assistantMessage.content,
      role: assistantMessage.role,
      metadata: assistantMessage.metadata,
      createdAt: assistantMessage.createdAt,
    } as Message

    return {
      userMessage: parsedUserMessage,
      assistantMessage: parsedAssistantMessage,
    }
  } catch (error) {
    console.error('💥 Error in genLLMMessage:', error)
    throw error
  }
}
