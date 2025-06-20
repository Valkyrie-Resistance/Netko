import type { AppRouter } from '@netko/brain'
import { QueryClient } from '@tanstack/react-query'
import {
  createTRPCClient,
  createWSClient,
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
  wsLink,
} from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

export const queryClient = new QueryClient()

const trpcHttpClient = createTRPCClient<AppRouter>({
  /**
   * @see https://trpc.io/docs/v11/client/links
   */
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: '/api/trpc',
        eventSourceOptions() {
          return {
            withCredentials: true,
          }
        },
      }),
      false: httpBatchLink({
        url: '/api/trpc',
      }),
    }),
  ],
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
