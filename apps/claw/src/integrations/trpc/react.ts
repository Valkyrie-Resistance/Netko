import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { AppRouter } from '@/trpc'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
