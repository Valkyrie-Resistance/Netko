import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute({
  beforeLoad: ({ context }: { context: AuthRouterContext }) => {
    if (context.auth.session) {
      throw redirect({ to: '/chat' })
    }
    throw redirect({ to: '/auth' })
  },
})
