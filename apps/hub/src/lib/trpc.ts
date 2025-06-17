import type { AppRouter } from '@chad-chat/brain'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, createWSClient, httpBatchLink, wsLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

export const queryClient = new QueryClient()

export const trpcHttpClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
})

export const trpcHttp = createTRPCOptionsProxy<AppRouter>({
  client: trpcHttpClient,
  queryClient,
})

export const wsClient = createWSClient({
  url: '/ws',
})

export const trpcWsClient = createTRPCClient<AppRouter>({
  links: [wsLink({ client: wsClient })],
})

export const trpcWs = createTRPCOptionsProxy<AppRouter>({
  client: trpcWsClient,
  queryClient,
})
