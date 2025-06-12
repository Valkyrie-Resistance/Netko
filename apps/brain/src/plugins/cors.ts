import { cors } from '@elysiajs/cors'

export const corsPlugin = cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
})
