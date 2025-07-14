import type { AppRouter } from '@netko/brain'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, createWSClient, httpBatchLink, wsLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import superjson from 'superjson'

export const queryClient = new QueryClient()

//* TRPC HTTP Client
const trpcHttpClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })],
})

//* WS Client
export const wsClient = createWSClient({
  url: '/ws',
  connectionParams: async () => {
    const token = localStorage.getItem('ws-auth-jwt')
    return {
      token: token ?? '',
    }
  },
})

//* TRPC WS Client
export const trpcWsClient = createTRPCClient<AppRouter>({
  links: [wsLink({ client: wsClient, transformer: superjson })],
})

//* TRPC HTTP Client
export const trpcHttp = createTRPCOptionsProxy<AppRouter>({
  client: trpcHttpClient,
  queryClient,
})

//* TRPC WS Client
export const trpcWs = createTRPCOptionsProxy<AppRouter>({
  client: trpcWsClient,
  queryClient,
})
