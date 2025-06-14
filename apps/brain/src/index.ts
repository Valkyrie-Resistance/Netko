import { auth } from '@chad-chat/brain-service'
import { Elysia } from 'elysia'
import { corsPlugin, loggerPlugin, swaggerPlugin } from './plugins'

// * Creates the app
const app = new Elysia({
  name: 'Chad Chat Brain Service',
})

// TODO: fix for better-auth: https://github.com/better-auth/better-auth/issues/2959
// * Mounts the auth service
app.mount(auth.handler)

// * Loads logger and cors plugins
app.use(loggerPlugin)
app.use(corsPlugin)
app.use(swaggerPlugin)

// * Starts the server
app.listen(Number(process.env.PORT ?? 3001))
