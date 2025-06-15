import { auth } from '@chad-chat/brain-service'
import { brainEnvConfig } from '@chad-chat/brain-service'
import { Elysia } from 'elysia'
import { router } from './lib/trpc'
import { corsPlugin, loggerPlugin, swaggerPlugin, trpcPlugin } from './plugins'
import { authRouter, threadsRouter } from './routes'

const app = new Elysia({
  name: 'Chad Chat Brain Service',
})

// TODO: fix for better-auth: https://github.com/better-auth/better-auth/issues/2959
app.mount(auth.handler)

//* Merge all routes
const appRouter = router({
  threads: threadsRouter,
  auth: authRouter,
})

// * Loads server plugins
app.use(loggerPlugin)
app.use(corsPlugin)
app.use(swaggerPlugin)
app.use(trpcPlugin(appRouter))

// * Starts the server
app.listen(brainEnvConfig.app.port)

//* Export the router
export type AppRouter = typeof appRouter
