import { redisCache, redisSubscriber } from '@netko/claw-repository'
import { tracked } from '@trpc/server/unstable-core-do-not-import'
import { z } from 'zod'
import { protectedProcedure, router } from '../../integrations/trpc/init'

const subscriber = redisSubscriber
const cache = redisCache

export const threadsSubscriptions = router({
  onThreadMessage: protectedProcedure
    .input(z.object({ threadId: z.string(), lastEventId: z.string().nullish() }))
    .subscription(async function* (opts) {
      const {
        ctx: { user },
        input: { threadId, lastEventId },
      } = opts
      const channel = `thread:${threadId}:${user.id}:events`

      if (lastEventId) {
        const missedEvents = await cache.zrangebyscore(
          `thread:${threadId}:${user.id}:events`,
          `(${lastEventId}`,
          '+inf',
          'WITHSCORES',
        )

        for (let i = 0; i < missedEvents.length; i += 2) {
          const raw = JSON.parse(missedEvents[i] ?? '')
          const timestamp = missedEvents[i + 1] ?? ''
          const eventData = normalizeEventPayload(raw)
          yield tracked(timestamp, eventData)
        }
      }

      const messageQueue: { channel: string; message: string }[] = []
      let resolver: ((value: { channel: string; message: string }) => void) | null = null

      const messageHandler = (ch: string, message: string) => {
        if (ch !== channel) return

        const payload = { channel: ch, message }
        if (resolver) {
          resolver(payload)
          resolver = null
        } else {
          messageQueue.push(payload)
        }
      }

      subscriber.on('message', messageHandler)

      try {
        await subscriber.subscribe(channel)

        while (true) {
          let payload: { channel: string; message: string }
          if (messageQueue.length > 0) {
            const shifted = messageQueue.shift()
            if (!shifted) {
              continue
            }
            payload = shifted
          } else {
            payload = await new Promise<{ channel: string; message: string }>((resolve) => {
              resolver = resolve
            })
          }

          const { message } = payload

          try {
            const raw = JSON.parse(message)
            const eventData = normalizeEventPayload(raw)
            yield tracked(eventData?.timestamp?.toString() ?? Date.now().toString(), eventData)
          } catch (parseError) {
            yield tracked(Date.now().toString(), { type: 'error', parseError })
          }
        }
      } catch (error) {
        console.error('💥 Subscription error:', error)
        throw error
      } finally {
        subscriber.removeListener('message', messageHandler)
        await subscriber.unsubscribe(channel)
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

// Ensure all outgoing events have properly typed fields
type EventPayload = {
  type: 'message_created' | 'message_streaming' | 'message_completed' | 'message_error' | string
  timestamp?: number | string
  messageId?: string
  content?: string
  message?: { createdAt?: string | number | Date } & Record<string, unknown>
  [key: string]: unknown
}

function normalizeEventPayload(event: EventPayload) {
  const type = event?.type
  const timestamp = Number(event?.timestamp ?? Date.now())
  const normalized: EventPayload = { ...event, timestamp }

  if (type === 'message_created' || type === 'message_completed') {
    if (event?.message) {
      normalized.message = {
        ...event.message,
        // createdAt can be ISO string or Date; normalize to Date for superjson
        createdAt: event.message.createdAt ? new Date(event.message.createdAt) : new Date(),
      }
    }
  }

  return normalized
}
