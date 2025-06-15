import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { useAuth } from '@/providers/auth-provider'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const { session, isPending } = useAuth()

  if (!isPending && session) {
    return <Navigate to="/chat" />
  }

  if (!isPending && !session) {
    return <Navigate to="/auth" />
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <BarsSpinner />
    </div>
  )
}

export default Index
