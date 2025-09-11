import type { AppRouter } from '@netko/brain'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, createWSClient, httpBatchLink, wsLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import superjson from 'superjson'
import { authClient } from './auth'

export const queryClient = new QueryClient()

//* TRPC HTTP Client
const trpcHttpClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })],
})

//* WS Client
export const wsClient = createWSClient({
  url: '/ws',
  connectionParams: async () => {
    // Always attempt to refresh/get the current session via Better Auth
    // This ensures a fresh ws JWT is set into localStorage by onResponse()
    try {
      await authClient.getSession()
    } catch (_) {
      // ignore; if it fails, we fallback to whatever is in localStorage
    }

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
