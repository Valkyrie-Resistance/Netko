import { RedisCacheClient, redisCache, redisSubscriber } from '@netko/brain-repository'
import { tracked } from '@trpc/server/unstable-core-do-not-import'
import { z } from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

const subscriber = redisSubscriber
const cache = redisCache

// Configuration for subscription handling
const SUBSCRIPTION_CONFIG = {
  MAX_QUEUE_SIZE: 1000, // Prevent unbounded memory growth
  MESSAGE_TIMEOUT_MS: 30000, // 30 second timeout for messages
  RECONNECT_DELAY_MS: 5000, // 5 second delay before reconnect
  MAX_RECONNECT_ATTEMPTS: 5, // Maximum reconnection attempts
  CLEANUP_TIMEOUT_MS: 10000, // Cleanup timeout
} as const

// Enhanced subscription state management
interface SubscriptionState {
  isActive: boolean
  reconnectAttempts: number
  lastActivity: number
  messageCount: number
}

export const threadsSubscriptions = router({
  onThreadMessage: protectedProcedure
    .input(z.object({ threadId: z.string(), lastEventId: z.string().nullish() }))
    .subscription(async function* (opts) {
      const {
        ctx: { user },
        input: { threadId, lastEventId },
        signal, // AbortSignal for cleanup
      } = opts
      const channel = `thread:${threadId}:${user.id}:events`

      // Initialize subscription state
      const state: SubscriptionState = {
        isActive: true,
        reconnectAttempts: 0,
        lastActivity: Date.now(),
        messageCount: 0,
      }

      // Graceful cleanup function
      const cleanup = async () => {
        state.isActive = false
        try {
          subscriber.removeListener('message', messageHandler)
          subscriber.removeListener('error', errorHandler)
          await Promise.race([
            subscriber.unsubscribe(channel),
            new Promise((resolve) => setTimeout(resolve, SUBSCRIPTION_CONFIG.CLEANUP_TIMEOUT_MS)),
          ])
        } catch (error) {
          console.warn(`⚠️ Cleanup warning for channel ${channel}:`, error)
        }
      }

      // Register cleanup on signal abort
      signal?.addEventListener('abort', cleanup)

      try {
        // Fetch missed events with circuit breaker protection
        if (lastEventId) {
          const missedEvents = await RedisCacheClient.executeWithCircuitBreaker(async () =>
            cache.zrangebyscore(
              `thread:${threadId}:${user.id}:events`,
              `(${lastEventId}`,
              '+inf',
              'WITHSCORES',
            ),
          )

          for (let i = 0; i < missedEvents.length; i += 2) {
            if (!state.isActive) break

            try {
              const eventData = JSON.parse(missedEvents[i] ?? '')
              const timestamp = missedEvents[i + 1] ?? ''
              yield tracked(timestamp, eventData)
              state.messageCount++
            } catch (parseError) {
              console.error('🔴 Error parsing missed event:', parseError)
              yield tracked(Date.now().toString(), {
                type: 'error',
                error: 'Failed to parse missed event',
                details: parseError instanceof Error ? parseError.message : 'Unknown error',
              })
            }
          }
        }

        // Enhanced message queue with size limit
        const messageQueue: { channel: string; message: string; timestamp: number }[] = []
        let resolver: ((value: { channel: string; message: string }) => void) | null = null
        let messageTimeout: NodeJS.Timeout | null = null

        const messageHandler = (ch: string, message: string) => {
          if (ch !== channel || !state.isActive) return

          const payload = { channel: ch, message, timestamp: Date.now() }
          state.lastActivity = Date.now()

          if (resolver) {
            resolver({ channel: ch, message })
            resolver = null
            if (messageTimeout) {
              clearTimeout(messageTimeout)
              messageTimeout = null
            }
          } else {
            // Implement queue size limit to prevent memory leaks
            if (messageQueue.length >= SUBSCRIPTION_CONFIG.MAX_QUEUE_SIZE) {
              console.warn(`⚠️ Message queue full for channel ${channel}, dropping oldest message`)
              messageQueue.shift() // Remove oldest message
            }
            messageQueue.push(payload)
          }
        }

        const errorHandler = (error: Error) => {
          console.error(`🔴 Redis subscription error for channel ${channel}:`, error)
          state.isActive = false
        }

        subscriber.on('message', messageHandler)
        subscriber.on('error', errorHandler)
        try {
          await RedisCacheClient.executeWithCircuitBreaker(async () =>
            subscriber.subscribe(channel),
          )

          while (state.isActive && !signal?.aborted) {
            let payload: { channel: string; message: string }

            if (messageQueue.length > 0) {
              const queuedMessage = messageQueue.shift()
              if (!queuedMessage) continue
              payload = { channel: queuedMessage.channel, message: queuedMessage.message }
            } else {
              // Wait for message with timeout
              try {
                payload = await Promise.race([
                  new Promise<{ channel: string; message: string }>((resolve) => {
                    resolver = resolve
                    messageTimeout = setTimeout(() => {
                      resolver = null
                      resolve({ channel: '', message: '' }) // Empty message to continue loop
                    }, SUBSCRIPTION_CONFIG.MESSAGE_TIMEOUT_MS)
                  }),
                  // Also race against abort signal
                  ...(signal
                    ? [
                        new Promise<never>((_, reject) => {
                          signal.addEventListener('abort', () =>
                            reject(new Error('Subscription aborted')),
                          )
                        }),
                      ]
                    : []),
                ])

                if (messageTimeout) {
                  clearTimeout(messageTimeout)
                  messageTimeout = null
                }

                // Skip empty messages from timeout
                if (!payload.message) {
                  // Check if connection is still healthy
                  const healthStatus = RedisCacheClient.getHealthStatus()
                  if (!healthStatus.isHealthy) {
                    throw new Error('Redis connection unhealthy')
                  }
                  continue
                }
              } catch (_timeoutError) {
                if (signal?.aborted) break
                console.warn(`⚠️ Message timeout for channel ${channel}`)
                continue
              }
            }

            const { message } = payload

            try {
              const eventData = JSON.parse(message)
              yield tracked(eventData.timestamp?.toString() ?? Date.now().toString(), eventData)
              state.messageCount++
              state.lastActivity = Date.now()
            } catch (parseError) {
              console.error(`🔴 Error parsing message for channel ${channel}:`, parseError)
              yield tracked(Date.now().toString(), {
                type: 'error',
                error: 'Failed to parse message',
                details: parseError instanceof Error ? parseError.message : 'Unknown error',
              })
            }
          }
        } catch (error) {
          console.error(`💥 Subscription error for channel ${channel}:`, error)

          if (
            state.reconnectAttempts < SUBSCRIPTION_CONFIG.MAX_RECONNECT_ATTEMPTS &&
            state.isActive
          ) {
            state.reconnectAttempts++
            console.log(
              `🔄 Attempting reconnection ${state.reconnectAttempts}/${SUBSCRIPTION_CONFIG.MAX_RECONNECT_ATTEMPTS} for channel ${channel}`,
            )

            await new Promise((resolve) =>
              setTimeout(resolve, SUBSCRIPTION_CONFIG.RECONNECT_DELAY_MS),
            )
            // The generator will restart from the beginning if this throws
            throw error
          }
          // Max reconnect attempts reached or subscription was cancelled
          yield tracked(Date.now().toString(), {
            type: 'error',
            error: 'Subscription failed after maximum reconnection attempts',
            reconnectAttempts: state.reconnectAttempts,
          })
          throw error
        } finally {
          await cleanup()
          console.log(
            `🧹 Subscription cleanup completed for channel ${channel}. Messages processed: ${state.messageCount}`,
          )
        }
      } catch (error) {
        console.error(`🔴 Fatal subscription error for channel ${channel}:`, error)
        throw error
      }
    }),

  onTest: protectedProcedure.subscription(async function* (opts) {
    const {
      ctx: { user },
    } = opts
    console.log('🧪 Test subscription for user:', user.id)
    yield tracked('test', { user })
  }),
})
