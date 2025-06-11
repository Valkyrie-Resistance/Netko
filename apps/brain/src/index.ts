import { auth } from '@chad-chat/brain-service'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .mount(auth.handler)
  .listen(Number(process.env.PORT ?? 3001))

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
