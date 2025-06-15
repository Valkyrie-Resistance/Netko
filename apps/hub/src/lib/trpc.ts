import type { AppRouter } from '@chad-chat/brain'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

export const queryClient = new QueryClient()

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: `${import.meta.env.VITE_AUTH_API_URL}/api/trpc` })],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})
