import { OpenAPI } from '@chad-chat/brain-service'
import { swagger } from '@elysiajs/swagger'

export const swaggerPlugin = swagger({
  documentation: {
    info: {
      title: 'Brain Service',
      version: '1.0.0',
      description: 'Development API for Chad Chat Brain Service',
    },
    openapi: '3.0.0',
    components: await OpenAPI.components,
    paths: await OpenAPI.getPaths(),
  },
})
