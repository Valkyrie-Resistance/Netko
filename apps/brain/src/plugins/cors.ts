import { brainEnvConfig } from '@chad-chat/brain-service'
import { cors } from '@elysiajs/cors'

export const corsPlugin = cors({
  origin: brainEnvConfig.app.cors,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
})
