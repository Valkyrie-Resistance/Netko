import { router } from '../lib/trpc'
import { apiKeysRouter } from './api-keys'
import { authRouter } from './auth'
import { threadsRouter } from './threads'

export const appRouter = router({
  auth: authRouter,
  threads: threadsRouter,
  apiKeys: apiKeysRouter,
})

export type AppRouter = typeof appRouter
