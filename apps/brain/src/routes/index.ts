import { router } from '../lib/trpc'
import { authRouter } from './auth'
import { threadsRouter } from './threads'

export const appRouter = router({
  auth: authRouter,
  threads: threadsRouter,
})

export type AppRouter = typeof appRouter
