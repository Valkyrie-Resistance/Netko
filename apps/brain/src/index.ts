import { auth } from '@chad-chat/brain-service'
import { Elysia } from 'elysia'
import { corsPlugin, loggerPlugin, swaggerPlugin } from './plugins'

// * Creates the app
const app = new Elysia({
  name: 'Chad Chat Brain Service',
})

// * Loads logger and cors plugins
app.use(loggerPlugin)
app.use(corsPlugin)
app.use(swaggerPlugin)

// * Mounts the auth service
app.mount(auth.handler)

// ! tmp fix for better-auth: https://github.com/better-auth/better-auth/issues/2959
app.get('*', () => 'not found')
app.post('*', () => 'not found')
app.put('*', () => 'not found')
app.delete('*', () => 'not found')
app.patch('*', () => 'not found')
app.options('*', () => 'not found')
app.head('*', () => 'not found')

// * Starts the server
app.listen(Number(process.env.PORT ?? 3001))
