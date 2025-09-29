import { router } from '../integrations/trpc/init'
import { apiKeysRouter } from './api-keys'
import { authRouter } from './auth'
import { modelsRouter } from './models'
import { threadsRouter } from './threads'

export const appRouter = router({
  auth: authRouter,
  threads: threadsRouter,
  apiKeys: apiKeysRouter,
  models: modelsRouter,
})

export type AppRouter = typeof appRouter
