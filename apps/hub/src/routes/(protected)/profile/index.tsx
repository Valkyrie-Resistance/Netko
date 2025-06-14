import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute({
  beforeLoad: ({ context }: { context: AuthRouterContext }) => {
    if (!context.auth.session) {
      throw redirect({ to: '/auth' })
    }
  },
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
