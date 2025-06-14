import { cors } from '@elysiajs/cors'

export const corsPlugin = cors({
  origin: process.env.CORS_ORIGIN ?? ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
})
