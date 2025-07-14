import { redisCache, redisSubscriber } from '@netko/brain-repository'
import { tracked } from '@trpc/server/unstable-core-do-not-import'
import { z } from 'zod'
import { protectedProcedure, router } from '../../lib/trpc'

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
          const eventData = JSON.parse(missedEvents[i] ?? '')
          const timestamp = missedEvents[i + 1] ?? ''
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
            payload = messageQueue.shift()!
          } else {
            payload = await new Promise<{ channel: string; message: string }>((resolve) => {
              resolver = resolve
            })
          }

          const { message } = payload

          try {
            const eventData = JSON.parse(message)
            yield tracked(eventData.timestamp.toString(), eventData)
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
